import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { GeneratedCvContentSchema } from "@/lib/cv-schema";
import { renderCvToPdfBuffer } from "@/lib/cv-pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const generatedCv = await prisma.generatedCv.findUnique({ where: { id } });
  if (!generatedCv || generatedCv.userId !== userId) {
    return Response.json({ error: "Nie znaleziono CV." }, { status: 404 });
  }

  const parsed = GeneratedCvContentSchema.safeParse(generatedCv.contentJson);
  if (!parsed.success) {
    return Response.json({ error: "Zapisana treść CV ma nieoczekiwany format." }, { status: 500 });
  }

  const pdfBuffer = await renderCvToPdfBuffer(parsed.data);

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cv-${generatedCv.id}.pdf"`,
    },
  });
}
