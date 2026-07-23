import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/app/components/AppNav";
import { GeneratedCvContentSchema } from "@/lib/cv-schema";
import { card, eyebrow, badge } from "@/lib/ui";
import { LanguageLevelLabels } from "@/lib/definitions";
import { ArrowRightIcon, FileTextIcon, CheckCircleIcon, ExternalLinkIcon } from "@/app/components/icons";

function formatDate(date: Date): string {
  return date.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("pl-PL");
}

function getMatchScore(contentJson: unknown): number | null {
  const parsed = GeneratedCvContentSchema.safeParse(contentJson);
  if (!parsed.success || !parsed.data.matchSummary) return null;
  return parsed.data.matchScore;
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;

  const currentUser = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { isAdmin: true } });
  if (!currentUser.isAdmin) {
    redirect("/dashboard");
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      plan: true,
      planRenewsAt: true,
      purchasedCredits: true,
      emailVerifiedAt: true,
      isAdmin: true,
      createdAt: true,
      profile: {
        include: {
          experiences: { orderBy: { orderIndex: "asc" } },
          education: true,
          skills: true,
          interests: true,
          languages: { orderBy: { orderIndex: "asc" } },
        },
      },
      generatedCvs: { include: { jobPosting: true }, orderBy: { createdAt: "desc" } },
      generatedCoverLetters: { include: { jobPosting: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!target) {
    notFound();
  }

  const profile = target.profile;

  return (
    <>
      <AppNav isAdmin />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            ← Wróć do panelu
          </Link>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className={eyebrow}>Podgląd konta (tylko do odczytu)</span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">{target.fullName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{target.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  target.plan === "premium" ? "bg-accent-soft text-accent-soft-foreground" : "bg-border text-muted-foreground"
                }`}
              >
                {target.plan === "premium" ? "Premium" : "Darmowy"}
              </span>
              {target.purchasedCredits > 0 && <span className={badge}>+{target.purchasedCredits} kredytów</span>}
              {target.emailVerifiedAt && (
                <span className={badge}>
                  <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                  Zweryfikowany
                </span>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Konto założone {formatDate(target.createdAt)}.</p>
        </div>

        {/* Profil */}
        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="font-semibold">Profil zawodowy</h2>
          {!profile ? (
            <p className="text-sm text-muted-foreground">Brak uzupełnionego profilu.</p>
          ) : (
            <div className="flex flex-col gap-5 text-sm">
              <div>
                <p className="font-medium">{profile.headline || "(brak nagłówka)"}</p>
                {profile.summary && <p className="mt-1 text-muted-foreground">{profile.summary}</p>}
                <p className="mt-1 text-muted-foreground">
                  {[profile.location, profile.phone, profile.linkedinUrl].filter(Boolean).join(" · ") || "Brak danych kontaktowych"}
                </p>
              </div>

              {profile.experiences.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Doświadczenie</p>
                  <ul className="flex flex-col gap-2">
                    {profile.experiences.map((e) => (
                      <li key={e.id}>
                        <p className="font-medium">
                          {e.position} — {e.companyName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatShortDate(e.startDate)} – {e.endDate ? formatShortDate(e.endDate) : "obecnie"}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.education.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wykształcenie</p>
                  <ul className="flex flex-col gap-2">
                    {profile.education.map((e) => (
                      <li key={e.id}>
                        <p className="font-medium">
                          {e.schoolName}
                          {e.degree ? ` — ${e.degree}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatShortDate(e.startDate)} – {e.endDate ? formatShortDate(e.endDate) : "obecnie"}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.skills.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Umiejętności</p>
                  <p>{profile.skills.map((s) => s.name).join(", ")}</p>
                </div>
              )}

              {profile.languages.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Języki</p>
                  <p>{profile.languages.map((l) => `${l.name} (${LanguageLevelLabels[l.level]})`).join(", ")}</p>
                </div>
              )}

              {profile.interests.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Zainteresowania</p>
                  <p>{profile.interests.map((i) => i.name).join(", ")}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* CV */}
        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="font-semibold">Wygenerowane CV ({target.generatedCvs.length})</h2>
          {target.generatedCvs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak wygenerowanych CV.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {target.generatedCvs.map((cv) => {
                const matchScore = getMatchScore(cv.contentJson);
                return (
                  <li key={cv.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-foreground">
                        <FileTextIcon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {cv.jobPosting.jobTitle || "CV bez podanego stanowiska"}
                          {cv.jobPosting.companyName ? ` @ ${cv.jobPosting.companyName}` : ""}
                          {matchScore !== null && (
                            <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-soft-foreground">
                              {matchScore}%
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(cv.createdAt)}</p>
                      </div>
                    </div>
                    <a
                      href={`/api/cv/${cv.id}/export`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      PDF
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Listy motywacyjne */}
        <section className={`${card} flex flex-col gap-4`}>
          <h2 className="font-semibold">Listy motywacyjne ({target.generatedCoverLetters.length})</h2>
          {target.generatedCoverLetters.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak wygenerowanych listów.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {target.generatedCoverLetters.map((letter) => (
                <li key={letter.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-soft text-rose-soft-foreground">
                      <FileTextIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {letter.jobPosting.jobTitle || "List bez podanego stanowiska"}
                        {letter.jobPosting.companyName ? ` @ ${letter.jobPosting.companyName}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(letter.createdAt)}</p>
                    </div>
                  </div>
                  <a
                    href={`/api/cover-letter/${letter.id}/export`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
                  >
                    PDF
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover">
          Wróć do listy użytkowników
          <ArrowRightIcon />
        </Link>
      </main>
    </>
  );
}
