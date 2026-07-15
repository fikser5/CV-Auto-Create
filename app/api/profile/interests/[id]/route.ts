import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const interest = await prisma.interest.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!interest || interest.profile.userId !== userId) {
    return Response.json({ error: "Nie znaleziono wpisu." }, { status: 404 });
  }

  await prisma.interest.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
