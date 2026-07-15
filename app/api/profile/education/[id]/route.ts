import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { EducationSchema } from "@/lib/definitions";

async function findOwnedEducation(id: string, userId: string) {
  const education = await prisma.education.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!education || education.profile.userId !== userId) {
    return null;
  }
  return education;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const existing = await findOwnedEducation(id, userId);
  if (!existing) {
    return Response.json({ error: "Nie znaleziono wpisu." }, { status: 404 });
  }

  const body = await request.json();
  const validatedFields = EducationSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
  }

  const { schoolName, degree, startDate, endDate } = validatedFields.data;
  const education = await prisma.education.update({
    where: { id },
    data: {
      schoolName,
      degree: degree || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return Response.json({ education });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const existing = await findOwnedEducation(id, userId);
  if (!existing) {
    return Response.json({ error: "Nie znaleziono wpisu." }, { status: 404 });
  }

  await prisma.education.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
