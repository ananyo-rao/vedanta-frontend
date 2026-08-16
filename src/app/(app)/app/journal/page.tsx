"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Pencil,
  Trash2,
  Check,
  X,
  Feather,
} from "lucide-react";
import {
  useJournal,
  useAddJournal,
  useUpdateJournal,
  useDeleteJournal,
} from "@/hooks/use-chat";
import type { JournalEntry } from "@/lib/api/dharma-chat";

const pad = (n: number) => String(n).padStart(2, "0");
const keyOfDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const keyOfISO = (iso: string) => keyOfDate(new Date(iso));
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function JournalPage() {
  const { data: entries = [] } = useJournal();
  const add = useAddJournal();
  const update = useUpdateJournal();
  const del = useDeleteJournal();

  const [current, setCurrent] = useState<Date>(startOfDay(new Date()));
  const [note, setNote] = useState("");
  const [flip, setFlip] = useState<"" | "next" | "prev">("");
  const [showCal, setShowCal] = useState(false);
  const [calMonth, setCalMonth] = useState<Date>(startOfDay(new Date()));
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Group entries by local day.
  const byDay = useMemo(() => {
    const m = new Map<string, JournalEntry[]>();
    for (const e of entries) {
      const k = keyOfISO(e.logged_at);
      (m.get(k) ?? m.set(k, []).get(k)!).push(e);
    }
    for (const list of m.values())
      list.sort((a, b) => a.logged_at.localeCompare(b.logged_at));
    return m;
  }, [entries]);

  const todayKey = keyOfDate(startOfDay(new Date()));
  const curKey = keyOfDate(current);
  const dayEntries = byDay.get(curKey) ?? [];

  // ‹ › flip only between days that have content (skip empty days).
  const entryDayKeys = useMemo(() => [...byDay.keys()].sort(), [byDay]);
  const prevKey = useMemo(() => {
    let r: string | null = null;
    for (const k of entryDayKeys) if (k < curKey) r = k;
    return r;
  }, [entryDayKeys, curKey]);
  const nextKey = useMemo(
    () => entryDayKeys.find((k) => k > curKey) ?? null,
    [entryDayKeys, curKey]
  );
  const dateFromKey = (k: string) => {
    const [yy, mm, dd] = k.split("-").map(Number);
    return new Date(yy, mm - 1, dd);
  };

  const turn = (dir: "prev" | "next") => {
    const k = dir === "next" ? nextKey : prevKey;
    if (!k) return;
    setFlip(dir);
    setCurrent(dateFromKey(k));
    setEditId(null);
    setTimeout(() => setFlip(""), 260);
  };

  const goToday = () => {
    setCurrent(startOfDay(new Date()));
    setEditId(null);
  };

  const pickDate = (d: Date) => {
    setCurrent(startOfDay(d));
    setShowCal(false);
    setEditId(null);
  };

  const addNote = () => {
    const text = note.trim();
    if (!text || add.isPending) return;
    const now = new Date();
    const dt = new Date(
      current.getFullYear(), current.getMonth(), current.getDate(),
      now.getHours(), now.getMinutes(), now.getSeconds()
    );
    add.mutate(
      { content: text, loggedAt: dt.toISOString() },
      { onSuccess: () => setNote("") }
    );
  };

  const saveEdit = () => {
    if (!editId || !editText.trim()) return;
    update.mutate(
      { id: editId, content: editText.trim() }, // keep original date
      { onSuccess: () => setEditId(null) }
    );
  };

  const headline = current.toLocaleDateString([], {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center gap-2 text-on-surface-variant">
        <Feather className="h-4 w-4 text-primary" />
        <span className="text-sm">Your journal — a private page for each day.</span>
      </div>

      {/* The page */}
      <div className="relative">
        <div
          key={curKey}
          className={`rounded-2xl border border-[#e7dcc5] bg-[#faf6ee] p-6 shadow-[0_10px_30px_-12px_rgba(74,63,53,0.45)] ${
            flip === "next" ? "journal-flip-next" : flip === "prev" ? "journal-flip-prev" : ""
          }`}
          style={{ minHeight: "60vh" }}
        >
          {/* Date headline */}
          <div className="mb-5 text-center">
            <h1 className="font-serif text-2xl text-[#4a3f35]">{headline}</h1>
            <div className="mx-auto mt-2 h-px w-24 bg-[#c9a24a]" />
            {curKey === todayKey && (
              <span className="mt-1 inline-block text-[11px] uppercase tracking-widest text-[#a08a5b]">
                Today
              </span>
            )}
          </div>

          {/* Entries */}
          {dayEntries.length === 0 ? (
            <p className="py-10 text-center font-serif text-[#9c8f7e] italic">
              No entries for this day. Write one below.
            </p>
          ) : (
            <div className="space-y-0">
              {dayEntries.map((e) => (
                <div
                  key={e.id}
                  className="group flex gap-3 border-b border-dashed border-[#e2d7c0] py-3"
                >
                  <span className="mt-0.5 w-12 shrink-0 font-mono text-xs text-[#b3a488]">
                    {timeOf(e.logged_at)}
                  </span>
                  {editId === e.id ? (
                    <div className="flex-1">
                      <textarea
                        value={editText}
                        onChange={(ev) => setEditText(ev.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-md border border-[#e2d7c0] bg-white/60 px-2 py-1 font-serif text-[15px] text-[#3f362c] outline-none focus:border-[#c9a24a]"
                      />
                      <div className="mt-1 flex gap-2">
                        <button onClick={saveEdit} className="flex items-center gap-1 text-xs text-[#6b5d49] hover:text-[#4a3f35]">
                          <Check className="h-3.5 w-3.5" /> Save
                        </button>
                        <button onClick={() => setEditId(null)} className="flex items-center gap-1 text-xs text-[#a4967d]">
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="flex-1 whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-[#3f362c]">
                        {e.content}
                      </p>
                      <div className="flex shrink-0 gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => { setEditId(e.id); setEditText(e.content); }}
                          aria-label="Edit"
                          className="text-[#b3a488] hover:text-[#6b5d49]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => del.mutate(e.id)}
                          aria-label="Delete"
                          className="text-[#b3a488] hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Write on the page */}
          <div className="mt-5 border-t border-[#e7dcc5] pt-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs text-[#b3a488]">
              <Feather className="h-3.5 w-3.5 text-[#c9a24a]" /> Write a note
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`Write a note for ${current.toLocaleDateString([], { month: "long", day: "numeric" })}…`}
              rows={10}
              className="w-full resize-y bg-transparent font-serif text-[15px] leading-relaxed text-[#3f362c] placeholder:text-[#bcb09a] outline-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={addNote}
                disabled={!note.trim() || add.isPending}
                className="rounded-lg bg-[#7a6a4f] px-4 py-1.5 text-sm text-[#faf6ee] hover:bg-[#6b5d49] disabled:opacity-40"
              >
                {add.isPending ? "Adding…" : "Add note"}
              </button>
            </div>
          </div>
        </div>

        {/* Page flip controls */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => turn("prev")}
            disabled={!prevKey}
            aria-label="Previous day with entries"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToday}
            className="rounded-full px-4 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container-high"
          >
            Today
          </button>
          <div className="relative">
            <button
              onClick={() => { setShowCal((v) => !v); setCalMonth(startOfDay(current)); }}
              aria-label="Open calendar"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high"
            >
              <CalendarDays className="h-5 w-5" />
            </button>
            {showCal && (
              <Calendar
                month={calMonth}
                setMonth={setCalMonth}
                selected={current}
                daysWithEntries={new Set(byDay.keys())}
                onPick={pickDate}
                onClose={() => setShowCal(false)}
              />
            )}
          </div>
          <button
            onClick={() => turn("next")}
            disabled={!nextKey}
            aria-label="Next day with entries"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .journal-flip-next { animation: flipNext 0.26s ease; transform-origin: left center; }
        .journal-flip-prev { animation: flipPrev 0.26s ease; transform-origin: right center; }
        @keyframes flipNext {
          0% { opacity: 0.4; transform: rotateY(-8deg) translateX(10px); }
          100% { opacity: 1; transform: none; }
        }
        @keyframes flipPrev {
          0% { opacity: 0.4; transform: rotateY(8deg) translateX(-10px); }
          100% { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

function Calendar({
  month, setMonth, selected, daysWithEntries, onPick, onClose,
}: {
  month: Date;
  setMonth: (d: Date) => void;
  selected: Date;
  daysWithEntries: Set<string>;
  onPick: (d: Date) => void;
  onClose: () => void;
}) {
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));

  const selKey = keyOfDate(selected);
  const todayKey = keyOfDate(startOfDay(new Date()));

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute bottom-11 left-1/2 z-20 w-64 -translate-x-1/2 rounded-xl border border-outline-variant/20 bg-surface-container-high p-3 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <button onClick={() => setMonth(new Date(y, m - 1, 1))} className="rounded p-1 hover:bg-surface-container-highest">
            <ChevronLeft className="h-4 w-4 text-on-surface-variant" />
          </button>
          <span className="text-sm font-medium text-on-surface">{MONTHS[m]} {y}</span>
          <button onClick={() => setMonth(new Date(y, m + 1, 1))} className="rounded p-1 hover:bg-surface-container-highest">
            <ChevronRight className="h-4 w-4 text-on-surface-variant" />
          </button>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] text-on-surface-variant">
          {WEEKDAYS.map((w) => <span key={w}>{w[0]}</span>)}
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
                  isSel ? "bg-primary text-white" : isToday ? "text-primary" : "text-on-surface hover:bg-surface-container-highest"
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
    </>
  );
}
