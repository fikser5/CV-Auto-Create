import * as z from "zod/v4";
import { prisma } from "@/lib/prisma";
import { requireAdmin, logAdminAction } from "@/lib/admin";

const AdminActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("setPlan"), plan: z.enum(["free", "premium"]) }),
  z.object({ action: z.literal("addCredits"), amount: z.number().int().min(1).max(100) }),
]);

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  plan: true,
  planRenewsAt: true,
  purchasedCredits: true,
  emailVerifiedAt: true,
  isAdmin: true,
  createdAt: true,
  _count: { select: { generatedCvs: true, generatedCoverLetters: true } },
} as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const body = await request.json();
  const validatedFields = AdminActionSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (!target) {
    return Response.json({ error: "Nie znaleziono konta." }, { status: 404 });
  }

  const action = validatedFields.data;
  let user;
  if (action.action === "setPlan") {
    const renewsAt = new Date();
    renewsAt.setFullYear(renewsAt.getFullYear() + 1);
    user = await prisma.user.update({
      where: { id },
      data:
        action.plan === "premium"
          ? { plan: "premium", planRenewsAt: renewsAt, hasEverPurchased: true }
          : { plan: "free", planRenewsAt: null },
      select: userSelect,
    });
    await logAdminAction(admin, target.email, "set_plan", `plan=${action.plan}`);
  } else {
    user = await prisma.user.update({
      where: { id },
      data: { purchasedCredits: { increment: action.amount }, hasEverPurchased: true },
      select: userSelect,
    });
    await logAdminAction(admin, target.email, "add_credits", `amount=${action.amount}`);
  }

  return Response.json({ user });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (admin instanceof Response) return admin;

  const { id } = await params;
  if (id === admin.id) {
    return Response.json({ error: "Nie możesz usunąć własnego konta administratora." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (!target) {
    return Response.json({ error: "Nie znaleziono konta." }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  await logAdminAction(admin, target.email, "delete_account");

  return new Response(null, { status: 204 });
}
