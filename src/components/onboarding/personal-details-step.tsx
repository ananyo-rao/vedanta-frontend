"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const GENDER_OPTIONS = [
  { value: "male" as const, label: "Male" },
  { value: "female" as const, label: "Female" },
  { value: "prefer_not_to_say" as const, label: "Prefer not to say" },
];

export function PersonalDetailsStep() {
  const { user } = useUser();
  const personalDetails = useOnboardingStore((s) => s.personalDetails);
  const setPersonalDetails = useOnboardingStore((s) => s.setPersonalDetails);
  const nextStep = useOnboardingStore((s) => s.nextStep);

  const isValid = personalDetails.gender !== "";

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-serif text-2xl text-on-surface">
          {user?.firstName ? `Hi ${user.firstName}, tell us about yourself` : "Personal Details"}
        </h2>
        <p className="text-sm text-on-surface-variant">
          Help us tailor your experience.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of birth</Label>
          <Input
            id="dob"
            type="date"
            value={personalDetails.date_of_birth}
            onChange={(e) =>
              setPersonalDetails({
                ...personalDetails,
                date_of_birth: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Where do you stay?</Label>
          <Input
            id="location"
            type="text"
            placeholder="e.g. Bangalore, India"
            value={personalDetails.location}
            onChange={(e) =>
              setPersonalDetails({
                ...personalDetails,
                location: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <div className="grid grid-cols-3 gap-3">
            {GENDER_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                role="radio"
                aria-checked={personalDetails.gender === opt.value}
                tabIndex={0}
                onClick={() =>
                  setPersonalDetails({
                    ...personalDetails,
                    gender: opt.value,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setPersonalDetails({
                      ...personalDetails,
                      gender: opt.value,
                    });
                  }
                }}
                className={cn(
                  "cursor-pointer rounded-lg border-2 px-3 py-2.5 text-center text-sm font-medium transition-colors select-none",
                  personalDetails.gender === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-surface-container-high text-on-surface hover:border-primary/40",
                )}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={nextStep} disabled={!isValid} className="mt-2">
        Next
      </Button>
    </div>
  );
}
