"use client";

import { Button } from "@/components/ui/button";

interface TapasEmptyStateProps {
  onCreateClick: () => void;
}

export function TapasEmptyState({ onCreateClick }: TapasEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="text-6xl">🏆</span>
      <h2 className="text-xl font-serif text-on-surface">
        Start your Tapas journey
      </h2>
      <p className="max-w-sm text-on-surface-variant">
        Create up to 3 daily habits to build consistency.
      </p>
      <Button onClick={onCreateClick}>Create your first habit</Button>
    </div>
  );
}
