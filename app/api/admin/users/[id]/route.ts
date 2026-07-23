import * as z from "zod/v4";
import { prisma } from "@/lib/prisma";
import { requireAdminUserId } from "@/lib/admin";

const UpdatePlanSchema = z.object({
  plan: z.enum(["free", "premium"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await requireAdminUserId();
  if (adminId instanceof Response) return adminId;

  const { id } = await params;
  const body = await request.json();
  const validatedFields = UpdatePlanSchema.safeParse(body);
  if (!validatedFields.success) {
    return Response.json({ error: "Nieprawidłowy plan." }, { status: 400 });
  }

  const { plan } = validatedFields.data;
  const renewsAt = new Date();
  renewsAt.setFullYear(renewsAt.getFullYear() + 1);

  const user = await prisma.user.update({
    where: { id },
    data:
      plan === "premium"
        ? { plan: "premium", planRenewsAt: renewsAt, hasEverPurchased: true }
        : { plan: "free", planRenewsAt: null },
    select: {
      id: true,
      email: true,
      fullName: true,
      plan: true,
      planRenewsAt: true,
      emailVerifiedAt: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { generatedCvs: true, generatedCoverLetters: true } },
    },
  });

  return Response.json({ user });
}
