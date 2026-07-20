"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonSecondary } from "@/lib/ui";
import { FileTextIcon } from "@/app/components/icons";

export function GenerateCoverLetterButton({ jobPostingId }: { jobPostingId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
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
      router.push(`/cover-letter/${data.generatedCoverLetter.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button type="button" onClick={handleClick} disabled={pending} className={buttonSecondary}>
        <FileTextIcon className="h-4 w-4" />
        {pending ? "Generowanie…" : "Wygeneruj list motywacyjny"}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
