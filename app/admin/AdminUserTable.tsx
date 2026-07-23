"use client";

import { useState } from "react";
import Link from "next/link";
import { card, input, buttonSecondary, errorText } from "@/lib/ui";
import { CrownIcon, CheckCircleIcon } from "@/app/components/icons";

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  plan: "free" | "premium";
  planRenewsAt: string | Date | null;
  purchasedCredits: number;
  emailVerifiedAt: string | Date | null;
  isAdmin: boolean;
  createdAt: string | Date;
  _count: { generatedCvs: number; generatedCoverLetters: number };
};

function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("pl-PL");
}

function downloadCsv(users: AdminUser[]) {
  const header = ["Imię i nazwisko", "E-mail", "Plan", "Kredyty", "Zweryfikowany", "Rejestracja", "CV", "Listy motywacyjne"];
  const rows = users.map((u) => [
    u.fullName,
    u.email,
    u.plan === "premium" ? "Premium" : "Darmowy",
    String(u.purchasedCredits),
    u.emailVerifiedAt ? "tak" : "nie",
    formatDate(u.createdAt),
    String(u._count.generatedCvs),
    String(u._count.generatedCoverLetters),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `uzytkownicy-cvautomat-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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

  async function runAction(userId: string, body: object) {
    setError(null);
    setPendingId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Nie udało się zapisać zmiany.");
      }
      const { user: updated } = await response.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd zapisu.");
    } finally {
      setPendingId(null);
    }
  }

  async function deleteUser(user: AdminUser) {
    if (!window.confirm(`Na pewno usunąć konto ${user.email}? Tej operacji nie można cofnąć.`)) return;
    setError(null);
    setPendingId(user.id);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Nie udało się usunąć konta.");
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd usuwania konta.");
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
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj po e-mailu lub nazwisku…"
            className={`${input} max-w-xs`}
          />
          <button type="button" onClick={() => downloadCsv(users)} className={`${buttonSecondary} whitespace-nowrap px-3 py-2 text-sm`}>
            Eksportuj CSV
          </button>
        </div>
      </div>

      {error && <p className={errorText}>{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-sm">
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
                    <Link href={`/admin/users/${u.id}`} className="font-medium hover:text-primary hover:underline">
                      {u.fullName}
                    </Link>
                    {u.isAdmin && (
                      <span title="Administrator">
                        <CrownIcon className="h-3.5 w-3.5 text-primary" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.plan === "premium"
                          ? "bg-accent-soft text-accent-soft-foreground"
                          : "bg-border text-muted-foreground"
                      }`}
                    >
                      {u.plan === "premium" ? "Premium" : "Darmowy"}
                    </span>
                    {u.purchasedCredits > 0 && (
                      <span className="text-xs text-muted-foreground">+{u.purchasedCredits} kred.</span>
                    )}
                  </div>
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
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={pendingId === u.id}
                      onClick={() => runAction(u.id, { action: "setPlan", plan: u.plan === "premium" ? "free" : "premium" })}
                      className={`${buttonSecondary} px-2.5 py-1.5 text-xs`}
                    >
                      {u.plan === "premium" ? "Cofnij do Free" : "Nadaj Premium"}
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === u.id}
                      onClick={() => runAction(u.id, { action: "addCredits", amount: 2 })}
                      className={`${buttonSecondary} px-2.5 py-1.5 text-xs`}
                    >
                      +2 kredyty
                    </button>
                    {!u.isAdmin && (
                      <button
                        type="button"
                        disabled={pendingId === u.id}
                        onClick={() => deleteUser(u)}
                        className="rounded-lg border border-danger/30 px-2.5 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Usuń
                      </button>
                    )}
                  </div>
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
