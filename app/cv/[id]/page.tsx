import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { GeneratedCvContentSchema } from "@/lib/cv-schema";
import { isPremiumActive } from "@/lib/plan";
import { AppNav } from "@/app/components/AppNav";
import { GenerateCoverLetterButton } from "@/app/cv/[id]/GenerateCoverLetterButton";
import { CvWorkspace } from "@/app/cv/[id]/CvWorkspace";
import { buttonPrimary, buttonSecondary, badge } from "@/lib/ui";
import { CheckCircleIcon, LockIcon, CrownIcon } from "@/app/components/icons";

// App-chrome only — never rendered on the CV document itself (a score badge
// doesn't belong on a resume sent to an employer), so this uses the app's own
// violet/rose branding rather than the selected CV template's palette.
function MatchScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id="matchScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "var(--primary)" }} />
            <stop offset="100%" style={{ stopColor: "var(--rose)" }} />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="url(#matchScoreGradient)"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm font-bold text-foreground">{score}%</span>
    </div>
  );
}

export default async function CvPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;

  const [generatedCv, user, profile] = await Promise.all([
    prisma.generatedCv.findUnique({ where: { id }, include: { jobPosting: true } }),
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
      select: {
        location: true,
        phone: true,
        linkedinUrl: true,
        photoUrl: true,
        languages: { orderBy: { orderIndex: "asc" } },
      },
    }),
  ]);

  if (!generatedCv || generatedCv.userId !== userId) {
    notFound();
  }

  const existingCoverLetter = await prisma.generatedCoverLetter.findFirst({
    where: { jobPostingId: generatedCv.jobPostingId, userId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const parsed = GeneratedCvContentSchema.safeParse(generatedCv.contentJson);
  if (!parsed.success) {
    throw new Error("Zapisana treść CV ma nieoczekiwany format.");
  }
  const cv = parsed.data;
  const languages = profile?.languages ?? [];
  const premiumActive = isPremiumActive(user);

  return (
    <>
      <AppNav isAdmin={user.isAdmin} />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <span className={badge}>
              <CheckCircleIcon className="h-3.5 w-3.5 text-primary" />
              Dopasowane do oferty
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{generatedCv.jobPosting.jobTitle || "—"}</span>
              {generatedCv.jobPosting.companyName ? ` @ ${generatedCv.jobPosting.companyName}` : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/generate" className={buttonSecondary}>
              Generuj kolejne CV
            </Link>
            <a href={`/api/cv/${generatedCv.id}/export`} className={buttonPrimary}>
              Pobierz PDF
            </a>
          </div>
        </div>

        {cv.matchSummary && (
          <div className="flex items-start gap-4 rounded-card border border-border bg-card p-5 print:hidden">
            <MatchScoreRing score={cv.matchScore} />
            <div>
              <p className="text-sm font-semibold">Dopasowanie do oferty</p>
              <p className="mt-1 text-sm text-muted-foreground">{cv.matchSummary}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-card p-5 print:hidden">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-foreground">
              {premiumActive ? <CrownIcon className="h-5 w-5" /> : <LockIcon className="h-5 w-5" />}
            </span>
            <div>
              <p className="text-sm font-semibold">List motywacyjny do tej oferty</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {existingCoverLetter
                  ? "Masz już wygenerowany list motywacyjny do tej oferty."
                  : premiumActive
                    ? "AI napisze list dopasowany do tej samej oferty, na podstawie Twojego profilu."
                    : "Funkcja Premium — odblokuj, żeby generować listy motywacyjne dopasowane do oferty."}
              </p>
            </div>
          </div>
          {existingCoverLetter ? (
            <Link href={`/cover-letter/${existingCoverLetter.id}`} className={buttonPrimary}>
              Zobacz list motywacyjny
            </Link>
          ) : premiumActive ? (
            <GenerateCoverLetterButton jobPostingId={generatedCv.jobPostingId} />
          ) : (
            <Link href="/dashboard#plan" className={buttonSecondary}>
              Zobacz Premium
            </Link>
          )}
        </div>

        <CvWorkspace
          generatedCvId={generatedCv.id}
          initialTemplateId={generatedCv.templateId}
          initialContent={cv}
          premiumActive={premiumActive}
          staticData={{
            fullName: user.fullName,
            email: user.email,
            phone: profile?.phone ?? null,
            location: profile?.location ?? null,
            linkedinUrl: profile?.linkedinUrl ?? null,
            photoUrl: profile?.photoUrl ?? null,
            languages,
          }}
        />
      </main>
    </>
  );
}
