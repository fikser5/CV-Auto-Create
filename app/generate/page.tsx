import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/app/components/AppNav";
import { GenerateForm } from "@/app/generate/GenerateForm";
import { resendVerificationEmail } from "@/app/actions/auth";
import { checkGenerationAllowance } from "@/lib/plan";
import { buttonPrimary, buttonSecondary, eyebrow } from "@/lib/ui";
import { LockIcon, MailIcon } from "@/app/components/icons";

export default async function GeneratePage() {
  const { userId } = await verifySession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      plan: true,
      planRenewsAt: true,
      freeGenerationUsed: true,
      purchasedCredits: true,
      hasEverPurchased: true,
      emailVerifiedAt: true,
      isAdmin: true,
    },
  });

  const allowance = checkGenerationAllowance(user);

  if (!allowance.allowed) {
    const isEmailIssue = allowance.reason === "email_not_verified";
    return (
      <>
        <AppNav isAdmin={user.isAdmin} />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
          <div>
            <span className={eyebrow}>Krok 2</span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Wygeneruj CV dopasowane do oferty</h1>
          </div>
          <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border p-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-soft-foreground">
              {isEmailIssue ? <MailIcon className="h-6 w-6" /> : <LockIcon className="h-6 w-6" />}
            </span>
            {isEmailIssue ? (
              <>
                <div>
                  <p className="font-semibold">Potwierdź adres e-mail</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Wysłaliśmy link weryfikacyjny na Twoją skrzynkę podczas rejestracji. Sprawdź
                    też folder SPAM, albo wyślij link jeszcze raz.
                  </p>
                </div>
                <form action={resendVerificationEmail}>
                  <button type="submit" className={buttonSecondary}>
                    Wyślij link ponownie
                  </button>
                </form>
              </>
            ) : (
              <>
                <div>
                  <p className="font-semibold">Wykorzystano darmowe CV</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Wykup Premium (nielimitowane generowanie) albo pakiet wygenerowań, żeby
                    stworzyć kolejne CV.
                  </p>
                </div>
                <Link href="/dashboard#plan" className={buttonPrimary}>
                  Zobacz plany
                </Link>
              </>
            )}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppNav isAdmin={user.isAdmin} />
      <GenerateForm />
    </>
  );
}
