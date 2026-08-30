"use client";

import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useStudentNoteHistory } from "@/hooks/use-guide-students";

/**
 * Every past version of the note, newest first. Read-only: history is a record
 * of how the guide's reading of this student changed, not something to edit.
 */
export function StudentNoteHistory({
  clerkId,
  open,
  onOpenChange,
}: {
  clerkId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: notes = [], isLoading } = useStudentNoteHistory(clerkId, open);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Note history</SheetTitle>
          <SheetDescription>
            Earlier versions, newest first. The first entry is the current note.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && notes.length === 0 && (
            <p className="py-8 text-center text-sm text-on-surface-variant">
              No notes have been written yet.
            </p>
          )}

          {notes.map((note, i) => (
            <article
              key={note.id}
              className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-3"
            >
              <header className="mb-1.5 flex items-center gap-2 text-xs text-on-surface-variant">
                <span>{new Date(note.created_at).toLocaleString()}</span>
                {note.author_name && <span>· {note.author_name}</span>}
                {i === 0 && (
                  <span className="ml-auto font-medium text-primary">
                    Current
                  </span>
                )}
              </header>
              <p className="whitespace-pre-wrap text-sm text-on-surface">
                {note.content}
              </p>
            </article>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
