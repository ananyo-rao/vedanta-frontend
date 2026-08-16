"use client";

import { useState } from "react";
import { NotebookPen, Loader2, Pencil, Trash2, X, Check } from "lucide-react";
import {
  useJournal,
  useAddJournal,
  useUpdateJournal,
  useDeleteJournal,
} from "@/hooks/use-chat";

// ISO (UTC) -> value for <input type="datetime-local"> in local time.
function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
// datetime-local value -> ISO (UTC); empty stays empty (backend uses now).
function localInputToISO(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}
const fmt = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
};

export default function JournalPage() {
  const { data: entries = [], isLoading } = useJournal();
  const add = useAddJournal();
  const update = useUpdateJournal();
  const del = useDeleteJournal();

  const [content, setContent] = useState("");
  const [when, setWhen] = useState(""); // optional; empty = now
  const [error, setError] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editWhen, setEditWhen] = useState("");

  const handleSave = () => {
    const text = content.trim();
    if (!text || add.isPending) return;
    setError(null);
    add.mutate(
      { content: text, loggedAt: localInputToISO(when) },
      {
        onSuccess: () => {
          setContent("");
          setWhen("");
        },
        onError: (e) =>
          setError(e instanceof Error ? e.message : "Failed to save log"),
      }
    );
  };

  const startEdit = (id: string, c: string, loggedAt: string) => {
    setEditId(id);
    setEditContent(c);
    setEditWhen(isoToLocalInput(loggedAt));
  };
  const saveEdit = () => {
    if (!editId || !editContent.trim()) return;
    update.mutate(
      { id: editId, content: editContent.trim(), loggedAt: localInputToISO(editWhen) },
      { onSuccess: () => setEditId(null) }
    );
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
        <div className="mt-2 flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-on-surface-variant">
            Date
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="rounded-md border border-outline-variant/20 bg-surface-container-low px-2 py-1 text-xs text-on-surface"
            />
            <span className="text-on-surface-variant/60">(defaults to now)</span>
          </label>
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
        {entries.map((e) => (
          <div
            key={e.id}
            className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-3"
          >
            {editId === e.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(ev) => setEditContent(ev.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50"
                />
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="datetime-local"
                    value={editWhen}
                    onChange={(ev) => setEditWhen(ev.target.value)}
                    className="rounded-md border border-outline-variant/20 bg-surface-container-low px-2 py-1 text-xs text-on-surface"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={saveEdit}
                      disabled={update.isPending}
                      className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" /> Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="group">
                <p className="whitespace-pre-wrap text-sm text-on-surface">{e.content}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[11px] text-on-surface-variant">{fmt(e.logged_at)}</p>
                  <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(e.id, e.content, e.logged_at)}
                      aria-label="Edit"
                      className="text-on-surface-variant hover:text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => del.mutate(e.id)}
                      aria-label="Delete"
                      className="text-on-surface-variant hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
