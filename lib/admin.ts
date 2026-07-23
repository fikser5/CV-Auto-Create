import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AdminIdentity = { id: string; email: string };

/**
 * Checked fresh from the DB on every call (never cached in the JWT) so that
 * revoking admin access takes effect immediately, not just after the next
 * login — same pattern as plan/email-verification checks elsewhere.
 */
export async function requireAdminUserId(): Promise<string | Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Musisz być zalogowany." }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } });
  if (!user?.isAdmin) {
    return Response.json({ error: "Brak uprawnień administratora." }, { status: 403 });
  }
  return session.user.id;
}

/** Same check as requireAdminUserId, but also returns the admin's email for audit logging. */
export async function requireAdmin(): Promise<AdminIdentity | Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Musisz być zalogowany." }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true, email: true } });
  if (!user?.isAdmin) {
    return Response.json({ error: "Brak uprawnień administratora." }, { status: 403 });
  }
  return { id: session.user.id, email: user.email };
}

export async function logAdminAction(
  admin: AdminIdentity,
  targetEmail: string,
  action: string,
  details?: string,
): Promise<void> {
  await prisma.adminActionLog.create({
    data: { adminId: admin.id, adminEmail: admin.email, targetEmail, action, details },
  });
}
