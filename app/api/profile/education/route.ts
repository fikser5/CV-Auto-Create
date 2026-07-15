import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { getOrCreateProfileId } from "@/lib/profile";
import { EducationSchema } from "@/lib/definitions";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const body = await request.json();
  const validatedFields = EducationSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
  }

  const { schoolName, degree, startDate, endDate } = validatedFields.data;
  const profileId = await getOrCreateProfileId(userId);

  const education = await prisma.education.create({
    data: {
      profileId,
      schoolName,
      degree: degree || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return Response.json({ education }, { status: 201 });
}
