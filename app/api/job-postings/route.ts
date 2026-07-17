import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { JobPostingSchema } from "@/lib/definitions";
import { fetchJobPostingText } from "@/lib/fetch-job-posting";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;

  const body = await request.json();
  const validatedFields = JobPostingSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 });
  }

  const { sourceUrl, companyName, jobTitle } = validatedFields.data;
  let rawContent = validatedFields.data.rawContent?.trim() || "";

  // A bare link with no pasted content — fetch and extract the posting text
  // server-side (the browser can't fetch arbitrary third-party sites due to
  // CORS, and Claude has no browsing capability of its own here).
  if (rawContent.length < 50 && sourceUrl) {
    try {
      rawContent = await fetchJobPostingText(sourceUrl);
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "Nie udało się pobrać treści oferty spod linku." },
        { status: 422 },
      );
    }
  }

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
