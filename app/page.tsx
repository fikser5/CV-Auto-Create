import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
        CVAutomat
      </p>
      <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        CV dopasowane do oferty pracy, wygenerowane w kilkanaście sekund
      </h1>
      <p className="mt-6 max-w-xl text-lg text-black/60 dark:text-white/60">
        Uzupełnij swój profil zawodowy raz. Wklej treść ogłoszenia, a AI podkreśli te
        doświadczenia i umiejętności, które najlepiej pasują do danej oferty — bez zmyślania,
        tylko na podstawie Twoich prawdziwych danych.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/register"
          className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Załóż darmowe konto
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-black/10 px-6 py-3 text-sm font-medium dark:border-white/20"
        >
          Zaloguj się
        </Link>
      </div>

      <dl className="mt-20 grid max-w-3xl grid-cols-1 gap-8 text-left sm:grid-cols-3">
        <div>
          <dt className="font-semibold">1. Profil</dt>
          <dd className="mt-1 text-sm text-black/60 dark:text-white/60">
            Wpisz doświadczenie, edukację, umiejętności i zainteresowania.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">2. Oferta</dt>
          <dd className="mt-1 text-sm text-black/60 dark:text-white/60">
            Wklej treść ogłoszenia, na które chcesz aplikować.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">3. CV</dt>
          <dd className="mt-1 text-sm text-black/60 dark:text-white/60">
            Pobierz gotowe, dopasowane CV w PDF.
          </dd>
        </div>
      </dl>
    </main>
  );
}
