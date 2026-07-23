import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { GeneratedCvContentSchema } from "@/lib/cv-schema";
import { renderCvToPdfBuffer } from "@/lib/cv-pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const [generatedCv, requestingUser] = await Promise.all([
    prisma.generatedCv.findUnique({ where: { id } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { isAdmin: true } }),
  ]);

  if (!generatedCv || (generatedCv.userId !== userId && !requestingUser.isAdmin)) {
    return Response.json({ error: "Nie znaleziono CV." }, { status: 404 });
  }

  // Always sourced from the CV's actual owner, not the requesting session —
  // otherwise an admin viewing someone else's CV would get their own name/
  // contact details baked into the exported PDF.
  const [user, profile] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: generatedCv.userId }, select: { fullName: true, email: true } }),
    prisma.profile.findUnique({
      where: { userId: generatedCv.userId },
      select: {
        location: true,
        phone: true,
        linkedinUrl: true,
        photoUrl: true,
        languages: { orderBy: { orderIndex: "asc" }, select: { name: true, level: true } },
      },
    }),
  ]);

  const parsed = GeneratedCvContentSchema.safeParse(generatedCv.contentJson);
  if (!parsed.success) {
    return Response.json({ error: "Zapisana treść CV ma nieoczekiwany format." }, { status: 500 });
  }

  const pdfBuffer = await renderCvToPdfBuffer({
    ...parsed.data,
    fullName: user.fullName,
    email: user.email,
    phone: profile?.phone ?? null,
    location: profile?.location ?? null,
    linkedinUrl: profile?.linkedinUrl ?? null,
    photoUrl: profile?.photoUrl ?? null,
    languages: profile?.languages ?? [],
  });

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cv-${generatedCv.id}.pdf"`,
    },
  });
}
