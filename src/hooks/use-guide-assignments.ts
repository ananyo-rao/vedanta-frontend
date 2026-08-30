"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import * as guideApi from "@/lib/api/dharma-guide";

/**
 * Admin-side assignment of a guide to each member.
 *
 * The roster and the role of each person come from the courses API (the source
 * of truth for identity and role); only the student→guide edge lives in the
 * Dharma backend. Nothing about who is a teacher is duplicated there, so there
 * is no cross-service write to keep consistent.
 */
export const assignmentKeys = {
  all: ["guide-assignments"] as const,
  students: (filter: string) => [...assignmentKeys.all, "students", filter] as const,
  guides: () => [...assignmentKeys.all, "guides"] as const,
};

function useAuthToken() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const ready = isLoaded && !!isSignedIn;

  const fetchToken = async () => {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  return { fetchToken, ready };
}

export function useAssignmentRoster(
  filter: "all" | "assigned" | "unassigned" = "all"
) {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: assignmentKeys.students(filter),
    queryFn: async () => guideApi.getAdminStudents(await fetchToken(), filter),
    enabled: ready,
    retry: 1,
  });
}

export function useGuideOptions() {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: assignmentKeys.guides(),
    queryFn: async () => guideApi.getGuideOptions(await fetchToken()),
    enabled: ready,
    retry: 1,
  });
}

export function useAssignGuide() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { studentClerkId: string; guideClerkId: string }) =>
      guideApi.assignGuide(await fetchToken(), vars.studentClerkId, vars.guideClerkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}

export function useUnassignGuide() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentClerkId: string) =>
      guideApi.unassignGuide(await fetchToken(), studentClerkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
}
