import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { ProfileSchema } from "@/lib/definitions";

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      experiences: { orderBy: { orderIndex: "asc" } },
      education: true,
      skills: true,
      interests: true,
    },
  });

  return Response.json({ profile });
}

export async function PUT(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const body = await request.json();
  const validatedFields = ProfileSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
  }

  const { headline, summary, location, linkedinUrl } = validatedFields.data;

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      headline: headline || null,
      summary: summary || null,
      location: location || null,
      linkedinUrl: linkedinUrl || null,
    },
    create: {
      userId,
      headline: headline || null,
      summary: summary || null,
      location: location || null,
      linkedinUrl: linkedinUrl || null,
    },
  });

  return Response.json({ profile });
}
