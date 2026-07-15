import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { ExperienceSchema } from "@/lib/definitions";

async function findOwnedExperience(id: string, userId: string) {
  const experience = await prisma.experience.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!experience || experience.profile.userId !== userId) {
    return null;
  }
  return experience;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const existing = await findOwnedExperience(id, userId);
  if (!existing) {
    return Response.json({ error: "Nie znaleziono wpisu." }, { status: 404 });
  }

  const body = await request.json();
  const validatedFields = ExperienceSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
  }

  const { companyName, position, description, startDate, endDate } = validatedFields.data;
  const experience = await prisma.experience.update({
    where: { id },
    data: {
      companyName,
      position,
      description: description || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return Response.json({ experience });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const existing = await findOwnedExperience(id, userId);
  if (!existing) {
    return Response.json({ error: "Nie znaleziono wpisu." }, { status: 404 });
  }

  await prisma.experience.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
