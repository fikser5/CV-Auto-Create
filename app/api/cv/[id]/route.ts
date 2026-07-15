import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const generatedCv = await prisma.generatedCv.findUnique({
    where: { id },
    include: { jobPosting: true },
  });

  if (!generatedCv || generatedCv.userId !== userId) {
    return Response.json({ error: "Nie znaleziono CV." }, { status: 404 });
  }

  return Response.json({ generatedCv });
}
