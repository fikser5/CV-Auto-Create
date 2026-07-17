import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/app/components/AppNav";

export default async function DashboardPage() {
  const { userId } = await verifySession();
  const [user, profile, cvCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { fullName: true, email: true },
    }),
    prisma.profile.findUnique({
      where: { userId },
      select: { _count: { select: { experiences: true, skills: true } } },
    }),
    prisma.generatedCv.count({ where: { userId } }),
  ]);

  const profileReady = (profile?._count.experiences ?? 0) > 0;

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <div>
          <p className="text-sm text-muted-foreground">Witaj z powrotem</p>
          <h1 className="text-3xl font-bold tracking-tight">{user.fullName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col justify-between gap-4 rounded-card border border-border bg-card p-6">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${profileReady ? "bg-emerald-500" : "bg-amber-500"}`}
                />
                <h2 className="font-semibold">Profil zawodowy</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {profileReady
                  ? `${profile?._count.experiences} doświadczenie · ${profile?._count.skills} umiejętności zapisane.`
                  : "Uzupełnij doświadczenie i umiejętności, żeby móc wygenerować CV."}
              </p>
            </div>
            <Link
              href="/profile"
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent-soft hover:text-accent-soft-foreground"
            >
              {profileReady ? "Edytuj profil" : "Uzupełnij profil"} →
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-card border border-border bg-card p-6">
            <div>
              <h2 className="font-semibold">Wygenerowane CV</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {cvCount > 0
                  ? `Masz ${cvCount} wygenerowane CV dopasowane do konkretnych ofert.`
                  : "Wklej ogłoszenie o pracę, a AI dopasuje Twoje CV do jego wymagań."}
              </p>
            </div>
            <Link
              href="/generate"
              className={`inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                profileReady
                  ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                  : "cursor-not-allowed bg-border text-muted-foreground"
              }`}
            >
              Generuj CV →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
