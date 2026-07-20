"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { input, card, buttonPrimary, errorText, eyebrow } from "@/lib/ui";
import { TargetIcon, ShieldCheckIcon, ClockIcon, LockIcon } from "@/app/components/icons";

const tips = [
  { icon: TargetIcon, text: "Wklej całą treść — im więcej wymagań i słów kluczowych, tym trafniejsze dopasowanie." },
  { icon: ShieldCheckIcon, text: "AI nigdy nie doda doświadczenia, którego nie ma w Twoim profilu." },
  { icon: ClockIcon, text: "Generowanie zajmuje zwykle kilkanaście sekund." },
];

export function GenerateForm() {
  const router = useRouter();
  const [rawContent, setRawContent] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLimitReached(false);

    const hasContent = rawContent.trim().length >= 50;
    const hasUrl = sourceUrl.trim().length > 0;
    if (!hasContent && !hasUrl) {
      setError("Podaj link do oferty albo wklej jej pełną treść (co najmniej 50 znaków).");
      return;
    }

    setPending(true);
    try {
      setStatusMessage(hasContent ? "Zapisywanie oferty…" : "Pobieranie treści oferty spod linku…");
      const jobPostingResponse = await fetch("/api/job-postings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawContent, companyName, jobTitle, sourceUrl }),
      });
      const jobPostingData = await jobPostingResponse.json();
      if (!jobPostingResponse.ok) {
        throw new Error(
          jobPostingData?.errors?.rawContent?.[0] || jobPostingData?.error || "Nie udało się zapisać oferty.",
        );
      }

      setStatusMessage("Generowanie CV… (może potrwać do kilkunastu sekund)");
      const generateResponse = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingId: jobPostingData.jobPosting.id }),
      });
      const generateData = await generateResponse.json();
      if (!generateResponse.ok) {
        if (generateData?.limitReached) {
          setLimitReached(true);
        }
        throw new Error(generateData?.error || "Nie udało się wygenerować CV.");
      }

      setStatusMessage("Gotowe! Otwieram podgląd CV…");
      // Brief pause so the "done" state is actually visible before navigating —
      // otherwise the loading screen disappears and the new page appears in the
      // same instant, which on a phone reads as "nothing happened".
      await new Promise((resolve) => setTimeout(resolve, 600));
      router.push(`/cv/${generateData.generatedCv.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.");
      setStatusMessage(null);
      setPending(false);
    }
  }

  return (
    <>
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-6 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5 rounded-card border border-border bg-card px-10 py-12 text-center shadow-xl">
            <span
              aria-hidden
              className="h-12 w-12 shrink-0 animate-spin rounded-full border-4 border-primary border-t-transparent"
            />
            <div>
              <p className="text-lg font-semibold">{statusMessage ?? "Przetwarzanie…"}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Nie zamykaj tej strony.</p>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-[1fr_15rem]">
        <div className="flex flex-col gap-6">
          <div>
            <span className={eyebrow}>Krok 2</span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Wygeneruj CV dopasowane do oferty</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Wklej treść ogłoszenia o pracę — system dopasuje Twoje CV do wymagań oferty na
              podstawie Twojego profilu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={`${card} flex flex-col gap-4`}>
            <div className="grid grid-cols-2 gap-3">
              <input
                className={input}
                placeholder="Nazwa firmy (opcjonalnie)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <input
                className={input}
                placeholder="Stanowisko (opcjonalnie)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <input
                className={input}
                type="url"
                placeholder="Link do oferty"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Wystarczy sam link — treść oferty pobierzemy automatycznie. Jeśli strona tego nie
                pozwoli (np. wymaga logowania), wklej treść ręcznie poniżej.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <textarea
                className={input}
                placeholder="…albo wklej tu pełną treść ogłoszenia o pracę"
                rows={12}
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Opcjonalne, jeśli podałeś link wyżej — ale najpewniejsze: wklejona treść zawsze
                działa, nawet gdy automatyczne pobranie ze strony się nie uda.
              </p>
            </div>

            {limitReached ? (
              <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-accent-soft p-4">
                <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft-foreground" />
                <div>
                  <p className="text-sm font-semibold text-accent-soft-foreground">
                    Wykorzystano darmowe CV
                  </p>
                  <p className="mt-1 text-sm text-accent-soft-foreground">
                    Wykup Premium (nielimitowane generowanie) albo pakiet wygenerowań, żeby
                    stworzyć kolejne CV.
                  </p>
                  <Link
                    href="/dashboard#plan"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    Zobacz plany →
                  </Link>
                </div>
              </div>
            ) : (
              error && <p className={errorText}>{error}</p>
            )}

            <button type="submit" disabled={pending || limitReached} className={`${buttonPrimary} w-full`}>
              {pending ? "Przetwarzanie…" : "Generuj CV"}
            </button>
          </form>
        </div>

        <aside className="flex flex-col gap-4 lg:pt-20">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="flex items-start gap-3 rounded-card border border-border bg-card p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-sm text-muted-foreground">{tip.text}</p>
              </div>
            );
          })}
        </aside>
      </main>
    </>
  );
}
