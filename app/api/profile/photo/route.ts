import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { getOrCreateProfileId } from "@/lib/profile";
import { PhotoUploadSchema } from "@/lib/definitions";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const body = await request.json();
  const validatedFields = PhotoUploadSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
  }

  const profileId = await getOrCreateProfileId(userId);
  const profile = await prisma.profile.update({
    where: { id: profileId },
    data: { photoUrl: validatedFields.data.photo },
  });

  return Response.json({ photoUrl: profile.photoUrl });
}

export async function DELETE() {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const profileId = await getOrCreateProfileId(userId);
  await prisma.profile.update({ where: { id: profileId }, data: { photoUrl: null } });

  return new Response(null, { status: 204 });
}
