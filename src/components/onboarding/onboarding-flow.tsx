"use client";

import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { ProgressDots } from "./progress-dots";
import { WelcomeStep } from "./welcome-step";
import { PersonalDetailsStep } from "./personal-details-step";
import { AboutYouStep } from "./about-you-step";
import { VedantaGoalsStep } from "./yoga-goals-step";
import { RecommendationsStep } from "./recommendations-step";

const TOTAL_STEPS = 5;

export function OnboardingFlow() {
  const step = useOnboardingStore((s) => s.step);
  const prevStep = useOnboardingStore((s) => s.prevStep);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {step > 0 && (
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevStep}
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>

            <div className="flex-1">
              <ProgressDots currentStep={step} totalSteps={TOTAL_STEPS} />
            </div>

            <div className="w-10" />
          </div>
        )}

        {step === 0 && <WelcomeStep />}
        {step === 1 && <PersonalDetailsStep />}
        {step === 2 && <AboutYouStep />}
        {step === 3 && <VedantaGoalsStep />}
        {step === 4 && <RecommendationsStep />}
      </div>
    </div>
  );
}
