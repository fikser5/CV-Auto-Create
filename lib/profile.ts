import "server-only";
import { prisma } from "@/lib/prisma";

export async function getOrCreateProfileId(userId: string): Promise<string> {
  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });
  return profile.id;
}
