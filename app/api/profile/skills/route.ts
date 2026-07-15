import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { getOrCreateProfileId } from "@/lib/profile";
import { SkillSchema } from "@/lib/definitions";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const body = await request.json();
  const validatedFields = SkillSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, level, category } = validatedFields.data;
  const profileId = await getOrCreateProfileId(userId);

  const skill = await prisma.skill.create({
    data: {
      profileId,
      name,
      level: level || null,
      category: category || null,
    },
  });

  return Response.json({ skill }, { status: 201 });
}
