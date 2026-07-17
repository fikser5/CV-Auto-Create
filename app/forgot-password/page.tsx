"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { input, label as labelClass, card, buttonPrimary, errorText } from "@/lib/ui";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

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

        {state?.sent ? (
          <div className={`${card} flex flex-col gap-3 text-center`}>
            <h1 className="text-xl font-semibold">Sprawdź skrzynkę</h1>
            <p className="text-sm text-muted-foreground">
              Jeśli konto z tym adresem e-mail istnieje, wysłaliśmy na nie link do zresetowania
              hasła. Link jest ważny przez godzinę.
            </p>
            <Link href="/login" className="mt-2 text-sm font-medium text-primary hover:text-primary-hover">
              Wróć do logowania
            </Link>
          </div>
        ) : (
          <form action={action} className={`${card} flex flex-col gap-5`}>
            <div>
              <h1 className="text-xl font-semibold">Zapomniałeś hasła?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Podaj adres e-mail, a wyślemy link do zresetowania hasła.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className={labelClass}>
                E-mail
              </label>
              <input id="email" name="email" type="email" placeholder="jan@example.com" className={input} />
            </div>

            {state?.message && <p className={errorText}>{state.message}</p>}

            <button type="submit" disabled={pending} className={`${buttonPrimary} w-full`}>
              {pending ? "Wysyłanie…" : "Wyślij link resetujący"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
                Wróć do logowania
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
