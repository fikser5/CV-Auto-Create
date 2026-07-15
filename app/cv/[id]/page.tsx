import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { GeneratedCvContentSchema } from "@/lib/cv-schema";

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
    <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-6 p-8 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <p className="text-sm text-black/60 dark:text-white/60">
          Dopasowane do oferty: {generatedCv.jobPosting.jobTitle || "—"}
          {generatedCv.jobPosting.companyName ? ` @ ${generatedCv.jobPosting.companyName}` : ""}
        </p>
        <a
          href={`/api/cv/${generatedCv.id}/export`}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Pobierz PDF
        </a>
      </div>

      <article className="flex flex-col gap-6 rounded-lg border border-black/10 bg-white p-10 text-black shadow-sm print:border-none print:shadow-none">
        <header>
          <h1 className="text-2xl font-bold">{cv.headline}</h1>
          <p className="mt-2 text-sm leading-relaxed text-black/70">{cv.summary}</p>
        </header>

        {cv.experience.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-black/50">
              Doświadczenie zawodowe
            </h2>
            <div className="flex flex-col gap-4">
              {cv.experience.map((item, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between">
                    <p className="font-medium">
                      {item.position} — {item.company}
                    </p>
                    <p className="text-sm text-black/50">{item.period}</p>
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
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-black/50">Wykształcenie</h2>
            <div className="flex flex-col gap-2">
              {cv.education.map((item, i) => (
                <div key={i} className="flex items-baseline justify-between">
                  <p className="font-medium">
                    {item.school} — {item.degree}
                  </p>
                  <p className="text-sm text-black/50">{item.period}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {cv.skills.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-black/50">Umiejętności</h2>
            <p className="text-sm text-black/80">{cv.skills.join(" · ")}</p>
          </section>
        )}
      </article>
    </main>
  );
}
