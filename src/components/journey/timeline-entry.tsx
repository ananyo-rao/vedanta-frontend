"use client";

import { Compass, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { AssistantMessage } from "./assistant-message";
import type { TimelineEntry as TEntry } from "@/lib/api/dharma-chat";

export function TimelineEntry({
  entry,
  onEditJournal,
  onDeleteJournal,
}: {
  entry: TEntry;
  onEditJournal?: (id: string, content: string) => void;
  onDeleteJournal?: (id: string) => void;
}) {
  const time = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  switch (entry.type) {
    case "journal":
      return (
        <div className="group flex items-start gap-2">
          <NotebookPen className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-500/70" />
          <div className="flex-1 rounded-xl bg-amber-500/5 border border-amber-500/10 px-3.5 py-2.5">
            <p className="whitespace-pre-wrap text-sm text-on-surface">
              {entry.content}
            </p>
            <span className="mt-1 block text-[10px] text-on-surface-variant/50">
              {time}
            </span>
          </div>
          {(onEditJournal || onDeleteJournal) && (
            <div className="flex shrink-0 gap-1 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
              {onEditJournal && (
                <button
                  onClick={() => onEditJournal(entry.id, entry.content)}
                  aria-label="Edit"
                  className="text-on-surface-variant/40 hover:text-on-surface-variant"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {onDeleteJournal && (
                <button
                  onClick={() => onDeleteJournal(entry.id)}
                  aria-label="Delete"
                  className="text-on-surface-variant/40 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      );

    case "ai_user":
    case "guide_user":
      return (
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-white whitespace-pre-wrap">
            {entry.content}
          </div>
        </div>
      );

    case "ai_assistant":
      return (
        <AssistantMessage
          m={{
            role: "assistant",
            content: entry.content,
            metadata: entry.metadata,
          }}
        />
      );

    case "guide_reply":
      return (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-surface-container-high px-4 py-2.5 text-sm text-on-surface whitespace-pre-wrap">
            <span className="mb-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-primary">
              <Compass className="h-3 w-3" /> Guide
            </span>
            {entry.content}
          </div>
        </div>
      );
  }
}
