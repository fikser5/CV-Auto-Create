"use client";

import { useState } from "react";
import { card, input, buttonSecondary, errorText } from "@/lib/ui";
import { CrownIcon, CheckCircleIcon } from "@/app/components/icons";

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  plan: "free" | "premium";
  planRenewsAt: string | Date | null;
  emailVerifiedAt: string | Date | null;
  isAdmin: boolean;
  createdAt: string | Date;
  _count: { generatedCvs: number; generatedCoverLetters: number };
};

function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("pl-PL");
}

export function AdminUserTable({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q);
  });

  async function togglePlan(user: AdminUser) {
    const nextPlan = user.plan === "premium" ? "free" : "premium";
    setError(null);
    setPendingId(user.id);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: nextPlan }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Nie udało się zmienić planu.");
      }
      const { user: updated } = await response.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd zmiany planu.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className={`${card} flex flex-col gap-4 p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Użytkownicy ({users.length})</h2>
          <p className="text-sm text-muted-foreground">Zmiana planu działa natychmiast, bez potwierdzenia płatności.</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj po e-mailu lub nazwisku…"
          className={`${input} max-w-xs`}
        />
      </div>

      {error && <p className={errorText}>{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Użytkownik</th>
              <th className="py-2 pr-3 font-medium">Plan</th>
              <th className="py-2 pr-3 font-medium">E-mail</th>
              <th className="py-2 pr-3 font-medium">Rejestracja</th>
              <th className="py-2 pr-3 font-medium">CV</th>
              <th className="py-2 pr-3 font-medium">Listy</th>
              <th className="py-2 pr-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border/60">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{u.fullName}</span>
                    {u.isAdmin && (
                      <span title="Administrator">
                        <CrownIcon className="h-3.5 w-3.5 text-primary" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 pr-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.plan === "premium"
                        ? "bg-accent-soft text-accent-soft-foreground"
                        : "bg-border text-muted-foreground"
                    }`}
                  >
                    {u.plan === "premium" ? "Premium" : "Darmowy"}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    {u.email}
                    {u.emailVerifiedAt && (
                      <span title="E-mail zweryfikowany">
                        <CheckCircleIcon className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="py-2.5 pr-3 tabular-nums">{u._count.generatedCvs}</td>
                <td className="py-2.5 pr-3 tabular-nums">{u._count.generatedCoverLetters}</td>
                <td className="py-2.5 pr-3">
                  <button
                    type="button"
                    disabled={pendingId === u.id}
                    onClick={() => togglePlan(u)}
                    className={`${buttonSecondary} px-3 py-1.5 text-xs`}
                  >
                    {pendingId === u.id
                      ? "Zapisywanie…"
                      : u.plan === "premium"
                        ? "Cofnij do Free"
                        : "Nadaj Premium"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-muted-foreground">
                  Brak wyników dla &quot;{query}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
