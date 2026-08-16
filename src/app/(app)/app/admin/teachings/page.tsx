"use client";

import { useState } from "react";
import { GraduationCap, Plus, Trash2, Loader2 } from "lucide-react";
import { useTeachings, useAddTeaching, useDeleteTeaching } from "@/hooks/use-teachings";

type TType = "vedantic" | "psychological";

function localToISO(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}
const fmt = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
};

export default function AdminTeachingsPage() {
  const { data: teachings = [], isLoading } = useTeachings();
  const add = useAddTeaching();
  const del = useDeleteTeaching();

  const [type, setType] = useState<TType>("vedantic");
  const [questions, setQuestions] = useState("");
  const [description, setDescription] = useState("");
  const [when, setWhen] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (!description.trim() || add.isPending) return;
    setError(null);
    add.mutate(
      {
        type,
        questions: questions.split("\n").map((q) => q.trim()).filter(Boolean),
        description: description.trim(),
        timestamp: localToISO(when),
      },
      {
        onSuccess: () => {
          setQuestions("");
          setDescription("");
          setWhen("");
        },
        onError: (e) =>
          setError(e instanceof Error ? e.message : "Failed to add teaching"),
      }
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-lg font-semibold text-on-surface">Teachings</h1>
          <p className="text-sm text-on-surface-variant">
            Store Vedantic &amp; psychological teachings (admin only).
          </p>
        </div>
      </div>

      {/* Add form */}
      <div className="mb-6 space-y-3 rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
        <div className="flex gap-2">
          {(["vedantic", "psychological"] as TType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${
                type === t
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-outline-variant/30 text-on-surface-variant"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          placeholder="Questions a seeker might ask — one per line (optional)"
          rows={3}
          className="w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description of the teaching"
          rows={4}
          className="w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs text-on-surface-variant">
            Timestamp
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="rounded-md border border-outline-variant/20 bg-surface-container-low px-2 py-1 text-xs text-on-surface"
            />
            <span className="text-on-surface-variant/60">(defaults to now)</span>
          </label>
          <button
            onClick={handleAdd}
            disabled={!description.trim() || add.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> {add.isPending ? "Adding…" : "Add teaching"}
          </button>
        </div>
      </div>

      {/* List */}
      <h2 className="mb-2 text-sm font-semibold text-on-surface">
        Teachings ({teachings.length})
      </h2>
      {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      {!isLoading && teachings.length === 0 && (
        <p className="text-sm text-on-surface-variant">No teachings yet. Add one above.</p>
      )}
      <div className="space-y-2">
        {teachings.map((t) => (
          <div
            key={t.id}
            className="group flex items-start justify-between gap-3 rounded-lg border border-outline-variant/10 bg-surface-container-low p-3"
          >
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                    t.type === "psychological"
                      ? "bg-purple-500/15 text-purple-500"
                      : "bg-primary/15 text-primary"
                  }`}
                >
                  {t.type}
                </span>
                <span className="text-[10px] text-on-surface-variant">{fmt(t.logged_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-on-surface">{t.description}</p>
              {t.questions.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {t.questions.map((q, i) => (
                    <li key={i} className="text-[11px] text-on-surface-variant">• {q}</li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => del.mutate(t.id)}
              aria-label="Delete"
              className="text-on-surface-variant opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
