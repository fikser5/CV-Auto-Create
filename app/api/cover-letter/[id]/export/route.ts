import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { GeneratedCoverLetterContentSchema } from "@/lib/cover-letter-schema";
import { renderCoverLetterToPdfBuffer } from "@/lib/cover-letter-pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const [generatedCoverLetter, requestingUser] = await Promise.all([
    prisma.generatedCoverLetter.findUnique({ where: { id } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { isAdmin: true } }),
  ]);

  if (!generatedCoverLetter || (generatedCoverLetter.userId !== userId && !requestingUser.isAdmin)) {
    return Response.json({ error: "Nie znaleziono listu motywacyjnego." }, { status: 404 });
  }

  // Always sourced from the letter's actual owner, not the requesting
  // session — see the identical fix in the CV export route.
  const [user, profile] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: generatedCoverLetter.userId }, select: { fullName: true, email: true } }),
    prisma.profile.findUnique({ where: { userId: generatedCoverLetter.userId }, select: { location: true, phone: true } }),
  ]);

  const parsed = GeneratedCoverLetterContentSchema.safeParse(generatedCoverLetter.contentJson);
  if (!parsed.success) {
    return Response.json({ error: "Zapisana treść listu ma nieoczekiwany format." }, { status: 500 });
  }

  const pdfBuffer = await renderCoverLetterToPdfBuffer({
    ...parsed.data,
    fullName: user.fullName,
    email: user.email,
    phone: profile?.phone ?? null,
    location: profile?.location ?? null,
  });

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="list-motywacyjny-${generatedCoverLetter.id}.pdf"`,
    },
  });
}
