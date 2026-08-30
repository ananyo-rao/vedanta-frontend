"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useYogaProfile } from "@/hooks/use-yoga";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: profile, isLoading, error } = useYogaProfile();

  const needsOnboarding = error || !profile || profile.status !== "complete";

  useEffect(() => {
    if (isLoading) return;
    if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [isLoading, needsOnboarding, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <p className="text-sm text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  if (needsOnboarding) {
    return null;
  }

  return <>{children}</>;
}
