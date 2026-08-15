"use client";

import { useState } from "react";
import { NotebookPen, Loader2 } from "lucide-react";
import { useJournal, useAddJournal } from "@/hooks/use-chat";

export default function JournalPage() {
  const { data: entries = [], isLoading } = useJournal();
  const add = useAddJournal();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fmt = (s: string) => s.replace("T", " ").replace("Z", " UTC");

  const handleSave = () => {
    const text = content.trim();
    if (!text || add.isPending) return;
    setError(null);
    add.mutate(text, {
      onSuccess: () => setContent(""),
      onError: (e) =>
        setError(e instanceof Error ? e.message : "Failed to save log"),
    });
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col">
      <div className="mb-4 flex items-center gap-2">
        <NotebookPen className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-lg font-semibold text-on-surface">Journal</h1>
          <p className="text-sm text-on-surface-variant">
            Your private, timestamped logs. Only you can see these.
          </p>
        </div>
      </div>

      {/* Composer */}
      <div className="mb-4 rounded-xl border border-outline-variant/10 bg-surface-container-low p-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a log…"
          rows={3}
          className="w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary/50"
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!content.trim() || add.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {add.isPending ? "Saving…" : "Save log"}
          </button>
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        {!isLoading && entries.length === 0 && (
          <p className="py-8 text-center text-sm text-on-surface-variant">
            No logs yet. Write your first one above.
          </p>
        )}
        {entries.map((e, i) => (
          <div
            key={i}
            className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-3"
          >
            <p className="whitespace-pre-wrap text-sm text-on-surface">
              {e.content}
            </p>
            <p className="mt-1 text-[11px] text-on-surface-variant">
              {fmt(e.created_at)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
