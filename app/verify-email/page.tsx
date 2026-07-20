import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { consumeEmailVerificationToken } from "@/lib/email-verification";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { buttonPrimary, card } from "@/lib/ui";
import { CheckCircleIcon, LockIcon } from "@/app/components/icons";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let success = false;
  if (token) {
    const verified = await consumeEmailVerificationToken(token);
    if (verified) {
      await prisma.user.update({ where: { id: verified.userId }, data: { emailVerifiedAt: new Date() } });
      success = true;
    }
  }

  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_50%_45%_at_50%_-5%,var(--accent-soft),transparent)]"
      />
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-sm font-bold text-primary-foreground">
              C
            </span>
            <span className="font-semibold">CVAutomat</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className={`${card} flex flex-col items-center gap-3 text-center`}>
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              success ? "bg-accent-soft text-accent-soft-foreground" : "bg-danger-soft text-danger"
            }`}
          >
            {success ? <CheckCircleIcon className="h-6 w-6" /> : <LockIcon className="h-6 w-6" />}
          </span>

          {success ? (
            <>
              <h1 className="text-xl font-semibold">Adres e-mail potwierdzony</h1>
              <p className="text-sm text-muted-foreground">
                Możesz teraz generować CV. Przejdź do panelu, żeby zacząć.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">Link jest nieprawidłowy lub wygasł</h1>
              <p className="text-sm text-muted-foreground">
                Zaloguj się, a z panelu wyślemy Ci nowy link weryfikacyjny.
              </p>
            </>
          )}

          <Link href={success ? "/dashboard" : "/login"} className={`${buttonPrimary} mt-2`}>
            {success ? "Przejdź do panelu" : "Zaloguj się"}
          </Link>
        </div>
      </div>
    </main>
  );
}
