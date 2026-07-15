"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerUser, undefined);

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <form action={action} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Załóż konto</h1>

        <div className="space-y-1">
          <label htmlFor="fullName" className="text-sm font-medium">
            Imię i nazwisko
          </label>
          <input
            id="fullName"
            name="fullName"
            placeholder="Jan Kowalski"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/20"
          />
          {state?.errors?.fullName && (
            <p className="text-sm text-red-600">{state.errors.fullName[0]}</p>
          )}
        </div>

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
          {state?.errors?.email && (
            <p className="text-sm text-red-600">{state.errors.email[0]}</p>
          )}
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
          {state?.errors?.password && (
            <ul className="text-sm text-red-600">
              {state.errors.password.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>

        {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Tworzenie konta…" : "Zarejestruj się"}
        </button>

        <p className="text-sm text-black/60 dark:text-white/60">
          Masz już konto?{" "}
          <Link href="/login" className="underline">
            Zaloguj się
          </Link>
        </p>
      </form>
    </main>
  );
}
