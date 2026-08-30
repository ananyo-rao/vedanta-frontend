"use client";

import { useState } from "react";
import { format, isToday, parseISO } from "date-fns";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HABIT_ICONS } from "@/components/tapas/rolling-calendar";
import type { HabitWithCheckins } from "@/types/habits";

interface DayChecklistProps {
  habits: HabitWithCheckins[];
  selectedDate: string;
  onCheckin: (
    habitId: string,
    date: string,
    completed: boolean,
    reflection?: string
  ) => void;
  isPending: boolean;
}

export function DayChecklist({
  habits,
  selectedDate,
  onCheckin,
  isPending,
}: DayChecklistProps) {
  const [editingNoteIdx, setEditingNoteIdx] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  const isSelectedToday = isToday(parseISO(selectedDate));
  const dateLabel = format(parseISO(selectedDate), "EEE, MMM d");

  const getCheckin = (habit: HabitWithCheckins) =>
    (habit.checkins ?? []).find((c) => c.date === selectedDate);

  const completedCount = habits.filter(
    (h) => getCheckin(h)?.completed
  ).length;

  const handleToggle = (habit: HabitWithCheckins) => {
    const existing = getCheckin(habit);
    const newCompleted = !existing?.completed;
    onCheckin(
      habit.id,
      selectedDate,
      newCompleted,
      existing?.reflection ?? undefined
    );
  };

  const handleOpenNote = (idx: number, habit: HabitWithCheckins) => {
    if (editingNoteIdx === idx) {
      setEditingNoteIdx(null);
      return;
    }
    const existing = getCheckin(habit);
    setNoteText(existing?.reflection ?? "");
    setEditingNoteIdx(idx);
  };

  const handleSaveNote = (habit: HabitWithCheckins) => {
    const existing = getCheckin(habit);
    const completed = existing?.completed ?? false;
    onCheckin(habit.id, selectedDate, completed, noteText.trim() || undefined);
    setEditingNoteIdx(null);
    setNoteText("");
  };

  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-4 space-y-3">
      <div>
        <h3 className="font-serif text-on-surface">
          {dateLabel}
          {isSelectedToday && (
            <span className="ml-1.5 text-xs font-sans font-semibold text-primary">
              (Today)
            </span>
          )}
        </h3>
        <p className="text-xs text-on-surface-variant">
          {completedCount} of {habits.length} completed
        </p>
      </div>

      <div className="h-1 rounded-full bg-surface-container-high overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{
            width:
              habits.length > 0
                ? `${(completedCount / habits.length) * 100}%`
                : "0%",
          }}
        />
      </div>

      <div className="divide-y divide-surface-container-high">
        {habits.map((habit, i) => {
          const checkin = getCheckin(habit);
          const completed = checkin?.completed === true;
          const missed = checkin?.completed === false;
          const hasNote = !!checkin?.reflection;
          const isEditing = editingNoteIdx === i;

          return (
            <div key={habit.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex gap-2.5 items-start">
                <button
                  type="button"
                  onClick={() => handleToggle(habit)}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center text-[11px] transition-all
                    ${
                      completed
                        ? "bg-green-50 border-green-600 text-green-600 dark:bg-green-950 dark:border-green-400 dark:text-green-400"
                        : missed
                          ? "bg-red-50 border-red-400 text-red-400 dark:bg-red-950 dark:border-red-400"
                          : "border-surface-container-highest hover:border-on-surface-variant"
                    }
                  `}
                >
                  {completed && "✓"}
                  {missed && "✕"}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <span className="text-sm flex-shrink-0 mt-0.5">{HABIT_ICONS[i]}</span>
                      <span className="text-sm font-semibold text-on-surface">
                        {habit.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[11px] font-semibold text-primary tabular-nums">
                        🔥 {habit.streak_current}d
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenNote(i, habit)}
                        className={`p-0.5 rounded transition-colors ${
                          hasNote
                            ? "text-primary"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                        title="Add reflection"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {(habit.cue || habit.reward) && (
                    <p className="text-xs text-on-surface-variant/60 mt-1 leading-relaxed">
                      {habit.cue && (
                        <span className="text-on-surface-variant/60">{habit.cue}</span>
                      )}
                      {habit.cue && <span className="mx-1 text-on-surface-variant/40">&rarr;</span>}
                      <span className="font-medium text-on-surface">
                        {habit.name}
                      </span>
                      {habit.reward && <span className="mx-1 text-on-surface-variant/40">&rarr;</span>}
                      {habit.reward && (
                        <span className="text-on-surface-variant/60 italic">{habit.reward}</span>
                      )}
                    </p>
                  )}

                  {hasNote && !isEditing && (
                    <div
                      className={`mt-1.5 rounded-md px-2.5 py-1.5 text-[11px] italic leading-relaxed ${
                        completed
                          ? "bg-primary/5 text-primary"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {completed ? "✨" : "📝"} {checkin!.reflection}
                    </div>
                  )}

                  {isEditing && (
                    <div className="mt-1.5 space-y-1.5">
                      <Textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder={
                          completed
                            ? "What made today special?"
                            : "Why did you miss this? This helps you reflect later..."
                        }
                        rows={2}
                        className="text-xs"
                        autoFocus
                      />
                      <div className="flex gap-1.5 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[11px] px-2"
                          onClick={() => setEditingNoteIdx(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-6 text-[11px] px-2"
                          onClick={() => handleSaveNote(habit)}
                          disabled={isPending}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {completedCount > 0 && (
        <div className="rounded-md bg-primary/5 border border-primary/10 px-3 py-2 text-xs text-primary">
          <span className="font-semibold">Time for your reward!</span>
          <br />
          {habits
            .filter((h) => getCheckin(h)?.completed)
            .map((h) => h.reward)
            .filter(Boolean)
            .join(" · ")}
        </div>
      )}
    </div>
  );
}
