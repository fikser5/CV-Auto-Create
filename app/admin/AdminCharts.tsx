"use client";

import { useState } from "react";
import { card } from "@/lib/ui";

type DayBucket = { date: string; count: number };

function formatDayLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" });
}

type CostBucket = { date: string; cost: number };

export function AdminCharts({
  dayBuckets,
  premiumCount,
  freeCount,
  costBuckets,
}: {
  dayBuckets: DayBucket[];
  premiumCount: number;
  freeCount: number;
  costBuckets: CostBucket[];
}) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<"premium" | "free" | null>(null);
  const [hoveredCostDay, setHoveredCostDay] = useState<number | null>(null);

  const maxCount = Math.max(1, ...dayBuckets.map((b) => b.count));
  const maxCost = Math.max(0.01, ...costBuckets.map((b) => b.cost));
  const total = premiumCount + freeCount || 1;
  const premiumPct = (premiumCount / total) * 100;
  const freePct = (freeCount / total) * 100;

  return (
    <div className="flex flex-col gap-4">
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      {/* Rejestracje w czasie — pojedyncza seria, tytuł pełni rolę legendy */}
      <div className={`${card} flex flex-col gap-4 p-6`}>
        <div>
          <h2 className="font-semibold">Rejestracje w ostatnich 14 dniach</h2>
          <p className="text-sm text-muted-foreground">Liczba nowych kont dziennie.</p>
        </div>
        <div className="relative flex h-40 items-end gap-1.5">
          <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            <div className="border-t border-border/70" />
            <div className="border-t border-border/70" />
            <div className="border-t border-border/70" />
          </div>
          {dayBuckets.map((bucket, i) => {
            const heightPct = bucket.count > 0 ? Math.max((bucket.count / maxCount) * 100, 4) : 0;
            return (
              <div
                key={bucket.date}
                className="group relative flex h-full flex-1 flex-col items-center justify-end"
                onPointerEnter={() => setHoveredDay(i)}
                onPointerLeave={() => setHoveredDay(null)}
                onFocus={() => setHoveredDay(i)}
                onBlur={() => setHoveredDay(null)}
                tabIndex={0}
              >
                {hoveredDay === i && (
                  <div className="pointer-events-none absolute -top-8 z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-lg">
                    <span className="font-semibold">{bucket.count}</span> · {formatDayLabel(bucket.date)}
                  </div>
                )}
                <div
                  className={`w-full max-w-6 rounded-t transition-colors ${hoveredDay === i ? "bg-primary-hover" : "bg-primary"}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-1.5 text-[10px] text-muted-foreground">
          {dayBuckets.map((bucket) => (
            <span key={bucket.date} className="flex-1 text-center">
              {formatDayLabel(bucket.date)}
            </span>
          ))}
        </div>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none hover:text-foreground">Pokaż jako tabelę</summary>
          <table className="mt-2 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-1 font-medium">Data</th>
                <th className="py-1 font-medium">Rejestracje</th>
              </tr>
            </thead>
            <tbody>
              {dayBuckets.map((bucket) => (
                <tr key={bucket.date} className="border-b border-border/50">
                  <td className="py-1 tabular-nums">{formatDayLabel(bucket.date)}</td>
                  <td className="py-1 tabular-nums">{bucket.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>

      {/* Rozkład planów — 2 kategorie, więc legenda zawsze widoczna */}
      <div className={`${card} flex flex-col gap-4 p-6`}>
        <div>
          <h2 className="font-semibold">Rozkład planów</h2>
          <p className="text-sm text-muted-foreground">Darmowy vs Premium.</p>
        </div>
        <div className="flex h-6 w-full overflow-hidden rounded-full bg-border" role="img" aria-label={`Premium: ${premiumCount}, Darmowy: ${freeCount}`}>
          {premiumCount > 0 && (
            <div
              className="h-full cursor-pointer bg-chart-premium transition-opacity"
              style={{ width: `${premiumPct}%`, opacity: hoveredSegment === "free" ? 0.55 : 1 }}
              onPointerEnter={() => setHoveredSegment("premium")}
              onPointerLeave={() => setHoveredSegment(null)}
            />
          )}
          {freeCount > 0 && (
            <div
              className="h-full cursor-pointer bg-chart-free transition-opacity"
              style={{ width: `${freePct}%`, marginLeft: premiumCount > 0 && freeCount > 0 ? "2px" : 0, opacity: hoveredSegment === "premium" ? 0.55 : 1 }}
              onPointerEnter={() => setHoveredSegment("free")}
              onPointerLeave={() => setHoveredSegment(null)}
            />
          )}
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-premium" />
              Premium
            </span>
            <span className="font-medium tabular-nums">
              {premiumCount} ({premiumPct.toFixed(0)}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full bg-chart-free" />
              Darmowy
            </span>
            <span className="font-medium tabular-nums">
              {freeCount} ({freePct.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>
    </div>

      {/* Koszt API Claude — pojedyncza seria, tytuł pełni rolę legendy */}
      <div className={`${card} flex flex-col gap-4 p-6`}>
        <div>
          <h2 className="font-semibold">Koszt API Claude w ostatnich 14 dniach</h2>
          <p className="text-sm text-muted-foreground">
            Szacunek wg cennika Opus 4.8 (5$/1M tokenów wejściowych, 25$/1M wyjściowych), w USD.
          </p>
        </div>
        <div className="relative flex h-32 items-end gap-1.5">
          <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            <div className="border-t border-border/70" />
            <div className="border-t border-border/70" />
            <div className="border-t border-border/70" />
          </div>
          {costBuckets.map((bucket, i) => {
            const heightPct = bucket.cost > 0 ? Math.max((bucket.cost / maxCost) * 100, 4) : 0;
            return (
              <div
                key={bucket.date}
                className="group relative flex h-full flex-1 flex-col items-center justify-end"
                onPointerEnter={() => setHoveredCostDay(i)}
                onPointerLeave={() => setHoveredCostDay(null)}
                onFocus={() => setHoveredCostDay(i)}
                onBlur={() => setHoveredCostDay(null)}
                tabIndex={0}
              >
                {hoveredCostDay === i && (
                  <div className="pointer-events-none absolute -top-8 z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-lg">
                    <span className="font-semibold">${bucket.cost.toFixed(3)}</span> · {formatDayLabel(bucket.date)}
                  </div>
                )}
                <div
                  className={`w-full max-w-6 rounded-t transition-colors ${hoveredCostDay === i ? "bg-primary-hover" : "bg-primary"}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-1.5 text-[10px] text-muted-foreground">
          {costBuckets.map((bucket) => (
            <span key={bucket.date} className="flex-1 text-center">
              {formatDayLabel(bucket.date)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
