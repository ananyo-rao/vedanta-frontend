"use client";

import { useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaveStudentNote } from "@/hooks/use-guide-students";
import { StudentNoteHistory } from "./student-note-history";
import type { StudentNote } from "@/lib/api/dharma-guide";

/**
 * The guide's running note on a student. Saving appends a new version rather
 * than overwriting, so the note can be rewritten freely as the guide's reading
 * of the student changes, without losing what they thought before.
 */
export function StudentNoteEditor({
  clerkId,
  note,
}: {
  clerkId: string;
  note: StudentNote | null;
}) {
  const save = useSaveStudentNote(clerkId);
  const [draft, setDraft] = useState(note?.content ?? "");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Adopt the stored note whenever a new version arrives (including our own
  // save), but never clobber an edit in progress.
  useEffect(() => {
    if (!save.isPending) setDraft(note?.content ?? "");
  }, [note, save.isPending]);

  const dirty = draft.trim() !== (note?.content ?? "").trim();

  const handleSave = () => {
    const content = draft.trim();
    if (!content || save.isPending) return;
    setError(null);
    save.mutate(content, {
      onError: (e) =>
        setError(e instanceof Error ? e.message : "Failed to save note"),
    });
  };

  return (
    <section className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-on-surface">Current note</h2>
          {note?.created_at && (
            <p className="text-xs text-on-surface-variant">
              Updated {new Date(note.created_at).toLocaleDateString()}
              {note.author_name ? ` by ${note.author_name}` : ""}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHistoryOpen(true)}
          className="gap-1.5"
        >
          <History className="h-4 w-4" />
          View history
        </Button>
      </header>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={6}
        placeholder="What you have understood about this student — their temperament, what they are working through, what to watch for."
        className="w-full resize-y rounded-lg border border-outline-variant/20 bg-surface px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary/50"
      />

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <div className="mt-3 flex items-center gap-2">
        <Button onClick={handleSave} disabled={!dirty || save.isPending}>
          {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save note
        </Button>
        {dirty && !save.isPending && (
          <span className="text-xs text-on-surface-variant">
            Saving keeps the previous version in history.
          </span>
        )}
      </div>

      <StudentNoteHistory
        clerkId={clerkId}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </section>
  );
}
