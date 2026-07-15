"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent";
const buttonClass =
  "rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black";

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
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Wygeneruj CV dopasowane do oferty</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Wklej treść ogłoszenia o pracę — system dopasuje Twoje CV do wymagań oferty na podstawie
          Twojego profilu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            className={inputClass}
            placeholder="Nazwa firmy (opcjonalnie)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Stanowisko (opcjonalnie)"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
        <textarea
          className={inputClass}
          placeholder="Wklej pełną treść ogłoszenia o pracę…"
          rows={12}
          required
          minLength={50}
          value={rawContent}
          onChange={(e) => setRawContent(e.target.value)}
        />

        {statusMessage && !error && <p className="text-sm text-black/60 dark:text-white/60">{statusMessage}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Przetwarzanie…" : "Generuj CV"}
        </button>
      </form>
    </main>
  );
}
