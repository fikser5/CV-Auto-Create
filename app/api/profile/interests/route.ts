import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { getOrCreateProfileId } from "@/lib/profile";
import { InterestSchema } from "@/lib/definitions";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const body = await request.json();
  const validatedFields = InterestSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name } = validatedFields.data;
  const profileId = await getOrCreateProfileId(userId);

  const interest = await prisma.interest.create({
    data: { profileId, name },
  });

  return Response.json({ interest }, { status: 201 });
}
