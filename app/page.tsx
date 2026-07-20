import Link from "next/link";
import { buttonPrimary, buttonSecondary, badge, eyebrow } from "@/lib/ui";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import {
  SparklesIcon,
  ShieldCheckIcon,
  TargetIcon,
  FileTextIcon,
  ClockIcon,
  LayersIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  WandIcon,
  CrownIcon,
} from "@/app/components/icons";

const trustItems = [
  "Zero zmyślania — tylko Twoje prawdziwe dane",
  "Gotowy PDF w kilkanaście sekund",
  "Jeden profil, dowolna liczba ofert",
];

const steps = [
  {
    n: "01",
    icon: FileTextIcon,
    title: "Zbuduj profil",
    body: "Wpisz doświadczenie, edukację, umiejętności i zainteresowania — raz, a system zapamięta je na przyszłość.",
  },
  {
    n: "02",
    icon: TargetIcon,
    title: "Wklej ofertę",
    body: "Skopiuj treść ogłoszenia, na które aplikujesz. AI przeanalizuje wymagania i słowa kluczowe.",
  },
  {
    n: "03",
    icon: WandIcon,
    title: "Odbierz CV",
    body: "W kilkanaście sekund dostajesz CV, w którym najmocniej wybrzmiewa to, co pasuje do danej oferty.",
  },
];

const featureTones = {
  violet: "bg-accent-soft text-accent-soft-foreground",
  blue: "bg-blue-soft text-blue-soft-foreground",
  rose: "bg-rose-soft text-rose-soft-foreground",
} as const;

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Bez zmyślania",
    body: "AI nigdy nie dopisuje doświadczenia, którego nie masz — tylko przeformułowuje i priorytetyzuje prawdziwe dane z Twojego profilu.",
    big: true,
    tone: "violet",
  },
  {
    icon: TargetIcon,
    title: "Dopasowanie do oferty",
    body: "Każde CV jest budowane pod konkretne wymagania i słowa kluczowe z ogłoszenia.",
    tone: "blue",
  },
  {
    icon: LayersIcon,
    title: "Jeden profil, wiele CV",
    body: "Aplikuj na dziesiątki ofert bez przepisywania CV od zera za każdym razem.",
    tone: "violet",
  },
  {
    icon: ClockIcon,
    title: "Kilkanaście sekund",
    body: "Od wklejenia ogłoszenia do gotowego dokumentu — bez czekania i bez formatowania ręcznego.",
    tone: "blue",
  },
  {
    icon: FileTextIcon,
    title: "Gotowy PDF",
    body: "Estetyczny, czytelny układ gotowy do wysłania — z poprawną obsługą polskich znaków.",
    tone: "rose",
  },
] satisfies { icon: typeof ShieldCheckIcon; title: string; body: string; big?: boolean; tone: keyof typeof featureTones }[];

const faq = [
  {
    q: "Czy AI wymyśla mi doświadczenie, którego nie mam?",
    a: "Nie. Model pracuje wyłącznie na danych z Twojego profilu — dobiera, przeformułowuje i podkreśla to, co już masz, żeby lepiej odpowiadało ofercie. Nigdy nie dodaje nowych faktów.",
  },
  {
    q: "Ile CV mogę wygenerować za darmo?",
    a: "Jedno — na start, żeby przetestować jakość dopasowania. Kolejne CV wymagają Premium albo pakietu wygenerowań.",
  },
  {
    q: "Jakie dane muszę uzupełnić, żeby zacząć?",
    a: "Podstawowe informacje o sobie, doświadczenie zawodowe, edukację, umiejętności i zainteresowania. Uzupełniasz je raz w profilu.",
  },
  {
    q: "Czy moje dane są bezpieczne?",
    a: "Tak — dane trafiają wyłącznie do Twojego konta i są wykorzystywane tylko do generowania Twoich CV.",
  },
];

const pricingPlans = [
  {
    name: "Darmowy",
    price: "0 zł",
    period: "",
    description: "Sprawdź jakość dopasowania na start.",
    features: ["1 wygenerowane CV", "Pełne dopasowanie AI do oferty", "Eksport do PDF"],
    cta: "Załóż darmowe konto",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "29 zł",
    period: "/miesiąc",
    description: "Dla osób aktywnie szukających pracy.",
    features: [
      "Nielimitowane generowanie CV",
      "Pełna historia wygenerowanych CV",
      "Generowanie listu motywacyjnego dopasowanego do oferty",
      "Więcej szablonów wizualnych CV (wkrótce)",
    ],
    cta: "Wybierz Premium",
    highlighted: true,
    ribbon: "Najpopularniejszy",
  },
  {
    name: "Pakiet",
    price: "5 zł",
    period: "jednorazowo",
    description: "Kiedy potrzebujesz tylko kilku CV.",
    features: ["2 wygenerowania CV", "Dostęp do historii CV po zakupie"],
    cta: "Kup pakiet",
    highlighted: false,
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-6 sm:px-6">
        <span className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-sm font-bold text-primary-foreground">
            C
          </span>
          <span className="hidden font-semibold sm:inline">CVAutomat</span>
        </span>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Zaloguj się
          </Link>
          <Link href="/register" className={`${buttonPrimary} whitespace-nowrap`}>
            Załóż konto
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative flex flex-1 flex-col items-center px-6 pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-6rem] -z-10 h-[38rem] bg-[radial-gradient(ellipse_50%_42%_at_16%_12%,var(--accent-soft),transparent),radial-gradient(ellipse_45%_38%_at_58%_-4%,var(--blue-soft),transparent),radial-gradient(ellipse_40%_35%_at_92%_10%,var(--rose-soft),transparent)]"
        />

        <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div className="flex flex-col items-start text-left">
            <span className={badge}>
              <SparklesIcon className="h-3.5 w-3.5 text-primary" />
              Generator CV oparty na AI
            </span>

            <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
              Twoje CV, <span className="font-display text-5xl italic font-normal text-gradient sm:text-6xl">precyzyjnie</span>{" "}
              dopasowane do każdej oferty
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Uzupełnij profil zawodowy raz. Wklej treść ogłoszenia, a AI podkreśli te
              doświadczenia i umiejętności, które najlepiej pasują do danej roli — bez zmyślania,
              wyłącznie na podstawie Twoich prawdziwych danych.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/register" className={`${buttonPrimary} px-6 py-3 text-base`}>
                Załóż darmowe konto
                <ArrowRightIcon />
              </Link>
              <Link href="/login" className={`${buttonSecondary} px-6 py-3 text-base`}>
                Zaloguj się
              </Link>
            </div>

            <ul className="mt-10 flex flex-col gap-2.5">
              {trustItems.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup CV preview */}
          <div className="relative mx-auto w-full max-w-sm lg:mx-0">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,var(--glow),transparent)]"
            />
            <div className="card-hover overflow-hidden rounded-card border border-border bg-card shadow-xl">
              <div className="h-2.5 bg-gradient-brand" />
              <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 shrink-0 rounded-full bg-gradient-brand" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <span className="h-3 w-28 rounded bg-foreground/15" />
                    <span className="h-2.5 w-20 rounded bg-foreground/10" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="h-2.5 w-full rounded bg-foreground/10" />
                  <span className="h-2.5 w-11/12 rounded bg-foreground/10" />
                  <span className="h-2.5 w-4/5 rounded bg-foreground/10" />
                </div>
                <div className="mt-1 flex flex-col gap-2 border-t border-border pt-4">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    Doświadczenie
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <span className="h-2.5 w-3/4 rounded bg-foreground/10" />
                    <span className="h-2.5 w-1/2 rounded bg-foreground/10" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 border-t border-border pt-4">
                  {["React", "TypeScript", "Figma"].map((s) => (
                    <span key={s} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-soft-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="glow-primary absolute -bottom-5 -left-5 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold shadow-lg sm:-left-8">
              <TargetIcon className="h-4 w-4 text-rose" />
              97% dopasowania do oferty
            </div>
          </div>
        </div>

        {/* Jak to działa */}
        <section className="mt-32 w-full max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <span className={eyebrow}>Jak to działa</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Od profilu do gotowego CV w trzech krokach</h2>
          </div>

          <div className="relative mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div
              aria-hidden
              className="absolute top-9 left-[16.5%] right-[16.5%] hidden h-px bg-[linear-gradient(90deg,var(--primary),var(--rose))] opacity-30 sm:block"
            />
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="card-hover relative flex flex-col items-start rounded-card border border-border bg-card p-6 text-left">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-3xl italic text-muted-foreground/50">{step.n}</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features bento */}
        <section className="mt-32 w-full max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <span className={eyebrow}>Dlaczego CVAutomat</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Zbudowany wokół jednej zasady: prawda przede wszystkim</h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`card-hover flex flex-col gap-3 rounded-card border border-border bg-card p-6 ${
                    feature.big ? "sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:justify-center bg-[linear-gradient(155deg,var(--accent-soft),var(--card)_55%)]" : ""
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${featureTones[feature.tone]}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Dopasowanie, nie zmyślanie — porównanie */}
        <section className="mt-32 w-full max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <span className={eyebrow}>Uczciwe CV</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Przeformułowanie, nie fabrykacja</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              AI zmienia sposób opisania Twojego doświadczenia, nie jego treść. Zobacz różnicę.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-card border border-border bg-card p-6">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                W Twoim profilu
              </span>
              <p className="mt-3 text-sm leading-relaxed">
                „Zajmowałem się stroną frontendową aplikacji, poprawiałem wydajność i
                współpracowałem z zespołem projektowym.”
              </p>
            </div>
            <div className="rounded-card border border-primary/30 bg-accent-soft p-6">
              <span className="text-xs font-semibold uppercase tracking-wide text-accent-soft-foreground">
                W CV dopasowanym do oferty „Frontend Developer”
              </span>
              <p className="mt-3 text-sm leading-relaxed text-accent-soft-foreground">
                „Odpowiadałem za rozwój warstwy frontendowej aplikacji, optymalizację wydajności
                interfejsu oraz ścisłą współpracę z zespołem UX/UI.”
              </p>
            </div>
          </div>
        </section>

        {/* Cennik */}
        <section className="mt-32 w-full max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <span className={eyebrow}>Cennik</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Zacznij za darmo, płać dopiero gdy potrzebujesz więcej</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Pierwsze CV zawsze bezpłatnie. Bez ukrytych kosztów, bez zobowiązań.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`card-hover relative flex flex-col gap-6 rounded-card border p-7 ${
                  plan.highlighted
                    ? "border-primary/40 bg-[linear-gradient(155deg,var(--accent-soft),var(--card)_60%)] shadow-lg lg:-translate-y-3"
                    : "border-border bg-card"
                }`}
              >
                {plan.ribbon && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
                    {plan.ribbon}
                  </span>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    {plan.highlighted && <CrownIcon className="h-4 w-4 text-primary" />}
                    <h3 className="font-semibold">{plan.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-4xl italic font-normal">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>

                <ul className="flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={plan.highlighted ? `${buttonPrimary} w-full` : `${buttonSecondary} w-full`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-32 w-full max-w-2xl">
          <div className="flex flex-col items-center text-center">
            <span className={eyebrow}>FAQ</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Najczęstsze pytania</h2>
          </div>

          <div className="mt-10 flex flex-col divide-y divide-border rounded-card border border-border bg-card">
            {faq.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:content-none">
                  {item.q}
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative mt-32 w-full max-w-5xl overflow-hidden rounded-card bg-gradient-brand px-8 py-14 text-center text-primary-foreground sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.5)_1px,transparent_1px)] opacity-10 [background-size:22px_22px]"
          />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Gotowy na CV, które trafia w sedno?</h2>
          <p className="mx-auto mt-4 max-w-md text-primary-foreground/85">
            Załóż konto, uzupełnij profil raz i generuj dopasowane CV do każdej kolejnej oferty.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-background px-6 py-3 text-base font-semibold text-foreground shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Załóż darmowe konto
            <ArrowRightIcon />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-brand text-xs font-bold text-primary-foreground">
              C
            </span>
            CVAutomat — CV dopasowane do oferty, nie zmyślone od zera.
          </span>
          <span>© 2026 CVAutomat</span>
        </div>
      </footer>
    </div>
  );
}
