"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useHabits,
  useRecordCheckin,
  useUpdateHabitStatus,
} from "@/hooks/use-habits";
import { UnifiedCalendar } from "@/components/tapas/rolling-calendar";
import { DayChecklist } from "@/components/tapas/day-checklist";
import { CreateHabitDialog } from "@/components/tapas/create-habit-dialog";
import { CelebrationBurst } from "@/components/tapas/celebration-burst";
import { TapasEmptyState } from "@/components/tapas/empty-state";
import { MasteryDialog } from "@/components/tapas/mastery-dialog";
import { ManageHabitsDialog } from "@/components/tapas/manage-habits-dialog";

export default function TapasPage() {
  const { data: habits, isLoading, error } = useHabits();
  const recordCheckin = useRecordCheckin();
  const updateStatus = useUpdateHabitStatus();
  const [showCreate, setShowCreate] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [celebrationTier, setCelebrationTier] = useState<1 | 2 | 3 | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [masteredHabit, setMasteredHabit] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const activeHabits = (habits?.filter((h) => h.status === "active") ?? [])
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const handleCheckin = async (
    habitId: string,
    date: string,
    completed: boolean,
    reflection?: string
  ) => {
    const result = await recordCheckin.mutateAsync({
      habitId,
      input: { date, completed, reflection },
    });
    if (!completed) {
      setCelebrationTier(null);
    } else if (date === today && result.habit) {
      const prevCount = activeHabits.filter(
        (h) =>
          h.id !== habitId &&
          (h.checkins ?? []).some((c) => c.date === today && c.completed)
      ).length;
      const tier = Math.min(prevCount + 1, 3) as 1 | 2 | 3;
      setCelebrationTier(tier);
    }
    if (result.habit?.status === "formed") {
      setMasteredHabit({ id: result.habit.id, name: result.habit.name });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-on-surface-variant">Failed to load habits.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h1 className="text-2xl font-serif text-on-surface">Tapas</h1>
        </div>
        {activeHabits.length > 0 && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowManage(true)}
            >
              <Settings className="mr-1 h-4 w-4" />
              Manage
            </Button>
            {activeHabits.length < 3 && (
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="mr-1 h-4 w-4" />
                New Habit
              </Button>
            )}
          </div>
        )}
      </div>

      {!habits || habits.length === 0 ? (
        <TapasEmptyState onCreateClick={() => setShowCreate(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_20rem] gap-4 items-start">
          <UnifiedCalendar
            habits={activeHabits}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          <DayChecklist
            habits={activeHabits}
            selectedDate={selectedDate}
            onCheckin={handleCheckin}
            isPending={recordCheckin.isPending}
          />
        </div>
      )}

      <ManageHabitsDialog
        open={showManage}
        onOpenChange={setShowManage}
        habits={activeHabits}
      />

      <CreateHabitDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        activeCount={activeHabits.length}
      />

      {celebrationTier && (
        <CelebrationBurst
          tier={celebrationTier}
          onComplete={() => setCelebrationTier(null)}
        />
      )}

      {masteredHabit && (
        <MasteryDialog
          open
          habitName={masteredHabit.name}
          onMaster={() => {
            updateStatus.mutate({
              habitId: masteredHabit.id,
              status: "formed",
            });
            setMasteredHabit(null);
          }}
          onKeepGoing={() => {
            updateStatus.mutate({
              habitId: masteredHabit.id,
              status: "active",
            });
            setMasteredHabit(null);
          }}
        />
      )}
    </div>
  );
}
