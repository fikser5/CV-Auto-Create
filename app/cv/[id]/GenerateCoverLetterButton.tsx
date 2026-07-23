"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonSecondary } from "@/lib/ui";
import { FileTextIcon } from "@/app/components/icons";

export function GenerateCoverLetterButton({ jobPostingId }: { jobPostingId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    setStatusMessage("Generowanie listu motywacyjnego… (może potrwać do kilkunastu sekund)");
    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Nie udało się wygenerować listu motywacyjnego.");
      }
      setStatusMessage("Gotowe! Otwieram podgląd listu…");
      // Brief pause so the "done" state is actually visible before navigating —
      // otherwise the loading overlay disappears and the new page appears in
      // the same instant, which on a phone reads as "nothing happened".
      await new Promise((resolve) => setTimeout(resolve, 600));
      router.push(`/cover-letter/${data.generatedCoverLetter.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.");
      setStatusMessage(null);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
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
      <button type="button" onClick={handleClick} disabled={pending} className={buttonSecondary}>
        <FileTextIcon className="h-4 w-4" />
        {pending ? "Generowanie…" : "Wygeneruj list motywacyjny"}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
