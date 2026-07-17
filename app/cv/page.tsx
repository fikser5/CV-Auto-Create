import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/app/components/AppNav";
import { buttonPrimary, eyebrow } from "@/lib/ui";
import { FileTextIcon, ArrowRightIcon, ExternalLinkIcon } from "@/app/components/icons";

function formatDate(date: Date): string {
  return date.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
}

export default async function CvHistoryPage() {
  const { userId } = await verifySession();

  const generatedCvs = await prisma.generatedCv.findMany({
    where: { userId },
    include: { jobPosting: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className={eyebrow}>Historia</span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Wygenerowane CV</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Wszystkie CV wygenerowane dla Twojego profilu, od najnowszego.
            </p>
          </div>
          <Link href="/generate" className={buttonPrimary}>
            Generuj nowe CV
          </Link>
        </div>

        {generatedCvs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-soft-foreground">
              <FileTextIcon className="h-6 w-6" />
            </span>
            <p className="text-sm text-muted-foreground">
              Nie masz jeszcze żadnego wygenerowanego CV. Wklej ogłoszenie o pracę, aby zacząć.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {generatedCvs.map((cv) => (
              <li key={cv.id} className="card-hover rounded-card border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-foreground">
                      <FileTextIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold">
                        {cv.jobPosting.jobTitle || "CV bez podanego stanowiska"}
                        {cv.jobPosting.companyName ? ` @ ${cv.jobPosting.companyName}` : ""}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Wygenerowano {formatDate(cv.createdAt)}
                        {cv.jobPosting.sourceUrl && (
                          <>
                            {" · "}
                            <a
                              href={cv.jobPosting.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:text-primary-hover"
                            >
                              Oferta <ExternalLinkIcon className="h-3 w-3" />
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/cv/${cv.id}`}
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
                  >
                    Zobacz CV
                    <ArrowRightIcon />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
