"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/app/components/AppNav";
import { input, card, buttonPrimary, errorText, eyebrow } from "@/lib/ui";
import { TargetIcon, ShieldCheckIcon, ClockIcon } from "@/app/components/icons";

const tips = [
  { icon: TargetIcon, text: "Wklej całą treść — im więcej wymagań i słów kluczowych, tym trafniejsze dopasowanie." },
  { icon: ShieldCheckIcon, text: "AI nigdy nie doda doświadczenia, którego nie ma w Twoim profilu." },
  { icon: ClockIcon, text: "Generowanie zajmuje zwykle kilkanaście sekund." },
];

export default function GeneratePage() {
  const router = useRouter();
  const [rawContent, setRawContent] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      setStatusMessage("Zapisywanie oferty…");
      const jobPostingResponse = await fetch("/api/job-postings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawContent, companyName, jobTitle }),
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
        throw new Error(generateData?.error || "Nie udało się wygenerować CV.");
      }

      router.push(`/cv/${generateData.generatedCv.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.");
      setStatusMessage(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <AppNav />
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
            <textarea
              className={input}
              placeholder="Wklej pełną treść ogłoszenia o pracę…"
              rows={12}
              required
              minLength={50}
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
            />

            {statusMessage && !error && (
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            )}
            {error && <p className={errorText}>{error}</p>}

            <button type="submit" disabled={pending} className={`${buttonPrimary} w-full`}>
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
