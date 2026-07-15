import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { logoutUser } from "@/app/actions/auth";

export default async function DashboardPage() {
  const { userId } = await verifySession();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { fullName: true, email: true },
  });

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Witaj, {user.fullName}</h1>
      <p className="text-sm text-black/60 dark:text-white/60">{user.email}</p>
      <Link href="/profile" className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black">
        Uzupełnij profil zawodowy
      </Link>
      <form action={logoutUser}>
        <button
          type="submit"
          className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium dark:border-white/20"
        >
          Wyloguj się
        </button>
      </form>
    </main>
  );
}
