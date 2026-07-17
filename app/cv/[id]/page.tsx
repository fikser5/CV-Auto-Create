import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { GeneratedCvContentSchema } from "@/lib/cv-schema";
import { AppNav } from "@/app/components/AppNav";
import { buttonPrimary, buttonSecondary } from "@/lib/ui";

export default async function CvPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;

  const generatedCv = await prisma.generatedCv.findUnique({
    where: { id },
    include: { jobPosting: true },
  });

  if (!generatedCv || generatedCv.userId !== userId) {
    notFound();
  }

  const parsed = GeneratedCvContentSchema.safeParse(generatedCv.contentJson);
  if (!parsed.success) {
    throw new Error("Zapisana treść CV ma nieoczekiwany format.");
  }
  const cv = parsed.data;

  return (
    <>
      <AppNav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <p className="text-sm text-muted-foreground">
            Dopasowane do oferty:{" "}
            <span className="font-medium text-foreground">{generatedCv.jobPosting.jobTitle || "—"}</span>
            {generatedCv.jobPosting.companyName ? ` @ ${generatedCv.jobPosting.companyName}` : ""}
          </p>
          <div className="flex gap-3">
            <Link href="/generate" className={buttonSecondary}>
              Generuj kolejne CV
            </Link>
            <a href={`/api/cv/${generatedCv.id}/export`} className={buttonPrimary}>
              Pobierz PDF
            </a>
          </div>
        </div>

        <article className="flex flex-col gap-6 overflow-hidden rounded-card border border-border bg-white text-black shadow-sm print:border-none print:shadow-none">
          <div className="h-2 bg-primary print:hidden" />
          <div className="flex flex-col gap-6 px-10 pb-10">
            <header>
              <h1 className="text-2xl font-bold">{cv.headline}</h1>
              <p className="mt-2 text-sm leading-relaxed text-black/70">{cv.summary}</p>
            </header>

            {cv.experience.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/50">
                  Doświadczenie zawodowe
                </h2>
                <div className="flex flex-col gap-4">
                  {cv.experience.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-medium">
                          {item.position} — {item.company}
                        </p>
                        <p className="shrink-0 text-sm text-black/50">{item.period}</p>
                      </div>
                      {item.highlights.length > 0 && (
                        <ul className="mt-1 list-disc pl-5 text-sm text-black/80">
                          {item.highlights.map((h, j) => (
                            <li key={j}>{h}</li>
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
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/50">
                  Wykształcenie
                </h2>
                <div className="flex flex-col gap-2">
                  {cv.education.map((item, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-3">
                      <p className="font-medium">
                        {item.school} — {item.degree}
                      </p>
                      <p className="shrink-0 text-sm text-black/50">{item.period}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cv.skills.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/50">
                  Umiejętności
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cv.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-black/5 px-3 py-1 text-sm text-black/80 print:border print:border-black/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </main>
    </>
  );
}
