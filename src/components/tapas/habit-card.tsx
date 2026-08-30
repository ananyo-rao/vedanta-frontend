"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Pause, Play, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MissReasonDialog } from "@/components/tapas/miss-reason-dialog";
import {
  useRecordCheckin,
  useUpdateHabitStatus,
  useDeleteHabit,
} from "@/hooks/use-habits";
import type { HabitWithCheckins } from "@/types/habits";

const MILESTONES = [
  { threshold: 7, label: "Spark", emoji: "✨" },
  { threshold: 21, label: "Flame", emoji: "🔥" },
  { threshold: 66, label: "Fire", emoji: "🌟" },
];

interface HabitCardProps {
  habit: HabitWithCheckins;
  activeCount: number;
  todayCompletedCount: number;
  onCelebrate: (tier: number) => void;
}

export function HabitCard({
  habit,
  activeCount,
  todayCompletedCount,
  onCelebrate,
}: HabitCardProps) {
  const recordCheckin = useRecordCheckin();
  const updateStatus = useUpdateHabitStatus();
  const deleteHabit = useDeleteHabit();
  const [missDate, setMissDate] = useState<string | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const checkins = habit.checkins ?? [];
  const todayCheckin = checkins.find((c) => c.date === today);
  const isCompletedToday = todayCheckin?.completed === true;

  const handleCheckin = async (date: string, completed: boolean, reflection?: string) => {
    const result = await recordCheckin.mutateAsync({
      habitId: habit.id,
      input: { date, completed, reflection },
    });
    if (completed && date === today && result.habit) {
      const newCompleted = todayCompletedCount + 1;
      if (newCompleted >= 1 && newCompleted <= 3) {
        onCelebrate(newCompleted);
      }
    }
  };

  const handleMissSubmit = (reflection?: string) => {
    if (missDate) {
      handleCheckin(missDate, false, reflection);
      setMissDate(null);
    }
  };

  const handleStatusToggle = () => {
    const newStatus = habit.status === "active" ? "paused" : "active";
    updateStatus.mutate({ habitId: habit.id, status: newStatus });
  };

  const handleDelete = () => {
    deleteHabit.mutate(habit.id);
  };

  return (
    <Card className="space-y-3 border-surface-container-high bg-surface-container-lowest p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-on-surface">{habit.name}</h3>
            {habit.category && (
              <Badge variant="secondary" className="text-xs">
                {habit.category}
              </Badge>
            )}
          </div>
          {(habit.cue || habit.reward) && (
            <p className="text-xs text-on-surface-variant">
              {habit.cue && <span>{habit.cue}</span>}
              {habit.cue && habit.reward && <span> &rarr; </span>}
              {habit.reward && <span className="italic">{habit.reward}</span>}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm">🏆</span>
          <span className="text-sm font-medium text-on-surface">
            {habit.streak_current} days
          </span>
        </div>
      </div>

      {habit.status === "active" && !todayCheckin && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleCheckin(today, true)}
            disabled={recordCheckin.isPending}
            className="gap-1"
          >
            <Check className="h-4 w-4" />
            Completed
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMissDate(today)}
            disabled={recordCheckin.isPending}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            Missed
          </Button>
        </div>
      )}

      {isCompletedToday && (
        <div className="rounded-md bg-green-50 px-3 py-2">
          <p className="text-sm font-medium text-green-700">Completed today</p>
          {habit.reward && (
            <p className="text-xs text-green-600">
              Time for your reward: {habit.reward}
            </p>
          )}
        </div>
      )}
      {todayCheckin && !todayCheckin.completed && (
        <p className="text-sm text-on-surface-variant">Missed today</p>
      )}

      {MILESTONES.filter((m) => habit.streak_best >= m.threshold).length >
        0 && (
        <div className="flex flex-wrap gap-1.5">
          {MILESTONES.filter((m) => habit.streak_best >= m.threshold).map(
            (m) => (
              <span
                key={m.label}
                className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600"
              >
                {m.emoji} {m.label}
              </span>
            )
          )}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-surface-container-high pt-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleStatusToggle}
          disabled={updateStatus.isPending}
          className="gap-1 text-xs"
        >
          {habit.status === "active" ? (
            <>
              <Pause className="h-3 w-3" /> Pause
            </>
          ) : (
            <>
              <Play className="h-3 w-3" /> Resume
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={deleteHabit.isPending}
          className="gap-1 text-xs text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3" /> Delete
        </Button>
      </div>

      <MissReasonDialog
        open={!!missDate}
        onOpenChange={(open) => !open && setMissDate(null)}
        onSubmit={handleMissSubmit}
      />
    </Card>
  );
}
