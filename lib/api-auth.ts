import "server-only";
import { auth } from "@/auth";

export async function requireUserId(): Promise<string | Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Musisz być zalogowany." }, { status: 401 });
  }
  return session.user.id;
}
