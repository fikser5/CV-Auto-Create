import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { getOrCreateProfileId } from "@/lib/profile";
import { ExperienceSchema } from "@/lib/definitions";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const body = await request.json();
  const validatedFields = ExperienceSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
  }

  const { companyName, position, description, startDate, endDate } = validatedFields.data;
  const profileId = await getOrCreateProfileId(userId);
  const orderIndex = await prisma.experience.count({ where: { profileId } });

  const experience = await prisma.experience.create({
    data: {
      profileId,
      companyName,
      position,
      description: description || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      orderIndex,
    },
  });

  return Response.json({ experience }, { status: 201 });
}
