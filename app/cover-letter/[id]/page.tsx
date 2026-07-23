import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { GeneratedCoverLetterContentSchema } from "@/lib/cover-letter-schema";
import { AppNav } from "@/app/components/AppNav";
import { buttonPrimary, buttonSecondary, badge } from "@/lib/ui";
import { FileTextIcon } from "@/app/components/icons";

export default async function CoverLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id } = await params;

  const [generatedCoverLetter, user, profile] = await Promise.all([
    prisma.generatedCoverLetter.findUnique({ where: { id }, include: { jobPosting: true } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { fullName: true, email: true, isAdmin: true } }),
    prisma.profile.findUnique({ where: { userId }, select: { location: true, phone: true } }),
  ]);

  if (!generatedCoverLetter || generatedCoverLetter.userId !== userId) {
    notFound();
  }

  const parsed = GeneratedCoverLetterContentSchema.safeParse(generatedCoverLetter.contentJson);
  if (!parsed.success) {
    throw new Error("Zapisana treść listu ma nieoczekiwany format.");
  }
  const letter = parsed.data;
  const dateLabel = generatedCoverLetter.createdAt.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <AppNav isAdmin={user.isAdmin} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <span className={badge}>
              <FileTextIcon className="h-3.5 w-3.5 text-primary" />
              List motywacyjny
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {generatedCoverLetter.jobPosting.jobTitle || "—"}
              </span>
              {generatedCoverLetter.jobPosting.companyName ? ` @ ${generatedCoverLetter.jobPosting.companyName}` : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href={`/generate`} className={buttonSecondary}>
              Wróć do generatora
            </Link>
            <a href={`/api/cover-letter/${generatedCoverLetter.id}/export`} className={buttonPrimary}>
              Pobierz PDF
            </a>
          </div>
        </div>

        <article className="glow-primary overflow-hidden rounded-card border border-border bg-white p-10 text-black shadow-sm print:border-none print:shadow-none">
          <div className="flex flex-col gap-0.5 text-sm">
            <p className="text-base font-bold" style={{ color: "#2c4f61" }}>
              {user.fullName}
            </p>
            {profile?.location && <p className="text-black/60">{profile.location}</p>}
            <p className="text-black/60">{user.email}</p>
            {profile?.phone && <p className="text-black/60">{profile.phone}</p>}
          </div>

          <p className="mt-7 text-right text-sm text-black/60">{dateLabel}</p>

          <p className="mt-6 font-bold" style={{ color: "#2c4f61" }}>
            {letter.subject}
          </p>

          <p className="mt-4 text-sm leading-relaxed">{letter.recipientLine}</p>

          <div className="mt-3 flex flex-col gap-3.5 text-sm leading-relaxed">
            {letter.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <p className="mt-3.5 text-sm leading-relaxed">{letter.closing}</p>

          <div className="mt-8 text-sm">
            <p>Z poważaniem,</p>
            <p className="mt-6 font-semibold">{user.fullName}</p>
          </div>
        </article>
      </main>
    </>
  );
}
