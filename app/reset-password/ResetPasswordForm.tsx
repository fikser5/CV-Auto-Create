"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";
import { input, label as labelClass, card, buttonPrimary, errorText } from "@/lib/ui";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, action, pending] = useActionState(resetPassword, undefined);

  if (!token) {
    return (
      <div className={`${card} flex flex-col gap-3 text-center`}>
        <h1 className="text-xl font-semibold">Nieprawidłowy link</h1>
        <p className="text-sm text-muted-foreground">Ten link do resetu hasła jest niekompletny.</p>
        <Link href="/forgot-password" className="mt-2 text-sm font-medium text-primary hover:text-primary-hover">
          Poproś o nowy link
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className={`${card} flex flex-col gap-5`}>
      <input type="hidden" name="token" value={token} />
      <div>
        <h1 className="text-xl font-semibold">Ustaw nowe hasło</h1>
        <p className="mt-1 text-sm text-muted-foreground">Wpisz nowe hasło do swojego konta.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className={labelClass}>
          Nowe hasło
        </label>
        <input id="password" name="password" type="password" className={input} />
        {state?.errors?.password && (
          <ul className={errorText}>
            {state.errors.password.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      {state?.message && <p className={errorText}>{state.message}</p>}

      <button type="submit" disabled={pending} className={`${buttonPrimary} w-full`}>
        {pending ? "Zapisywanie…" : "Ustaw nowe hasło"}
      </button>
    </form>
  );
}
