"use client";

import { useMemo, useState } from "react";
import {
  format,
  isToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HabitWithCheckins } from "@/types/habits";

export const HABIT_ICONS = ["🏆", "🥇", "🌟"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

interface UnifiedCalendarProps {
  habits: HabitWithCheckins[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export function UnifiedCalendar({
  habits,
  selectedDate,
  onDateSelect,
}: UnifiedCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const checkinMap = useMemo(() => {
    const map = new Map<string, (boolean | undefined)[]>();
    for (let i = 0; i < habits.length; i++) {
      for (const c of habits[i].checkins ?? []) {
        if (!map.has(c.date)) {
          map.set(c.date, new Array(habits.length).fill(undefined));
        }
        map.get(c.date)![i] = c.completed;
      }
    }
    return map;
  }, [habits]);

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    const rows: Date[][] = [];
    let day = calStart;
    while (day <= calEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [currentMonth]);

  const today = new Date();

  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-serif text-on-surface">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-on-surface-variant">
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {weeks.flat().map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          const isFuture = day > today;
          const isSelected = selectedDate === dateStr;
          const dayCheckins = checkinMap.get(dateStr);

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isFuture || !inMonth}
              onClick={() => onDateSelect(dateStr)}
              className={`flex flex-col items-center gap-0.5 py-1.5 min-h-[52px] text-xs transition-colors rounded-md
                ${!inMonth ? "opacity-20 pointer-events-none" : ""}
                ${isTodayDate ? "ring-2 ring-primary" : ""}
                ${isSelected ? "bg-primary/10" : ""}
                ${!isFuture && inMonth && !isSelected ? "hover:bg-surface-container-high cursor-pointer" : ""}
                ${isFuture ? "opacity-40 cursor-default" : ""}
              `}
            >
              <span className="tabular-nums font-medium">
                {format(day, "d")}
              </span>
              {inMonth && !isFuture && habits.length > 0 && (
                <div className="flex gap-px items-center">
                  {habits.map((h, i) => {
                    const habitStart = (
                      h.started_at ?? h.created_at
                    ).slice(0, 10);
                    if (dateStr < habitStart) return null;
                    const completed = dayCheckins?.[i] === true;
                    return (
                      <span
                        key={h.id}
                        className={`text-[10px] leading-none ${completed ? "" : "opacity-15"}`}
                      >
                        {HABIT_ICONS[i] ?? "⭐"}
                      </span>
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {habits.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2 border-t border-surface-container-high text-[11px] text-on-surface-variant">
          {habits.map((h, i) => (
            <span key={h.id} className="flex items-center gap-1">
              <span>{HABIT_ICONS[i]}</span> {h.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
