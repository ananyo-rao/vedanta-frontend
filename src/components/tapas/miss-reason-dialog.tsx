"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MissReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reflection?: string) => void;
}

export function MissReasonDialog({
  open,
  onOpenChange,
  onSubmit,
}: MissReasonDialogProps) {
  const [reflection, setReflection] = useState("");

  const handleSubmit = () => {
    onSubmit(reflection.trim() || undefined);
    setReflection("");
  };

  const handleSkip = () => {
    onSubmit(undefined);
    setReflection("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Would you like to share why you missed it?</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="e.g. I was travelling and couldn't find time..."
          rows={3}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />
        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
