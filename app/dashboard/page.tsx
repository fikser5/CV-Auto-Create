import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/app/components/AppNav";
import { FileTextIcon, TargetIcon, ArrowRightIcon, SparklesIcon } from "@/app/components/icons";

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
  const firstName = user.fullName.split(" ")[0];

  return (
    <>
      <AppNav />
      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_60%_60%_at_20%_0%,var(--accent-soft),transparent)]"
        />

        <div>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <SparklesIcon className="h-3.5 w-3.5 text-primary" />
            Witaj z powrotem
          </span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Cześć, <span className="font-display text-4xl italic font-normal text-gradient">{firstName}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card-hover flex flex-col justify-between gap-5 rounded-card border border-border bg-card p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-foreground">
                  <TargetIcon className="h-5 w-5" />
                </span>
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    profileReady
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${profileReady ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {profileReady ? "Gotowy" : "Do uzupełnienia"}
                </span>
              </div>
              <h2 className="mt-4 font-semibold">Profil zawodowy</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {profileReady
                  ? `${profile?._count.experiences} doświadczenie · ${profile?._count.skills} umiejętności zapisane.`
                  : "Uzupełnij doświadczenie i umiejętności, żeby móc wygenerować CV."}
              </p>
            </div>
            <Link
              href="/profile"
              className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
            >
              {profileReady ? "Edytuj profil" : "Uzupełnij profil"}
              <ArrowRightIcon />
            </Link>
          </div>

          <div className="card-hover flex flex-col justify-between gap-5 rounded-card border border-border bg-card p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-soft text-rose-soft-foreground">
                  <FileTextIcon className="h-5 w-5" />
                </span>
                {cvCount > 0 && (
                  <span className="rounded-full bg-rose-soft px-2.5 py-1 text-xs font-medium text-rose-soft-foreground">
                    {cvCount} wygenerowane
                  </span>
                )}
              </div>
              <h2 className="mt-4 font-semibold">Wygenerowane CV</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {cvCount > 0
                  ? `Masz ${cvCount} wygenerowane CV dopasowane do konkretnych ofert.`
                  : "Wklej ogłoszenie o pracę, a AI dopasuje Twoje CV do jego wymagań."}
              </p>
            </div>
            <Link
              href="/generate"
              className={`inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                profileReady
                  ? "bg-gradient-brand text-primary-foreground hover:brightness-110"
                  : "cursor-not-allowed bg-border text-muted-foreground"
              }`}
            >
              Generuj CV
              <ArrowRightIcon />
            </Link>
          </div>
        </div>

        {!profileReady && (
          <div className="flex items-start gap-3 rounded-card border border-dashed border-border p-5 text-sm text-muted-foreground">
            <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Zacznij od uzupełnienia profilu — im więcej realnych doświadczeń, umiejętności i
              osiągnięć tam dodasz, tym trafniej AI dopasuje CV do kolejnych ofert.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
