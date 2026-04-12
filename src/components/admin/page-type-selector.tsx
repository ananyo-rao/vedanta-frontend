"use client";

import { PlayCircle, BookOpen, Wind } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { PageType } from "@/types/course";
import { useState } from "react";

interface PageTypeSelectorProps {
  onSelect: (type: PageType) => void;
}

const PAGE_TYPES: { type: PageType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    type: "video",
    label: "Video",
    icon: <PlayCircle className="h-5 w-5" />,
    description: "A teaching video with summary text",
  },
  {
    type: "introspection",
    label: "Introspection Exercise",
    icon: <BookOpen className="h-5 w-5" />,
    description: "Devanagari verse with reflection prompt",
  },
  {
    type: "meditation",
    label: "Meditation",
    icon: <Wind className="h-5 w-5" />,
    description: "Guided meditation video",
  },
];

export function PageTypeSelector({ onSelect }: PageTypeSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-label="Add page">
          <Plus className="mr-2 h-4 w-4" />
          Add Page
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <p className="mb-3 text-sm font-medium text-on-surface">
          Select page type
        </p>
        <div className="space-y-1">
          {PAGE_TYPES.map(({ type, label, icon, description }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onSelect(type);
                setOpen(false);
              }}
              className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-surface-container-high"
              aria-label={`Add ${label} page`}
            >
              <div className="mt-0.5 text-primary">{icon}</div>
              <div>
                <p className="text-sm font-medium text-on-surface">{label}</p>
                <p className="text-xs text-on-surface-variant">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
