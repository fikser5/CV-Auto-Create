"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import { input, label as labelClass, card, buttonPrimary, errorText } from "@/lib/ui";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginUser, undefined);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              C
            </span>
            <span className="font-semibold">CVAutomat</span>
          </Link>
          <ThemeToggle />
        </div>

        <form action={action} className={`${card} flex flex-col gap-5`}>
          <div>
            <h1 className="text-xl font-semibold">Zaloguj się</h1>
            <p className="mt-1 text-sm text-muted-foreground">Miło Cię znów widzieć.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className={labelClass}>
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="jan@example.com"
              className={input}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className={labelClass}>
              Hasło
            </label>
            <input id="password" name="password" type="password" className={input} />
          </div>

          {state?.message && <p className={errorText}>{state.message}</p>}

          <button type="submit" disabled={pending} className={`${buttonPrimary} w-full`}>
            {pending ? "Logowanie…" : "Zaloguj się"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Nie masz konta?{" "}
            <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
              Zarejestruj się
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
