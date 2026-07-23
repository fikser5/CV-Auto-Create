"use client";

import { useEffect, useState } from "react";
import { input } from "@/lib/ui";

const MONTHS = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear + 1 - 1960 + 1 }, (_, i) => currentYear + 1 - i);

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parseValue(value: string): { year: string; month: string; day: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return { year: "", month: "", day: "" };
  return { year: match[1], month: match[2], day: match[3] };
}

const selectClass = `${input} appearance-none`;

export function DateSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  // Kept as local state (not derived straight from `value` on every render) so
  // that picking day → month → year doesn't lose earlier picks: while the
  // selection is incomplete, `value` from the parent is "" and re-deriving
  // from it on each keystroke would wipe out whatever was already chosen.
  const [parts, setParts] = useState(() => parseValue(value));

  // Still reconcile when the parent value changes for a reason other than our
  // own onChange — e.g. the "+ Dodaj" handler resetting the form after save.
  useEffect(() => {
    setParts(parseValue(value));
  }, [value]);

  const maxDay = parts.year && parts.month ? daysInMonth(Number(parts.year), Number(parts.month)) : 31;

  function update(next: { year: string; month: string; day: string }) {
    setParts(next);
    onChange(next.year && next.month && next.day ? `${next.year}-${next.month}-${next.day}` : "");
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        aria-label="Dzień"
        className={selectClass}
        value={parts.day}
        onChange={(e) => update({ ...parts, day: e.target.value })}
      >
        <option value="">Dzień</option>
        {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
          <option key={d} value={String(d).padStart(2, "0")}>
            {d}
          </option>
        ))}
      </select>
      <select
        aria-label="Miesiąc"
        className={selectClass}
        value={parts.month}
        onChange={(e) => {
          const nextMonth = e.target.value;
          const clampedDay =
            parts.day && nextMonth && Number(parts.day) > daysInMonth(Number(parts.year) || currentYear, Number(nextMonth))
              ? ""
              : parts.day;
          update({ ...parts, month: nextMonth, day: clampedDay });
        }}
      >
        <option value="">Miesiąc</option>
        {MONTHS.map((label, i) => (
          <option key={label} value={String(i + 1).padStart(2, "0")}>
            {label}
          </option>
        ))}
      </select>
      <select
        aria-label="Rok"
        className={selectClass}
        value={parts.year}
        onChange={(e) => update({ ...parts, year: e.target.value })}
      >
        <option value="">Rok</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
