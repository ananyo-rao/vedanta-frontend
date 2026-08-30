"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { AILMENTS } from "@/lib/ailments";

export function HealthConditionsStep() {
  const healthConditions = useOnboardingStore((s) => s.healthConditions);
  const setHealthConditions = useOnboardingStore((s) => s.setHealthConditions);
  const nextStep = useOnboardingStore((s) => s.nextStep);

  const toggle = (slug: string) => {
    if (healthConditions.includes(slug)) {
      setHealthConditions(healthConditions.filter((c) => c !== slug));
    } else {
      setHealthConditions([...healthConditions, slug]);
    }
  };

  const selectNone = () => {
    setHealthConditions([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-serif text-2xl text-on-surface">
          Health Conditions
        </h2>
        <p className="text-sm text-on-surface-variant">
          Select any that apply so we can recommend safe practices.
        </p>
      </div>

      <div className="grid gap-3">
        {AILMENTS.map((cond) => {
          const selected = healthConditions.includes(cond.slug);
          return (
            <div
              key={cond.slug}
              role="checkbox"
              aria-checked={selected}
              tabIndex={0}
              onClick={() => toggle(cond.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(cond.slug);
                }
              }}
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-xl border-2 px-4 py-4 transition-colors select-none",
                selected
                  ? "border-primary bg-primary/10"
                  : "border-surface-container-high hover:border-primary/40",
              )}
            >
              <span className="text-2xl" role="img" aria-hidden>
                {cond.icon}
              </span>
              <span
                className={cn(
                  "text-base font-medium",
                  selected ? "text-primary" : "text-on-surface",
                )}
              >
                {cond.label}
              </span>
            </div>
          );
        })}

        <div
          role="checkbox"
          aria-checked={healthConditions.length === 0}
          tabIndex={0}
          onClick={selectNone}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              selectNone();
            }
          }}
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors select-none",
            healthConditions.length === 0
              ? "border-primary bg-primary/10 text-primary"
              : "border-surface-container-high text-on-surface-variant hover:border-primary/40",
          )}
        >
          None of these
        </div>
      </div>

      <Button onClick={nextStep} className="mt-2">
        Next
      </Button>
    </div>
  );
}
