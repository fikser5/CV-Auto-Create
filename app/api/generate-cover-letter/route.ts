import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { generateCoverLetterContent } from "@/lib/claude";
import { isPremiumActive } from "@/lib/plan";

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
      select: { plan: true, planRenewsAt: true, freeGenerationUsed: true, purchasedCredits: true, hasEverPurchased: true },
    }),
    prisma.profile.findUnique({
      where: { userId },
      include: { experiences: true, education: true, skills: true, interests: true },
    }),
    prisma.jobPosting.findUnique({ where: { id: jobPostingId } }),
  ]);

  if (!isPremiumActive(user)) {
    return Response.json(
      {
        error: "Generowanie listu motywacyjnego to funkcja Premium.",
        premiumRequired: true,
      },
      { status: 403 },
    );
  }

  if (!jobPosting || jobPosting.userId !== userId) {
    return Response.json({ error: "Nie znaleziono oferty pracy." }, { status: 404 });
  }
  if (!profile || profile.experiences.length === 0) {
    return Response.json(
      { error: "Uzupełnij najpierw profil (przynajmniej jedno doświadczenie zawodowe)." },
      { status: 422 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Generator nie jest jeszcze skonfigurowany (brak klucza ANTHROPIC_API_KEY w .env)." },
      { status: 503 },
    );
  }

  let content;
  try {
    content = await generateCoverLetterContent(
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
      { companyName: jobPosting.companyName, jobTitle: jobPosting.jobTitle },
    );
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "Generator nie jest jeszcze skonfigurowany (brak lub nieprawidłowy klucz ANTHROPIC_API_KEY)." },
        { status: 503 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: `Błąd generowania listu: ${error.message}` }, { status: 502 });
    }
    throw error;
  }

  const generatedCoverLetter = await prisma.generatedCoverLetter.create({
    data: { userId, jobPostingId, contentJson: content },
  });

  return Response.json({ generatedCoverLetter }, { status: 201 });
}
