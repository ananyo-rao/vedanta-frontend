"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useGuideOptions,
  useAssignGuide,
  useUnassignGuide,
} from "@/hooks/use-guide-assignments";

interface AssignGuideSheetProps {
  student: { clerk_id: string; name: string; email: string } | null;
  currentGuideId?: string;
  currentGuideName?: string;
  onOpenChange: (open: boolean) => void;
}

/**
 * Assign or reassign a member's guide. Reassignment is the same action as a
 * first assignment — the select simply starts on whoever holds them now.
 */
export function AssignGuideSheet({
  student,
  currentGuideId,
  currentGuideName,
  onOpenChange,
}: AssignGuideSheetProps) {
  const { data: guides = [], isLoading } = useGuideOptions();
  const assign = useAssignGuide();
  const unassign = useUnassignGuide();
  const [selected, setSelected] = useState(currentGuideId ?? "");

  useEffect(() => {
    setSelected(currentGuideId ?? "");
  }, [currentGuideId, student?.clerk_id]);

  if (!student) return null;

  const busy = assign.isPending || unassign.isPending;

  const handleAssign = () => {
    if (!selected || busy) return;
    assign.mutate(
      { studentClerkId: student.clerk_id, guideClerkId: selected },
      {
        onSuccess: () => {
          toast.success("Guide assigned. They have been notified.");
          onOpenChange(false);
        },
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : "Failed to assign guide"),
      }
    );
  };

  const handleUnassign = () => {
    if (busy) return;
    unassign.mutate(student.clerk_id, {
      onSuccess: () => {
        toast.success("Returned to the unassigned pool.");
        onOpenChange(false);
      },
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : "Failed to unassign guide"),
    });
  };

  return (
    <Sheet open={!!student} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Assign a guide</SheetTitle>
          <SheetDescription>
            {student.name || student.email}
            {currentGuideName
              ? ` is currently guided by ${currentGuideName}.`
              : " has no guide yet."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="guide-select">Guide</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 py-2 text-sm text-on-surface-variant">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading teachers…
              </div>
            ) : guides.length === 0 ? (
              <p className="py-2 text-sm text-on-surface-variant">
                No one has the teacher role yet. Change someone&apos;s role to
                Teacher first.
              </p>
            ) : (
              <select
                id="guide-select"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="mt-1 w-full rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a guide…</option>
                {guides.map((g) => (
                  <option key={g.clerk_id} value={g.clerk_id}>
                    {g.name || g.email} ({g.student_count}{" "}
                    {g.student_count === 1 ? "student" : "students"})
                  </option>
                ))}
              </select>
            )}
          </div>

          <p className="text-xs text-on-surface-variant">
            Both the guide and the student are notified in the app.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleAssign}
              disabled={!selected || selected === currentGuideId || busy}
            >
              {assign.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {currentGuideId ? "Reassign" : "Assign"}
            </Button>
            {currentGuideId && (
              <Button
                variant="secondary"
                onClick={handleUnassign}
                disabled={busy}
              >
                Unassign
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
