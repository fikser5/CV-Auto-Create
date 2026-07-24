import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";
import { isPremiumActive } from "@/lib/plan";
import { GeneratedCvContentSchema } from "@/lib/cv-schema";
import { CV_TEMPLATES, isPremiumTemplate } from "@/lib/cv-templates";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const generatedCv = await prisma.generatedCv.findUnique({
    where: { id },
    include: { jobPosting: true },
  });

  if (!generatedCv || generatedCv.userId !== userId) {
    return Response.json({ error: "Nie znaleziono CV." }, { status: 404 });
  }

  return Response.json({ generatedCv });
}

const KNOWN_TEMPLATE_IDS = new Set(CV_TEMPLATES.map((t) => t.id));

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof Response) return userId;
  const { id } = await params;

  const generatedCv = await prisma.generatedCv.findUnique({ where: { id } });
  if (!generatedCv || generatedCv.userId !== userId) {
    return Response.json({ error: "Nie znaleziono CV." }, { status: 404 });
  }

  const body = await request.json();
  const data: { templateId?: string; contentJson?: object } = {};

  if (typeof body.templateId === "string") {
    if (!KNOWN_TEMPLATE_IDS.has(body.templateId)) {
      return Response.json({ error: "Nieznany szablon." }, { status: 400 });
    }
    if (isPremiumTemplate(body.templateId)) {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { plan: true, planRenewsAt: true, freeGenerationUsed: true, purchasedCredits: true, hasEverPurchased: true, emailVerifiedAt: true },
      });
      if (!isPremiumActive(user)) {
        return Response.json({ error: "Ten szablon jest dostępny tylko w planie Premium." }, { status: 403 });
      }
    }
    data.templateId = body.templateId;
  }

  if (body.contentJson !== undefined) {
    const parsed = GeneratedCvContentSchema.safeParse(body.contentJson);
    if (!parsed.success) {
      return Response.json({ error: "Nieprawidłowa treść CV." }, { status: 400 });
    }
    data.contentJson = parsed.data;
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Brak danych do zapisania." }, { status: 400 });
  }

  const updated = await prisma.generatedCv.update({ where: { id }, data });
  return Response.json({ generatedCv: updated });
}
