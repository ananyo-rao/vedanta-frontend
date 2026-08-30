"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useYogaProfile } from "@/hooks/use-yoga";
import { syncUser } from "@/lib/api/yoga-student";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const syncAttempted = useRef(false);
  const [syncDone, setSyncDone] = useState(false);
  const { data: profile, isLoading, error, refetch } = useYogaProfile();

  useEffect(() => {
    if (!authLoaded || !isSignedIn || !user || syncAttempted.current) return;
    syncAttempted.current = true;

    const email = user.emailAddresses?.[0]?.emailAddress || "";
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ");

    getToken()
      .then((token) => {
        if (!token || !email) return;
        return syncUser(token, email, name);
      })
      .then(() => refetch())
      .finally(() => setSyncDone(true));
  }, [authLoaded, isSignedIn, user, getToken, refetch]);

  const needsOnboarding = error || !profile || profile.status !== "complete";

  useEffect(() => {
    if (isLoading || !syncDone) return;
    if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [isLoading, syncDone, needsOnboarding, router]);

  if (isLoading || !syncDone) {
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
