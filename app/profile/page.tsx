import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ProfileEditor } from "@/app/profile/ProfileEditor";

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function ProfilePage() {
  const { userId } = await verifySession();

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      experiences: { orderBy: { orderIndex: "asc" } },
      education: true,
      skills: true,
      interests: true,
    },
  });

  const initialData = {
    headline: profile?.headline ?? "",
    summary: profile?.summary ?? "",
    location: profile?.location ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
    experiences: (profile?.experiences ?? []).map((e) => ({
      id: e.id,
      companyName: e.companyName,
      position: e.position,
      description: e.description ?? "",
      startDate: toDateInputValue(e.startDate),
      endDate: toDateInputValue(e.endDate),
    })),
    education: (profile?.education ?? []).map((e) => ({
      id: e.id,
      schoolName: e.schoolName,
      degree: e.degree ?? "",
      startDate: toDateInputValue(e.startDate),
      endDate: toDateInputValue(e.endDate),
    })),
    skills: (profile?.skills ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      level: s.level,
      category: s.category ?? "",
    })),
    interests: (profile?.interests ?? []).map((i) => ({ id: i.id, name: i.name })),
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-10 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Twój profil zawodowy</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Te dane będą wykorzystywane do generowania CV dopasowanych do ofert pracy.
        </p>
      </div>
      <ProfileEditor initialData={initialData} />
    </main>
  );
}
