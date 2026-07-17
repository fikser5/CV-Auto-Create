import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const language = await prisma.language.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!language || language.profile.userId !== userId) {
    return Response.json({ error: "Nie znaleziono wpisu." }, { status: 404 });
  }

  await prisma.language.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
