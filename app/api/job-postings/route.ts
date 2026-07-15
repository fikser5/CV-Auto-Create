import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { JobPostingSchema } from "@/lib/definitions";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const body = await request.json();
  const validatedFields = JobPostingSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
  }

  const { rawContent, sourceUrl, companyName, jobTitle } = validatedFields.data;

  const jobPosting = await prisma.jobPosting.create({
    data: {
      userId,
      rawContent,
      sourceUrl: sourceUrl || null,
      companyName: companyName || null,
      jobTitle: jobTitle || null,
    },
  });

  return Response.json({ jobPosting }, { status: 201 });
}
