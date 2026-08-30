"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateHabit } from "@/hooks/use-habits";

const CATEGORIES = ["Health", "Mindfulness", "Study", "Exercise", "Other"];

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCount: number;
}

export function CreateHabitDialog({
  open,
  onOpenChange,
  activeCount,
}: CreateHabitDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [cue, setCue] = useState("");
  const [reward, setReward] = useState("");
  const createHabit = useCreateHabit();

  const canCreate =
    name.trim().length > 0 &&
    cue.trim().length > 0 &&
    reward.trim().length > 0 &&
    activeCount < 3;

  const handleCreate = async () => {
    if (!canCreate) return;
    await createHabit.mutateAsync({
      name: name.trim(),
      category,
      cue: cue.trim(),
      reward: reward.trim(),
    });
    setName("");
    setCategory(undefined);
    setCue("");
    setReward("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Habit</DialogTitle>
          <DialogDescription>
            {activeCount} of 3 slots used. Define your cue, habit, and reward.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-cue">Trigger (Cue)</Label>
            <Input
              id="habit-cue"
              placeholder="e.g. After my morning coffee"
              value={cue}
              onChange={(e) => setCue(e.target.value)}
            />
            <p className="text-xs text-on-surface-variant">
              What reminds you to do this habit?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit</Label>
            <Input
              id="habit-name"
              placeholder="e.g. Read for 10 minutes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-reward">Reward</Label>
            <Input
              id="habit-reward"
              placeholder="e.g. 10 min of music"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
            />
            <p className="text-xs text-on-surface-variant">
              What do you get after completing it?
            </p>
          </div>

          {cue.trim() && name.trim() && reward.trim() && (
            <div className="rounded-lg border border-surface-container-high bg-surface-container-lowest p-3 text-center text-sm">
              <span className="text-on-surface-variant">{cue.trim()}</span>
              <span className="mx-2 text-on-surface-variant">&rarr;</span>
              <span className="font-medium text-on-surface">{name.trim()}</span>
              <span className="mx-2 text-on-surface-variant">&rarr;</span>
              <span className="text-on-surface-variant">{reward.trim()}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Category (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setCategory(category === cat ? undefined : cat)
                  }
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    category === cat
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!canCreate || createHabit.isPending}
          >
            {createHabit.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
