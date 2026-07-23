import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { generateCvContent } from "@/lib/claude";
import { checkGenerationAllowance, consumeGenerationAllowance } from "@/lib/plan";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const body = await request.json();
  const jobPostingId = body?.jobPostingId;
  if (typeof jobPostingId !== "string") {
    return Response.json({ error: "Brak jobPostingId." }, { status: 400 });
  }

  const [user, profile, jobPosting] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        plan: true,
        planRenewsAt: true,
        freeGenerationUsed: true,
        purchasedCredits: true,
        hasEverPurchased: true,
        emailVerifiedAt: true,
      },
    }),
    prisma.profile.findUnique({
      where: { userId },
      include: { experiences: true, education: true, skills: true, interests: true },
    }),
    prisma.jobPosting.findUnique({ where: { id: jobPostingId } }),
  ]);

  if (!jobPosting || jobPosting.userId !== userId) {
    return Response.json({ error: "Nie znaleziono oferty pracy." }, { status: 404 });
  }
  if (!profile || profile.experiences.length === 0) {
    return Response.json(
      { error: "Uzupełnij najpierw profil (przynajmniej jedno doświadczenie zawodowe)." },
      { status: 422 },
    );
  }

  const allowance = checkGenerationAllowance(user);
  if (!allowance.allowed) {
    if (allowance.reason === "email_not_verified") {
      return Response.json(
        {
          error: "Potwierdź adres e-mail, żeby wygenerować CV. Sprawdź skrzynkę (też SPAM).",
          emailNotVerified: true,
        },
        { status: 403 },
      );
    }
    return Response.json(
      {
        error: "Wykorzystano darmowe CV. Wykup Premium albo pakiet, żeby generować kolejne.",
        limitReached: true,
      },
      { status: 402 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Generator CV nie jest jeszcze skonfigurowany (brak klucza ANTHROPIC_API_KEY w .env)." },
      { status: 503 },
    );
  }

  let content;
  try {
    content = await generateCvContent(
      userId,
      {
        headline: profile.headline,
        summary: profile.summary,
        location: profile.location,
        experiences: profile.experiences.map((e) => ({
          companyName: e.companyName,
          position: e.position,
          description: e.description,
          startDate: e.startDate.toISOString().slice(0, 10),
          endDate: e.endDate ? e.endDate.toISOString().slice(0, 10) : null,
        })),
        education: profile.education.map((e) => ({
          schoolName: e.schoolName,
          degree: e.degree,
          startDate: e.startDate.toISOString().slice(0, 10),
          endDate: e.endDate ? e.endDate.toISOString().slice(0, 10) : null,
        })),
        skills: profile.skills.map((s) => ({ name: s.name, level: s.level, category: s.category })),
        interests: profile.interests.map((i) => ({ name: i.name })),
      },
      jobPosting.rawContent,
    );
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "Generator CV nie jest jeszcze skonfigurowany (brak lub nieprawidłowy klucz ANTHROPIC_API_KEY)." },
        { status: 503 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: `Błąd generowania CV: ${error.message}` }, { status: 502 });
    }
    throw error;
  }

  const version = await prisma.generatedCv.count({ where: { jobPostingId } });

  const generatedCv = await prisma.generatedCv.create({
    data: {
      userId,
      jobPostingId,
      contentJson: content,
      templateId: "default",
      version: version + 1,
    },
  });

  // Only spend the free generation / a credit once generation has actually
  // succeeded and been saved — a failed Claude call shouldn't cost the user.
  await consumeGenerationAllowance(userId, allowance);

  // Backfill the job posting's title/company from what the model detected in
  // the posting text, but only fields the user left blank — never overwrite
  // something they typed in by hand. Powers the CV history list (app/cv/page.tsx)
  // without a separate extraction call, since this content is already generated.
  const jobPostingUpdate: Record<string, string> = {};
  if (!jobPosting.jobTitle && content.detectedJobTitle) jobPostingUpdate.jobTitle = content.detectedJobTitle;
  if (!jobPosting.companyName && content.detectedCompanyName) jobPostingUpdate.companyName = content.detectedCompanyName;
  if (Object.keys(jobPostingUpdate).length > 0) {
    await prisma.jobPosting.update({ where: { id: jobPostingId }, data: jobPostingUpdate });
  }

  return Response.json({ generatedCv }, { status: 201 });
}
