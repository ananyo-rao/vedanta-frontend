"use client";

import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function WelcomeStep() {
  const nextStep = useOnboardingStore((s) => s.nextStep);

  return (
    <div className="flex flex-col items-center text-center gap-8 py-12">
      <span className="text-6xl" role="img" aria-label="lotus">
        🪷
      </span>

      <div className="space-y-3">
        <p className="text-lg text-on-surface-variant">Namaste</p>
        <h1 className="font-serif text-3xl text-on-surface">
          Welcome to your Vedanta journey
        </h1>
        <p className="text-on-surface-variant max-w-sm mx-auto">
          We will ask you a few quick questions to personalise your experience and
          recommend the right courses for you.
        </p>
      </div>

      <Button size="lg" onClick={nextStep}>
        Get Started
      </Button>
    </div>
  );
}
