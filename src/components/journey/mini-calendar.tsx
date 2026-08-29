"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export const pad = (n: number) => String(n).padStart(2, "0");
export const keyOfDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const keyOfISO = (iso: string) => keyOfDate(new Date(iso));
export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function MiniCalendar({
  month,
  setMonth,
  selected,
  daysWithEntries,
  onPick,
}: {
  month: Date;
  setMonth: (d: Date) => void;
  selected: Date;
  daysWithEntries: Set<string>;
  onPick: (d: Date) => void;
}) {
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));

  const selKey = keyOfDate(selected);
  const todayKey = keyOfDate(startOfDay(new Date()));

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setMonth(new Date(y, m - 1, 1))}
          className="rounded p-1 hover:bg-surface-container-highest"
        >
          <ChevronLeft className="h-4 w-4 text-on-surface-variant" />
        </button>
        <span className="text-sm font-medium text-on-surface">
          {MONTHS[m]} {y}
        </span>
        <button
          onClick={() => setMonth(new Date(y, m + 1, 1))}
          className="rounded p-1 hover:bg-surface-container-highest"
        >
          <ChevronRight className="h-4 w-4 text-on-surface-variant" />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] text-on-surface-variant">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w[0]}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const k = keyOfDate(d);
          const has = daysWithEntries.has(k);
          const isSel = k === selKey;
          const isToday = k === todayKey;
          return (
            <button
              key={i}
              onClick={() => onPick(d)}
              className={`relative flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                isSel
                  ? "bg-primary text-white"
                  : isToday
                    ? "text-primary"
                    : "text-on-surface hover:bg-surface-container-highest"
              }`}
            >
              {d.getDate()}
              {has && !isSel && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
