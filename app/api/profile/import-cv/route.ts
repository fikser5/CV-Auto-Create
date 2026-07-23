import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { getOrCreateProfileId } from "@/lib/profile";
import { extractProfileFromCv } from "@/lib/claude";

const MAX_PDF_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Nie przesłano pliku." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return Response.json({ error: "Plik musi być w formacie PDF." }, { status: 400 });
  }
  if (file.size > MAX_PDF_BYTES) {
    return Response.json({ error: "Plik jest za duży (maks. 8 MB)." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Import CV nie jest jeszcze skonfigurowany (brak klucza ANTHROPIC_API_KEY w .env)." },
      { status: 503 },
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  let extracted;
  try {
    extracted = await extractProfileFromCv(userId, base64);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "Import CV nie jest jeszcze skonfigurowany (brak lub nieprawidłowy klucz ANTHROPIC_API_KEY)." },
        { status: 503 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: `Błąd odczytu CV: ${error.message}` }, { status: 502 });
    }
    throw error;
  }

  const profileId = await getOrCreateProfileId(userId);
  const currentProfile = await prisma.profile.findUniqueOrThrow({ where: { id: profileId } });

  // Only fill scalar fields that are still empty — never overwrite something
  // the user already wrote by hand with data extracted from an upload.
  const profileUpdate: Record<string, string> = {};
  if (!currentProfile.headline && extracted.headline) profileUpdate.headline = extracted.headline;
  if (!currentProfile.summary && extracted.summary) profileUpdate.summary = extracted.summary;
  if (!currentProfile.location && extracted.location) profileUpdate.location = extracted.location;
  if (!currentProfile.phone && extracted.phone) profileUpdate.phone = extracted.phone;
  if (!currentProfile.linkedinUrl && extracted.linkedinUrl) profileUpdate.linkedinUrl = extracted.linkedinUrl;

  const existingExperienceCount = await prisma.experience.count({ where: { profileId } });

  const [profile, experiences, education, skills, interests, languages] = await prisma.$transaction([
    Object.keys(profileUpdate).length > 0
      ? prisma.profile.update({ where: { id: profileId }, data: profileUpdate })
      : prisma.profile.findUniqueOrThrow({ where: { id: profileId } }),
    prisma.experience.createManyAndReturn({
      data: extracted.experiences.map((e, i) => ({
        profileId,
        companyName: e.companyName,
        position: e.position,
        description: e.description || null,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null,
        orderIndex: existingExperienceCount + i,
      })),
    }),
    prisma.education.createManyAndReturn({
      data: extracted.education.map((e) => ({
        profileId,
        schoolName: e.schoolName,
        degree: e.degree || null,
        startDate: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null,
      })),
    }),
    prisma.skill.createManyAndReturn({
      data: extracted.skills.map((s) => ({ profileId, name: s.name, category: s.category || null })),
    }),
    prisma.interest.createManyAndReturn({
      data: extracted.interests.map((name) => ({ profileId, name })),
    }),
    prisma.language.createManyAndReturn({
      data: extracted.languages.map((l) => ({ profileId, name: l.name, level: l.level })),
    }),
  ]);

  return Response.json({ profile, experiences, education, skills, interests, languages }, { status: 201 });
}
