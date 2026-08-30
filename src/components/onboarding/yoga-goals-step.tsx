"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function VedantaGoalsStep() {
  const vedantaGoals = useOnboardingStore((s) => s.vedantaGoals);
  const setVedantaGoals = useOnboardingStore((s) => s.setVedantaGoals);
  const nextStep = useOnboardingStore((s) => s.nextStep);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-serif text-2xl text-on-surface">Your Goals</h2>
        <p className="text-sm text-on-surface-variant">
          Tell us a bit about your Vedanta journey.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="motivation">What brings you to Vedanta?</Label>
          <Textarea
            id="motivation"
            placeholder="e.g. I want to understand the self and gain clarity..."
            rows={3}
            value={vedantaGoals.yoga_motivation}
            onChange={(e) =>
              setVedantaGoals({ ...vedantaGoals, yoga_motivation: e.target.value })
            }
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-surface-container-high px-4 py-3">
          <Label htmlFor="practiced" className="cursor-pointer">
            Have you studied Vedanta before?
          </Label>
          <Switch
            id="practiced"
            checked={vedantaGoals.has_practiced_before}
            onCheckedChange={(checked) =>
              setVedantaGoals({
                ...vedantaGoals,
                has_practiced_before: checked,
                years_of_practice: checked ? vedantaGoals.years_of_practice : 0,
              })
            }
          />
        </div>

        {vedantaGoals.has_practiced_before && (
          <div className="space-y-2">
            <Label htmlFor="years">Years of practice</Label>
            <Input
              id="years"
              type="number"
              min={0}
              max={80}
              placeholder="0"
              value={vedantaGoals.years_of_practice || ""}
              onChange={(e) =>
                setVedantaGoals({
                  ...vedantaGoals,
                  years_of_practice: parseInt(e.target.value, 10) || 0,
                })
              }
            />
          </div>
        )}
      </div>

      <Button onClick={nextStep} className="mt-2">
        Next
      </Button>
    </div>
  );
}
