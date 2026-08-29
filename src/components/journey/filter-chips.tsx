"use client";

import { Layers, Sparkles, Compass, NotebookPen } from "lucide-react";
import type { TimelineFilter } from "@/lib/api/dharma-chat";

const FILTERS: { key: TimelineFilter; label: string; icon: typeof Layers }[] = [
  { key: "all", label: "All", icon: Layers },
  { key: "ai", label: "AI", icon: Sparkles },
  { key: "guide", label: "Guide", icon: Compass },
  { key: "journal", label: "Journal", icon: NotebookPen },
];

export function FilterChips({
  value,
  onChange,
}: {
  value: TimelineFilter;
  onChange: (f: TimelineFilter) => void;
}) {
  return (
    <div className="flex gap-2">
      {FILTERS.map(({ key, label, icon: Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-primary text-white"
                : "bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
