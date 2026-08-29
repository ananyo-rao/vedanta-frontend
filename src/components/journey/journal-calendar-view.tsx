"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useJournal, useUpdateJournal, useDeleteJournal } from "@/hooks/use-chat";
import { MiniCalendar, keyOfDate, keyOfISO, startOfDay, timeOf } from "./mini-calendar";
import type { JournalEntry } from "@/lib/api/dharma-chat";

export function JournalCalendarView() {
  const { data: entries = [] } = useJournal();
  const update = useUpdateJournal();
  const del = useDeleteJournal();

  const [selected, setSelected] = useState<Date>(startOfDay(new Date()));
  const [month, setMonth] = useState<Date>(startOfDay(new Date()));
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

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

  const curKey = keyOfDate(selected);
  const dayEntries = byDay.get(curKey) ?? [];
  const todayKey = keyOfDate(startOfDay(new Date()));

  const entryDayKeys = useMemo(() => [...byDay.keys()].sort(), [byDay]);
  const prevKey = useMemo(() => {
    let r: string | null = null;
    for (const k of entryDayKeys) if (k < curKey) r = k;
    return r;
  }, [entryDayKeys, curKey]);
  const nextKey = useMemo(
    () => entryDayKeys.find((k) => k > curKey) ?? null,
    [entryDayKeys, curKey],
  );
  const dateFromKey = (k: string) => {
    const [yy, mm, dd] = k.split("-").map(Number);
    return new Date(yy, mm - 1, dd);
  };

  const saveEdit = () => {
    if (!editId || !editText.trim()) return;
    update.mutate({ id: editId, content: editText.trim() }, { onSuccess: () => setEditId(null) });
  };

  const headline = selected.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-1 gap-4 overflow-hidden">
      {/* Calendar sidebar */}
      <div className="w-56 shrink-0 rounded-xl border border-outline-variant/10 bg-surface-container-low p-3">
        <MiniCalendar
          month={month}
          setMonth={setMonth}
          selected={selected}
          daysWithEntries={new Set(byDay.keys())}
          onPick={(d) => { setSelected(startOfDay(d)); setEditId(null); }}
        />
      </div>

      {/* Day detail */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[#e7dcc5] bg-[#faf6ee] p-5">
        <div className="mb-4 text-center">
          <h2 className="font-serif text-xl text-[#4a3f35]">{headline}</h2>
          <div className="mx-auto mt-1.5 h-px w-16 bg-[#c9a24a]" />
          {curKey === todayKey && (
            <span className="mt-1 inline-block text-[10px] uppercase tracking-widest text-[#a08a5b]">
              Today
            </span>
          )}
        </div>

        {dayEntries.length === 0 ? (
          <p className="py-8 text-center font-serif text-[#9c8f7e] italic">
            No entries for this day.
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

        {/* Day navigation */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => prevKey && setSelected(dateFromKey(prevKey))}
            disabled={!prevKey}
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setSelected(startOfDay(new Date())); setEditId(null); }}
            className="text-xs text-on-surface-variant hover:text-on-surface"
          >
            Today
          </button>
          <button
            onClick={() => nextKey && setSelected(dateFromKey(nextKey))}
            disabled={!nextKey}
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
