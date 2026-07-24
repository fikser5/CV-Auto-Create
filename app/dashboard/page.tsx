import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/app/components/AppNav";
import { resendVerificationEmail } from "@/app/actions/auth";
import { describePlanStatus, PREMIUM_MONTHLY_PRICE_PLN, PACKAGE_PRICE_PLN, PACKAGE_CREDITS } from "@/lib/plan";
import { buttonPrimary as buttonPrimaryClass, buttonSecondary as buttonSecondaryClass } from "@/lib/ui";
import {
  FileTextIcon,
  TargetIcon,
  ArrowRightIcon,
  SparklesIcon,
  CrownIcon,
  CheckCircleIcon,
  MailIcon,
} from "@/app/components/icons";

function ComingSoonButton({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div className="relative mt-auto">
      <span className="absolute -top-2 -right-2 rounded-full bg-rose px-2 py-0.5 text-[10px] font-bold text-white shadow">
        WKRÓTCE
      </span>
      <button type="button" disabled className={`${className} w-full cursor-not-allowed`}>
        {children}
      </button>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ verification?: string }>;
}) {
  const { userId } = await verifySession();
  const { verification } = await searchParams;
  const [user, profile, cvCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        fullName: true,
        email: true,
        plan: true,
        planRenewsAt: true,
        freeGenerationUsed: true,
        purchasedCredits: true,
        hasEverPurchased: true,
        emailVerifiedAt: true,
        isAdmin: true,
      },
    }),
    prisma.profile.findUnique({
      where: { userId },
      select: { _count: { select: { experiences: true, skills: true } } },
    }),
    prisma.generatedCv.count({ where: { userId } }),
  ]);

  const profileReady = (profile?._count.experiences ?? 0) > 0;
  const firstName = user.fullName.split(" ")[0];
  const planStatus = describePlanStatus(user);

  return (
    <>
      <AppNav isAdmin={user.isAdmin} />
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

        {!planStatus.emailVerified && (
          <div
            className={`flex flex-wrap items-center justify-between gap-3 rounded-card border p-5 ${
              verification === "error" ? "border-danger/30 bg-danger-soft" : "border-primary/30 bg-accent-soft"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card ${
                  verification === "error" ? "text-danger" : "text-accent-soft-foreground"
                }`}
              >
                <MailIcon className="h-4 w-4" />
              </span>
              <div>
                <p className={`text-sm font-semibold ${verification === "error" ? "text-danger" : "text-accent-soft-foreground"}`}>
                  {verification === "sent"
                    ? "Link wysłany ponownie"
                    : verification === "error"
                      ? "Nie udało się wysłać maila"
                      : "Potwierdź adres e-mail"}
                </p>
                <p className={`mt-0.5 text-sm ${verification === "error" ? "text-danger" : "text-accent-soft-foreground"}`}>
                  {verification === "sent"
                    ? "Sprawdź skrzynkę (też SPAM) i kliknij link, żeby odblokować generowanie CV."
                    : verification === "error"
                      ? "Wystąpił błąd przy wysyłce. Spróbuj ponownie za chwilę."
                      : "Sprawdź skrzynkę i kliknij link, żeby móc generować CV."}
                </p>
              </div>
            </div>
            <form action={resendVerificationEmail}>
              <button type="submit" className={buttonSecondaryClass}>
                Wyślij ponownie
              </button>
            </form>
          </div>
        )}

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
            <div className="flex items-center gap-4">
              {planStatus.canGenerate ? (
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
              ) : (
                <Link
                  href="#plan"
                  className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent-soft hover:text-accent-soft-foreground"
                >
                  Wykorzystano limit — zobacz plany
                  <ArrowRightIcon />
                </Link>
              )}
              {cvCount > 0 && (
                <Link
                  href="/cv"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Zobacz historię
                  <ArrowRightIcon />
                </Link>
              )}
            </div>
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

        <section id="plan" className="scroll-mt-24 flex flex-col gap-5 rounded-card border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground">
              <CrownIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">{planStatus.label}</p>
              <p className="text-sm text-muted-foreground">{planStatus.detail}</p>
            </div>
          </div>

          {!planStatus.isPremiumActive && (
            <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-accent-soft p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-accent-soft-foreground">Premium</p>
                  <p className="text-sm font-medium text-accent-soft-foreground">
                    {PREMIUM_MONTHLY_PRICE_PLN} zł<span className="font-normal">/mies.</span>
                  </p>
                </div>
                <ul className="flex flex-col gap-1.5 text-sm text-accent-soft-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    Nielimitowane generowanie CV
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    Pełna historia CV
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    Generowanie listu motywacyjnego dopasowanego do oferty
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    Więcej szablonów wizualnych CV (wkrótce)
                  </li>
                </ul>
                <ComingSoonButton className={buttonPrimaryClass}>Wybierz Premium</ComingSoonButton>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-border p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Pakiet</p>
                  <p className="text-sm font-medium text-muted-foreground">{PACKAGE_PRICE_PLN} zł jednorazowo</p>
                </div>
                <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {PACKAGE_CREDITS} dodatkowe wygenerowania CV
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Dostęp do historii CV
                  </li>
                </ul>
                <ComingSoonButton className={buttonSecondaryClass}>Kup pakiet</ComingSoonButton>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
