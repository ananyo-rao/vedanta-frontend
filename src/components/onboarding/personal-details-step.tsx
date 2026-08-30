"use client";

import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseDob(dob: string) {
  if (!dob) return { year: "", month: "", day: "" };
  const [y, m, d] = dob.split("-");
  return { year: y, month: String(parseInt(m, 10)), day: String(parseInt(d, 10)) };
}

function buildDob(year: string, month: string, day: string) {
  if (!year || !month || !day) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

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
  const dob = parseDob(personalDetails.date_of_birth);

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 100 }, (_, i) => String(currentYear - i)),
    [currentYear],
  );
  const daysInMonth = dob.year && dob.month
    ? new Date(parseInt(dob.year), parseInt(dob.month), 0).getDate()
    : 31;
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => String(i + 1)),
    [daysInMonth],
  );

  const updateDob = (field: "year" | "month" | "day", value: string) => {
    const next = { ...dob, [field]: value };
    if (next.day && next.month && next.year) {
      const maxDay = new Date(parseInt(next.year), parseInt(next.month), 0).getDate();
      if (parseInt(next.day) > maxDay) next.day = String(maxDay);
    }
    setPersonalDetails({
      ...personalDetails,
      date_of_birth: buildDob(next.year, next.month, next.day),
    });
  };

  const selectClass =
    "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

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
          <Label>Date of birth</Label>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={dob.day}
              onChange={(e) => updateDob("day", e.target.value)}
              className={selectClass}
              aria-label="Day"
            >
              <option value="">Day</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={dob.month}
              onChange={(e) => updateDob("month", e.target.value)}
              className={selectClass}
              aria-label="Month"
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={i} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            <select
              value={dob.year}
              onChange={(e) => updateDob("year", e.target.value)}
              className={selectClass}
              aria-label="Year"
            >
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
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
