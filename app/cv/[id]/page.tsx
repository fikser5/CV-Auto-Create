import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { GeneratedCvContentSchema } from "@/lib/cv-schema";
import { LanguageLevelLabels, LanguageLevelBars } from "@/lib/definitions";
import { isPremiumActive } from "@/lib/plan";
import { AppNav } from "@/app/components/AppNav";
import { GenerateCoverLetterButton } from "@/app/cv/[id]/GenerateCoverLetterButton";
import { buttonPrimary, buttonSecondary, badge } from "@/lib/ui";
import { CheckCircleIcon, MapPinIcon, PhoneIcon, MailIcon, GlobeIcon, LockIcon, CrownIcon } from "@/app/components/icons";

// Fixed CV document palette — intentionally independent of the app's light/dark
// theme tokens, since this must always visually match the exported PDF
// (lib/cv-pdf.tsx uses the same hex values — keep both in sync).
const DOC = {
  banner: "#2c4f61",
  bannerAccent: "#3f7188",
  bannerRoleText: "#cfe1e8",
  sidebarBg: "#e9eef1",
  heading: "#2c4f61",
  text: "#242424",
  muted: "#5b6670",
  accent: "#3f7188",
  barEmpty: "#c9d3d8",
};

const CONSENT_TEXT =
  "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu prowadzenia rekrutacji na aplikowane przeze mnie stanowisko.";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function LanguageBars({ filled }: { filled: number }) {
  return (
    <div className="mt-1.5 mb-1 flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="h-1 w-4 rounded-full"
          style={{ backgroundColor: i < filled ? DOC.accent : DOC.barEmpty }}
        />
      ))}
    </div>
  );
}

// App-chrome only — never rendered on the CV document itself (a score badge
// doesn't belong on a resume sent to an employer), so this uses the app's own
// violet/rose branding rather than the fixed DOC palette above.
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

  const parsed = GeneratedCvContentSchema.safeParse(generatedCv.contentJson);
  if (!parsed.success) {
    throw new Error("Zapisana treść CV ma nieoczekiwany format.");
  }
  const cv = parsed.data;
  const languages = profile?.languages ?? [];
  const premiumActive = isPremiumActive(user);

  return (
    <>
      <AppNav />
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
                {premiumActive
                  ? "AI napisze list dopasowany do tej samej oferty, na podstawie Twojego profilu."
                  : "Funkcja Premium — odblokuj, żeby generować listy motywacyjne dopasowane do oferty."}
              </p>
            </div>
          </div>
          {premiumActive ? (
            <GenerateCoverLetterButton jobPostingId={generatedCv.jobPostingId} />
          ) : (
            <Link href="/dashboard#plan" className={buttonSecondary}>
              Zobacz Premium
            </Link>
          )}
        </div>

        <article
          className="glow-primary overflow-hidden rounded-card border border-border shadow-sm print:border-none print:shadow-none"
          style={{ color: DOC.text }}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Sidebar */}
            <div className="shrink-0 sm:w-[35%]" style={{ backgroundColor: DOC.sidebarBg }}>
              {profile?.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt={user.fullName}
                  className="h-40 w-full object-cover sm:h-44"
                />
              ) : (
                <div
                  className="flex h-40 w-full items-center justify-center sm:h-44"
                  style={{ backgroundColor: DOC.banner }}
                >
                  <span className="text-4xl font-bold text-white">{initials(user.fullName)}</span>
                </div>
              )}

              <div className="flex flex-col gap-6 p-5">
                <div>
                  <h2
                    className="mb-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: DOC.heading }}
                  >
                    Profil osobisty
                  </h2>
                  <div className="flex flex-col gap-2.5 text-sm">
                    {profile?.location && (
                      <div className="flex items-start gap-2">
                        <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: DOC.accent }} />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="flex items-start gap-2">
                        <PhoneIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: DOC.accent }} />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MailIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: DOC.accent }} />
                      <span className="break-all">{user.email}</span>
                    </div>
                    {profile?.linkedinUrl && (
                      <div className="flex items-start gap-2">
                        <GlobeIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: DOC.accent }} />
                        <span className="break-all">{profile.linkedinUrl}</span>
                      </div>
                    )}
                  </div>
                </div>

                {cv.skills.length > 0 && (
                  <div>
                    <h2
                      className="mb-3 text-xs font-bold uppercase tracking-widest"
                      style={{ color: DOC.heading }}
                    >
                      Umiejętności
                    </h2>
                    <ul className="flex flex-col gap-1.5 text-sm">
                      {cv.skills.map((skill, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: DOC.accent }}
                          />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {cv.softSkills.length > 0 && (
                  <div>
                    <h2
                      className="mb-3 text-xs font-bold uppercase tracking-widest"
                      style={{ color: DOC.heading }}
                    >
                      Umiejętności miękkie
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {cv.softSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="rounded-full border bg-white px-2 py-1 text-xs"
                          style={{ borderColor: DOC.accent, color: DOC.heading }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {languages.length > 0 && (
                  <div>
                    <h2
                      className="mb-3 text-xs font-bold uppercase tracking-widest"
                      style={{ color: DOC.heading }}
                    >
                      Języki
                    </h2>
                    <div className="flex flex-col gap-3">
                      {languages.map((lang) => (
                        <div key={lang.id} className="text-sm">
                          <div className="flex items-baseline justify-between">
                            <span className="font-semibold">{lang.name}:</span>
                            {lang.level !== "native" && (
                              <span className="text-xs font-semibold" style={{ color: DOC.muted }}>
                                {lang.level}
                              </span>
                            )}
                          </div>
                          {lang.level === "native" ? (
                            <span className="text-xs" style={{ color: DOC.muted }}>
                              Język ojczysty
                            </span>
                          ) : (
                            <>
                              <LanguageBars filled={LanguageLevelBars[lang.level]} />
                              <span className="text-xs" style={{ color: DOC.muted }}>
                                {LanguageLevelLabels[lang.level]}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white">
              <div className="px-7 py-8" style={{ backgroundColor: DOC.banner }}>
                <h1 className="text-3xl font-bold text-white">{user.fullName}</h1>
                {cv.headline && (
                  <p
                    className="mt-2.5 text-sm uppercase tracking-[0.2em]"
                    style={{ color: DOC.bannerRoleText }}
                  >
                    {cv.headline}
                  </p>
                )}
              </div>
              <div className="h-1.5" style={{ backgroundColor: DOC.bannerAccent }} />

              <div className="flex flex-col gap-6 px-7 py-7">
                {cv.summary && (
                  <section>
                    <h2 className="mb-2.5 text-sm font-bold uppercase tracking-widest" style={{ color: DOC.heading }}>
                      Podsumowanie
                    </h2>
                    <p className="text-sm leading-relaxed">{cv.summary}</p>
                  </section>
                )}

                {cv.experience.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: DOC.heading }}>
                      Doświadczenie
                    </h2>
                    <div className="flex flex-col gap-4">
                      {cv.experience.map((item, i) => (
                        <div key={i}>
                          <p className="text-sm font-bold">
                            <span className="uppercase">{item.position}</span>,{" "}
                            <span style={{ color: DOC.muted }}>{item.period}</span>
                          </p>
                          <p className="mb-1.5 text-sm font-bold" style={{ color: DOC.accent }}>
                            {item.company}
                          </p>
                          {item.highlights.length > 0 && (
                            <ul className="flex flex-col gap-1 text-sm leading-relaxed">
                              {item.highlights.map((h, j) => (
                                <li key={j}>• {h}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {cv.education.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: DOC.heading }}>
                      Wykształcenie
                    </h2>
                    <div className="flex flex-col gap-3">
                      {cv.education.map((item, i) => (
                        <div key={i}>
                          <p className="text-sm font-bold">
                            {item.degree}, <span style={{ color: DOC.muted }}>{item.period}</span>
                          </p>
                          <p className="text-sm font-bold" style={{ color: DOC.accent }}>
                            {item.school}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <p className="text-xs leading-relaxed" style={{ color: DOC.muted }}>
                  {CONSENT_TEXT}
                </p>
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
