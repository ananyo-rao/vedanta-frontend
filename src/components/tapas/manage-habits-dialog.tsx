"use client";

import { useState } from "react";
import { Pencil, Award, Trash2, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useUpdateHabit,
  useUpdateHabitStatus,
  useDeleteHabit,
} from "@/hooks/use-habits";
import { HABIT_ICONS } from "@/components/tapas/rolling-calendar";
import type { HabitWithCheckins, UpdateHabitInput } from "@/types/habits";

interface ManageHabitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: HabitWithCheckins[];
}

export function ManageHabitsDialog({
  open,
  onOpenChange,
  habits,
}: ManageHabitsDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateHabitInput>({});
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    type: "master" | "delete";
  } | null>(null);

  const updateHabit = useUpdateHabit();
  const updateStatus = useUpdateHabitStatus();
  const deleteHabit = useDeleteHabit();

  const startEdit = (habit: HabitWithCheckins) => {
    setEditingId(habit.id);
    setEditForm({
      name: habit.name,
      cue: habit.cue || "",
      reward: habit.reward || "",
    });
    setConfirmAction(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateHabit.mutateAsync({ habitId: editingId, input: editForm });
    setEditingId(null);
    setEditForm({});
  };

  const handleMaster = async (habitId: string) => {
    await updateStatus.mutateAsync({ habitId, status: "formed" });
    setConfirmAction(null);
  };

  const handleDelete = async (habitId: string) => {
    await deleteHabit.mutateAsync(habitId);
    setConfirmAction(null);
    if (habits.length <= 1) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Habits</DialogTitle>
          <DialogDescription>
            Edit your habits, or mark them as mastered.
          </DialogDescription>
        </DialogHeader>

        <div className="divide-y divide-surface-container-high">
          {habits.map((habit, i) => (
            <div key={habit.id} className="py-3 first:pt-0 last:pb-0">
              {editingId === habit.id ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-cue-${i}`} className="text-xs">
                      Trigger (Cue)
                    </Label>
                    <Input
                      id={`edit-cue-${i}`}
                      value={editForm.cue ?? ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, cue: e.target.value }))
                      }
                      placeholder="After my morning coffee..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-name-${i}`} className="text-xs">
                      Habit
                    </Label>
                    <Input
                      id={`edit-name-${i}`}
                      value={editForm.name ?? ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-reward-${i}`} className="text-xs">
                      Reward
                    </Label>
                    <Input
                      id={`edit-reward-${i}`}
                      value={editForm.reward ?? ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, reward: e.target.value }))
                      }
                      placeholder="10 min of music..."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEdit}
                      className="h-7 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      disabled={
                        !editForm.name?.trim() || updateHabit.isPending
                      }
                      className="h-7 text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : confirmAction?.id === habit.id ? (
                <div className="space-y-2">
                  <p className="text-sm text-on-surface">
                    {confirmAction.type === "master"
                      ? `Mark "${habit.name}" as mastered? This frees up a habit slot.`
                      : `Delete "${habit.name}"? This cannot be undone.`}
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmAction(null)}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        confirmAction.type === "delete"
                          ? "destructive"
                          : "default"
                      }
                      onClick={() =>
                        confirmAction.type === "master"
                          ? handleMaster(habit.id)
                          : handleDelete(habit.id)
                      }
                      disabled={
                        updateStatus.isPending || deleteHabit.isPending
                      }
                      className="h-7 text-xs"
                    >
                      {confirmAction.type === "master"
                        ? "Mark Mastered"
                        : "Delete"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{HABIT_ICONS[i]}</span>
                      <span className="text-sm font-semibold text-on-surface">
                        {habit.name}
                      </span>
                    </div>
                    {(habit.cue || habit.reward) ? (
                      <p className="text-xs text-on-surface-variant/60 mt-0.5">
                        {habit.cue && <span>{habit.cue}</span>}
                        {habit.cue && habit.reward && <span> &rarr; </span>}
                        {habit.reward && (
                          <span className="italic">{habit.reward}</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-xs text-on-surface-variant/40 mt-0.5 italic">
                        No cue/reward set — tap edit to add
                      </p>
                    )}
                    <p className="text-xs text-primary mt-0.5">
                      🔥 {habit.streak_current}d streak · Best:{" "}
                      {habit.streak_best}d
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(habit)}
                      className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                      title="Edit habit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({ id: habit.id, type: "master" })
                      }
                      className="p-1.5 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                      title="Mark as mastered"
                    >
                      <Award className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({ id: habit.id, type: "delete" })
                      }
                      className="p-1.5 rounded-md text-on-surface-variant hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      title="Delete habit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
