import Link from "next/link";
import { buttonPrimary, buttonSecondary } from "@/lib/ui";
import { ThemeToggle } from "@/app/components/ThemeToggle";

const steps = [
  {
    n: "1",
    title: "Profil",
    body: "Wpisz doświadczenie, edukację, umiejętności i zainteresowania — raz.",
  },
  {
    n: "2",
    title: "Oferta",
    body: "Wklej treść ogłoszenia, na które chcesz aplikować.",
  },
  {
    n: "3",
    title: "CV",
    body: "Pobierz gotowe, dopasowane CV w PDF w kilkanaście sekund.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            C
          </span>
          <span className="font-semibold">CVAutomat</span>
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Zaloguj się
          </Link>
          <Link href="/register" className={buttonPrimary}>
            Załóż konto
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center px-6 pb-24 pt-16 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,var(--accent-soft),transparent)]"
        />

        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          Generator CV oparty na AI
        </span>

        <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          CV dopasowane do oferty pracy, wygenerowane w{" "}
          <span className="text-primary">kilkanaście sekund</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Uzupełnij swój profil zawodowy raz. Wklej treść ogłoszenia, a AI podkreśli te
          doświadczenia i umiejętności, które najlepiej pasują do danej oferty — bez zmyślania,
          tylko na podstawie Twoich prawdziwych danych.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/register" className={`${buttonPrimary} px-6 py-3 text-base`}>
            Załóż darmowe konto
          </Link>
          <Link href="/login" className={`${buttonSecondary} px-6 py-3 text-base`}>
            Zaloguj się
          </Link>
        </div>

        <div className="mt-24 grid w-full max-w-3xl grid-cols-1 gap-6 text-left sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="rounded-card border border-border bg-card p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-soft-foreground">
                {step.n}
              </span>
              <h2 className="mt-4 font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
