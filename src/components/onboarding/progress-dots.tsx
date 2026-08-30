"use client";

import { cn } from "@/lib/utils";

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressDots({ currentStep, totalSteps }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;

        return (
          <div
            key={i}
            className={cn(
              "rounded-full transition-all duration-300",
              isActive
                ? "h-3 w-3 bg-primary"
                : isCompleted
                  ? "h-2 w-2 bg-primary"
                  : "h-2 w-2 bg-surface-container-high",
            )}
          />
        );
      })}
    </div>
  );
}
