"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ElementBadge } from "@/components/yoga-courses/element-badge";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { yogaKeys } from "@/lib/query-keys";
import {
  useCreateYogaProfile,
  useRecommendedCourses,
} from "@/hooks/use-yoga";
import type { CreateYogaProfileInput, YogaCourse } from "@/types/yoga";

export function RecommendationsStep() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const reset = useOnboardingStore((s) => s.reset);
  const personalDetails = useOnboardingStore((s) => s.personalDetails);
  const aboutYou = useOnboardingStore((s) => s.aboutYou);
  const vedantaGoals = useOnboardingStore((s) => s.vedantaGoals);

  const queryClient = useQueryClient();
  const createProfile = useCreateYogaProfile();
  const { data: courses, isLoading: coursesLoading } = useRecommendedCourses();

  const submitted = useRef(false);
  const [profileReady, setProfileReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitProfile = () => {
    if (!isLoaded || !isSignedIn) return;

    setError(null);
    const input: CreateYogaProfileInput = {
      phone_number: personalDetails.phone_number || undefined,
      date_of_birth: personalDetails.date_of_birth || undefined,
      gender: personalDetails.gender || undefined,
      location: personalDetails.location || undefined,
      occupation: aboutYou.occupation || undefined,
      work_feeling: aboutYou.work_feeling || undefined,
      ideal_work: aboutYou.ideal_work || undefined,
      platform_motivation: aboutYou.platform_motivation || undefined,
      yoga_motivation: vedantaGoals.yoga_motivation || undefined,
      has_practiced_before: vedantaGoals.has_practiced_before,
      years_of_practice: vedantaGoals.years_of_practice,
    };

    createProfile
      .mutateAsync(input)
      .then(() => setProfileReady(true))
      .catch((err) => {
        console.error("Profile creation failed:", err);
        setError("Something went wrong saving your profile. Please try again.");
        setProfileReady(false);
      });
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn || submitted.current) return;
    submitted.current = true;
    submitProfile();
  }, [isLoaded, isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinish = async () => {
    reset();
    await queryClient.resetQueries({ queryKey: yogaKeys.profile() });
    router.push("/app/journey");
  };

  if (!isLoaded || (!profileReady && !error)) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-on-surface-variant">Creating your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-sm text-red-500">{error}</p>
        <Button
          onClick={() => {
            submitted.current = false;
            submitProfile();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  const difficultyLabel = (level: number) => {
    if (level <= 1) return "Beginner";
    if (level <= 2) return "Intermediate";
    return "Advanced";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="font-serif text-2xl text-on-surface">
          Your Recommended Courses
        </h2>
        <p className="text-sm text-on-surface-variant">
          Based on your profile, we think these are a great fit.
        </p>
      </div>

      {coursesLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid gap-4">
          {courses.map((course: YogaCourse) => (
            <div
              key={course.id}
              className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-on-surface">
                  {course.title}
                </h3>
                {course.element_tags?.map((tag) => (
                  <ElementBadge key={tag} elementTag={tag} />
                ))}
              </div>
              <p className="text-xs text-on-surface-variant">
                {difficultyLabel(course.difficulty_level)}
              </p>
              {course.description && (
                <p className="text-sm text-on-surface-variant line-clamp-2">
                  {course.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-on-surface-variant py-6">
          No recommendations yet — explore all courses from the dashboard.
        </p>
      )}

      <Button size="lg" onClick={handleFinish} className="mt-2">
        Go to Dashboard
      </Button>
    </div>
  );
}
