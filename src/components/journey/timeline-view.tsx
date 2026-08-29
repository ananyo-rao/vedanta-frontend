"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { LiveProgress } from "./assistant-message";
import { TimelineEntry } from "./timeline-entry";
import type {
  TimelineEntry as TEntry,
  StreamStepEvent,
} from "@/lib/api/dharma-chat";

function dateSeparator(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const fmt = (x: Date) =>
    `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;

  if (fmt(d) === fmt(today)) return "Today";
  if (fmt(d) === fmt(yesterday)) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function TimelineView({
  entries,
  isLoading,
  isStreaming,
  liveSteps,
  onEditJournal,
  onDeleteJournal,
}: {
  entries: TEntry[];
  isLoading: boolean;
  isStreaming: boolean;
  liveSteps: StreamStepEvent[];
  onEditJournal?: (id: string, content: string) => void;
  onDeleteJournal?: (id: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length, isStreaming, liveSteps]);

  let lastDate = "";

  return (
    <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && entries.length === 0 && !isStreaming && (
        <div className="flex h-full flex-col items-center justify-center py-12 text-center text-on-surface-variant">
          <p className="text-sm">Your journey begins here. Write something below.</p>
        </div>
      )}

      {entries.map((e) => {
        const eDate = dateSeparator(e.timestamp);
        const showSep = eDate !== lastDate;
        lastDate = eDate;
        return (
          <div key={e.id}>
            {showSep && (
              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-outline-variant/15" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant/50">
                  {eDate}
                </span>
                <div className="h-px flex-1 bg-outline-variant/15" />
              </div>
            )}
            <TimelineEntry
              entry={e}
              onEditJournal={onEditJournal}
              onDeleteJournal={onDeleteJournal}
            />
          </div>
        );
      })}

      {isStreaming && <LiveProgress completedSteps={liveSteps} />}
      <div ref={bottomRef} />
    </div>
  );
}
