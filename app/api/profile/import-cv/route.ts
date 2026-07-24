import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { getOrCreateProfileId } from "@/lib/profile";
import { extractProfileFromCv } from "@/lib/claude";

const MAX_PDF_BYTES = 8 * 1024 * 1024;

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

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

  const profileId = await getOrCreateProfileId(userId);
  const currentProfile = await prisma.profile.findUniqueOrThrow({
    where: { id: profileId },
    include: { experiences: { orderBy: { orderIndex: "asc" } }, education: true, skills: true, interests: true, languages: true },
  });

  let extracted;
  try {
    extracted = await extractProfileFromCv(userId, base64, {
      experiences: currentProfile.experiences.map((e) => ({ companyName: e.companyName, position: e.position })),
      education: currentProfile.education.map((e) => ({ schoolName: e.schoolName, degree: e.degree })),
    });
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

  // Only fill scalar fields that are still empty — never overwrite something
  // the user already wrote by hand with data extracted from an upload.
  const profileUpdate: Record<string, string> = {};
  if (!currentProfile.headline && extracted.headline) profileUpdate.headline = extracted.headline;
  if (!currentProfile.summary && extracted.summary) profileUpdate.summary = extracted.summary;
  if (!currentProfile.location && extracted.location) profileUpdate.location = extracted.location;
  if (!currentProfile.phone && extracted.phone) profileUpdate.phone = extracted.phone;
  if (!currentProfile.linkedinUrl && extracted.linkedinUrl) profileUpdate.linkedinUrl = extracted.linkedinUrl;

  // Experiences: an extracted item matched to an existing one (same job, per
  // the model's judgment) enriches that row's description instead of adding
  // a duplicate — but only replaces it when the CV's version is clearly more
  // developed, and only once per existing row even if the model matches it
  // more than once.
  const usedExperienceIndices = new Set<number>();
  const newExperiences: typeof extracted.experiences = [];
  const experienceUpdates: { id: string; description: string }[] = [];
  for (const e of extracted.experiences) {
    const existing =
      e.matchesExistingIndex !== null &&
      e.matchesExistingIndex >= 0 &&
      e.matchesExistingIndex < currentProfile.experiences.length &&
      !usedExperienceIndices.has(e.matchesExistingIndex)
        ? currentProfile.experiences[e.matchesExistingIndex]
        : null;
    if (existing) {
      usedExperienceIndices.add(e.matchesExistingIndex as number);
      if (e.description && e.description.length > (existing.description?.length ?? 0)) {
        experienceUpdates.push({ id: existing.id, description: e.description });
      }
    } else {
      newExperiences.push(e);
    }
  }

  const usedEducationIndices = new Set<number>();
  const newEducation: typeof extracted.education = [];
  const educationUpdates: { id: string; degree: string }[] = [];
  for (const e of extracted.education) {
    const existing =
      e.matchesExistingIndex !== null &&
      e.matchesExistingIndex >= 0 &&
      e.matchesExistingIndex < currentProfile.education.length &&
      !usedEducationIndices.has(e.matchesExistingIndex)
        ? currentProfile.education[e.matchesExistingIndex]
        : null;
    if (existing) {
      usedEducationIndices.add(e.matchesExistingIndex as number);
      if (e.degree && !existing.degree) {
        educationUpdates.push({ id: existing.id, degree: e.degree });
      }
    } else {
      newEducation.push(e);
    }
  }

  // Skills/interests: simple name-based dedup (case/whitespace-insensitive)
  // against the existing profile AND within the extracted batch itself — no
  // AI judgment needed for single short strings like these.
  const existingSkillNames = new Set(currentProfile.skills.map((s) => normalizeName(s.name)));
  const newSkills = extracted.skills.filter((s) => {
    const key = normalizeName(s.name);
    if (existingSkillNames.has(key)) return false;
    existingSkillNames.add(key);
    return true;
  });

  const existingInterestNames = new Set(currentProfile.interests.map((i) => normalizeName(i.name)));
  const newInterests = extracted.interests.filter((name) => {
    const key = normalizeName(name);
    if (existingInterestNames.has(key)) return false;
    existingInterestNames.add(key);
    return true;
  });

  // Languages: same name-based match, but an existing entry with a different
  // level gets enriched (the just-uploaded CV is presumably current/accurate)
  // rather than duplicated.
  const existingLanguageByName = new Map(currentProfile.languages.map((l) => [normalizeName(l.name), l]));
  const newLanguages: typeof extracted.languages = [];
  const languageUpdates: { id: string; level: (typeof extracted.languages)[number]["level"] }[] = [];
  const seenLanguageNames = new Set<string>();
  for (const l of extracted.languages) {
    const key = normalizeName(l.name);
    if (seenLanguageNames.has(key)) continue;
    seenLanguageNames.add(key);
    const existing = existingLanguageByName.get(key);
    if (existing) {
      if (existing.level !== l.level) languageUpdates.push({ id: existing.id, level: l.level });
    } else {
      newLanguages.push(l);
    }
  }

  const existingExperienceCount = currentProfile.experiences.length;

  const [profile, createdExperiences, createdEducation, createdSkills, createdInterests, createdLanguages, ...updateResults] =
    await prisma.$transaction([
      Object.keys(profileUpdate).length > 0
        ? prisma.profile.update({ where: { id: profileId }, data: profileUpdate })
        : prisma.profile.findUniqueOrThrow({ where: { id: profileId } }),
      prisma.experience.createManyAndReturn({
        data: newExperiences.map((e, i) => ({
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
        data: newEducation.map((e) => ({
          profileId,
          schoolName: e.schoolName,
          degree: e.degree || null,
          startDate: new Date(e.startDate),
          endDate: e.endDate ? new Date(e.endDate) : null,
        })),
      }),
      prisma.skill.createManyAndReturn({
        data: newSkills.map((s) => ({ profileId, name: s.name, category: s.category || null })),
      }),
      prisma.interest.createManyAndReturn({
        data: newInterests.map((name) => ({ profileId, name })),
      }),
      prisma.language.createManyAndReturn({
        data: newLanguages.map((l) => ({ profileId, name: l.name, level: l.level })),
      }),
      ...experienceUpdates.map((u) => prisma.experience.update({ where: { id: u.id }, data: { description: u.description } })),
      ...educationUpdates.map((u) => prisma.education.update({ where: { id: u.id }, data: { degree: u.degree } })),
      ...languageUpdates.map((u) => prisma.language.update({ where: { id: u.id }, data: { level: u.level } })),
    ]);

  const updatedExperiences = updateResults.slice(0, experienceUpdates.length);
  const updatedEducation = updateResults.slice(experienceUpdates.length, experienceUpdates.length + educationUpdates.length);
  const updatedLanguages = updateResults.slice(experienceUpdates.length + educationUpdates.length);

  return Response.json(
    {
      profile,
      experiences: createdExperiences,
      education: createdEducation,
      skills: createdSkills,
      interests: createdInterests,
      languages: createdLanguages,
      updatedExperiences,
      updatedEducation,
      updatedLanguages,
      skippedCounts: {
        skills: extracted.skills.length - newSkills.length,
        interests: extracted.interests.length - newInterests.length,
      },
    },
    { status: 201 },
  );
}
