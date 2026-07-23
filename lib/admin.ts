import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
