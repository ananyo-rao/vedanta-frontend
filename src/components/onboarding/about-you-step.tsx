"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/stores/onboarding-store";

export function AboutYouStep() {
  const aboutYou = useOnboardingStore((s) => s.aboutYou);
  const setAboutYou = useOnboardingStore((s) => s.setAboutYou);
  const nextStep = useOnboardingStore((s) => s.nextStep);

  const isValid = aboutYou.platform_motivation.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-serif text-2xl text-on-surface">About You</h2>
        <p className="text-sm text-on-surface-variant">
          Help us understand where you are in life right now.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="occupation">What do you do for work?</Label>
          <Input
            id="occupation"
            type="text"
            placeholder="e.g. Software engineer, Teacher, Student..."
            value={aboutYou.occupation}
            onChange={(e) =>
              setAboutYou({ ...aboutYou, occupation: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="work-feeling">How do you feel about your daily activities?</Label>
          <Textarea
            id="work-feeling"
            placeholder="e.g. I stay busy but feel restless, I want more clarity in how I spend my time..."
            rows={2}
            value={aboutYou.work_feeling}
            onChange={(e) =>
              setAboutYou({ ...aboutYou, work_feeling: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ideal-work">
            What would your ideal daily life look like?
          </Label>
          <Textarea
            id="ideal-work"
            placeholder="e.g. A life with purpose, inner peace, time for study and reflection..."
            rows={2}
            value={aboutYou.ideal_work}
            onChange={(e) =>
              setAboutYou({ ...aboutYou, ideal_work: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform-motivation">
            What brings you to this platform and what do you seek from joining
            the Vedanta course?
          </Label>
          <Textarea
            id="platform-motivation"
            placeholder="e.g. I want to understand the purpose of life, find clarity in decision-making..."
            rows={3}
            value={aboutYou.platform_motivation}
            onChange={(e) =>
              setAboutYou({
                ...aboutYou,
                platform_motivation: e.target.value,
              })
            }
          />
        </div>
      </div>

      <Button onClick={nextStep} disabled={!isValid} className="mt-2">
        Next
      </Button>
    </div>
  );
}
