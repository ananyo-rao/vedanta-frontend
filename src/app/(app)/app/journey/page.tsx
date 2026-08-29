"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Compass } from "lucide-react";
import {
  useTimeline,
  useSendChat,
  useSendGuide,
  useAddJournal,
  useDeleteJournal,
} from "@/hooks/use-chat";
import { FilterChips } from "@/components/journey/filter-chips";
import { SegmentedInput, type InputMode } from "@/components/journey/segmented-input";
import { TimelineView } from "@/components/journey/timeline-view";
import { JournalCalendarView } from "@/components/journey/journal-calendar-view";
import type { TimelineFilter } from "@/lib/api/dharma-chat";

const FILTER_TO_MODE: Record<string, InputMode> = {
  ai: "ai",
  guide: "guide",
  journal: "journal",
};

export default function JourneyPage() {
  const params = useSearchParams();
  const initialFilter = (params.get("filter") as TimelineFilter) || "journal";

  const [filter, setFilter] = useState<TimelineFilter>(initialFilter);
  const [inputMode, setInputMode] = useState<InputMode>(
    FILTER_TO_MODE[initialFilter] ?? "journal",
  );

  const { data: entries = [], isLoading } = useTimeline(filter);
  const chat = useSendChat();
  const guide = useSendGuide();
  const addJournal = useAddJournal();
  const delJournal = useDeleteJournal();

  const handleFilterChange = (f: TimelineFilter) => {
    setFilter(f);
    if (f in FILTER_TO_MODE) setInputMode(FILTER_TO_MODE[f]);
  };

  const handleSend = (text: string) => {
    switch (inputMode) {
      case "journal":
        addJournal.mutate({ content: text });
        break;
      case "ai":
        chat.send(text);
        break;
      case "guide":
        guide.mutate(text);
        break;
    }
  };

  const isBusy =
    chat.isPending || guide.isPending || addJournal.isPending;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold text-on-surface">My Journey</h1>
        </div>
        <FilterChips value={filter} onChange={handleFilterChange} />
      </div>

      {/* Main area */}
      {filter === "journal" ? (
        <JournalCalendarView />
      ) : (
        <TimelineView
          entries={entries}
          isLoading={isLoading}
          isStreaming={chat.isPending}
          liveSteps={chat.liveSteps}
          onEditJournal={undefined}
          onDeleteJournal={(id) => delJournal.mutate(id)}
        />
      )}

      {/* Input */}
      <SegmentedInput
        mode={inputMode}
        onModeChange={setInputMode}
        onSend={handleSend}
        disabled={isBusy}
      />

      {chat.error && (
        <p className="mt-1 text-xs text-red-500">{chat.error}</p>
      )}
    </div>
  );
}
