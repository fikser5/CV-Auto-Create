import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { getOrCreateProfileId } from "@/lib/profile";
import { LanguageSchema } from "@/lib/definitions";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const body = await request.json();
  const validatedFields = LanguageSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, level } = validatedFields.data;
  const profileId = await getOrCreateProfileId(userId);

  const language = await prisma.language.create({
    data: { profileId, name, level },
  });

  return Response.json({ language }, { status: 201 });
}
