"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginUser, undefined);

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <form action={action} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Zaloguj się</h1>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="jan@example.com"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/20"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Hasło
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/20"
          />
        </div>

        {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Logowanie…" : "Zaloguj się"}
        </button>

        <p className="text-sm text-black/60 dark:text-white/60">
          Nie masz konta?{" "}
          <Link href="/register" className="underline">
            Zarejestruj się
          </Link>
        </p>
      </form>
    </main>
  );
}
