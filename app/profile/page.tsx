import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ProfileEditor } from "@/app/profile/ProfileEditor";
import { AppNav } from "@/app/components/AppNav";
import { buttonPrimary, eyebrow } from "@/lib/ui";
import { ArrowRightIcon } from "@/app/components/icons";

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function ProfilePage() {
  const { userId } = await verifySession();

  const [profile, user] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      include: {
        experiences: { orderBy: { orderIndex: "asc" } },
        education: true,
        skills: true,
        interests: true,
        languages: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { isAdmin: true } }),
  ]);

  const initialData = {
    headline: profile?.headline ?? "",
    summary: profile?.summary ?? "",
    location: profile?.location ?? "",
    phone: profile?.phone ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
    photoUrl: profile?.photoUrl ?? null,
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
    languages: (profile?.languages ?? []).map((l) => ({ id: l.id, name: l.name, level: l.level })),
  };

  return (
    <>
      <AppNav isAdmin={user.isAdmin} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <div>
          <span className={eyebrow}>Krok 1</span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Twój profil zawodowy</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Te dane będą wykorzystywane do generowania CV dopasowanych do ofert pracy — im więcej
            realnych szczegółów, tym trafniejsze dopasowanie.
          </p>
        </div>
        <ProfileEditor initialData={initialData} />
        <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">Gotowy profil? Przejdź do generowania CV.</p>
          <Link href="/generate" className={`${buttonPrimary} shrink-0 px-6 py-3 text-base`}>
            Dalej: wygeneruj CV
            <ArrowRightIcon />
          </Link>
        </div>
      </main>
    </>
  );
}
