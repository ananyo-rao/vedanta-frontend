"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { yogaKeys } from "@/lib/query-keys";
import * as api from "@/lib/api/yoga-student";
import type {
  CreateYogaProfileInput,
  UpdateYogaProfileInput,
  FeedbackAnswer,
} from "@/types/yoga";

function isValidJwt(token: string): boolean {
  return token.split(".").length === 3;
}

function useAuthToken() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const ready = isLoaded && !!isSignedIn;

  const fetchToken = async () => {
    let token = await getToken();
    if (!token) throw new Error("Not authenticated");

    if (!isValidJwt(token)) {
      // ponytail: stale/corrupt cache — one retry with skipCache
      console.warn("[auth] malformed token, retrying with skipCache");
      token = await getToken({ skipCache: true });
      if (!token || !isValidJwt(token)) {
        throw new Error("Authentication token is invalid. Please sign out and sign back in.");
      }
    }

    return token;
  };

  return { fetchToken, ready };
}

export function useYogaProfile() {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: yogaKeys.profile(),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.getYogaProfile(token);
      return result.data;
    },
    enabled: ready,
    retry: 1,
  });
}

export function useCreateYogaProfile() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateYogaProfileInput) => {
      const token = await fetchToken();
      const result = await api.createYogaProfile(token, input);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: yogaKeys.profile() });
      queryClient.invalidateQueries({ queryKey: yogaKeys.recommendations() });
    },
  });
}

export function useUpdateYogaProfile() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateYogaProfileInput) => {
      const token = await fetchToken();
      const result = await api.updateYogaProfile(token, input);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: yogaKeys.profile() });
      queryClient.invalidateQueries({ queryKey: yogaKeys.recommendations() });
    },
  });
}

export function useRecommendedCourses() {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: yogaKeys.recommendations(),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.getRecommendedCourses(token);
      return result.data;
    },
    enabled: ready,
    retry: 1,
  });
}

export function useYogaCourses(filters?: Record<string, unknown>) {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: yogaKeys.courseList(filters),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.listYogaCourses(
        token,
        filters as Parameters<typeof api.listYogaCourses>[1]
      );
      return result.data;
    },
    enabled: ready,
    retry: 1,
  });
}

export function useYogaCourseDetail(courseId: string) {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: yogaKeys.courseDetail(courseId),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.getYogaCourseDetail(token, courseId);
      return result.data;
    },
    enabled: ready && !!courseId,
    retry: 1,
  });
}

export function useYogaEnroll(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await fetchToken();
      const result = await api.enrollInYogaCourse(token, courseId);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: yogaKeys.courses() });
      queryClient.invalidateQueries({
        queryKey: yogaKeys.courseDetail(courseId),
      });
      queryClient.invalidateQueries({ queryKey: yogaKeys.enrollments() });
    },
  });
}

export function useYogaCourseProgress(courseId: string) {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: yogaKeys.courseProgress(courseId),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.getYogaCourseProgress(token, courseId);
      return result.data;
    },
    enabled: ready && !!courseId,
    retry: 1,
  });
}

export function useCompleteYogaVideo(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const token = await fetchToken();
      const result = await api.completeYogaVideo(token, courseId, videoId);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: yogaKeys.courseProgress(courseId),
      });
    },
  });
}

export function useYogaFeedbackForm(courseId: string, week: number) {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: yogaKeys.feedback(courseId, week),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.getYogaFeedbackForm(token, courseId, week);
      return result.data;
    },
    enabled: ready && !!courseId && week > 0,
    retry: 1,
  });
}

export function useSubmitYogaFeedback(courseId: string, week: number) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (responses: FeedbackAnswer[]) => {
      const token = await fetchToken();
      const result = await api.submitYogaFeedback(
        token,
        courseId,
        week,
        responses
      );
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: yogaKeys.feedback(courseId, week),
      });
      queryClient.invalidateQueries({
        queryKey: yogaKeys.courseProgress(courseId),
      });
    },
  });
}

export function useYogaLiveSessions(courseId: string) {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: yogaKeys.liveSessions(courseId),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.listYogaLiveSessions(token, courseId);
      return result.data;
    },
    enabled: ready && !!courseId,
    retry: 1,
  });
}

export function useYogaEnrollments() {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: yogaKeys.enrollments(),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.listYogaEnrollments(token);
      return result.data;
    },
    enabled: ready,
    retry: 1,
  });
}
