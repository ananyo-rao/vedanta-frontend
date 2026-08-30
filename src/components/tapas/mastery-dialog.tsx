"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MasteryDialogProps {
  open: boolean;
  habitName: string;
  onMaster: () => void;
  onKeepGoing: () => void;
}

export function MasteryDialog({
  open,
  habitName,
  onMaster,
  onKeepGoing,
}: MasteryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onKeepGoing()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="text-5xl mb-2">🏆</div>
          <DialogTitle className="text-xl">
            You&apos;ve mastered {habitName}!
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            66 days of consistency — this habit is now part of who you are.
            Would you like to mark it as mastered and free up a slot for a new
            habit?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-center pt-2">
          <Button variant="outline" size="sm" onClick={onKeepGoing}>
            Keep going
          </Button>
          <Button size="sm" onClick={onMaster}>
            Mark as mastered
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
