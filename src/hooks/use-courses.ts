"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { courseKeys } from "@/lib/query-keys";
import * as api from "@/lib/api/courses-student";

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

export function useStudentCourses() {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.listCourses(token);
      return result.data;
    },
    enabled: ready,
    retry: 1,
  });
}

export function useCourseDetail(courseId: string) {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.getCourseDetail(token, courseId);
      return result.data;
    },
    enabled: ready && !!courseId,
    retry: 1,
  });
}

export function useEnroll(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await fetchToken();
      const result = await api.enrollInCourse(token, courseId);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

export function useCourseProgress(courseId: string) {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: courseKeys.progress(courseId),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.getCourseProgress(token, courseId);
      return result.data;
    },
    enabled: ready && !!courseId,
    retry: 1,
  });
}

export function usePageContent(courseId: string, pageId: string) {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: courseKeys.page(courseId, pageId),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.getPageContent(token, courseId, pageId);
      // Backend returns { data: { page, completion, video_progress, introspection_response } }
      // Flatten page fields into the top level for component consumption
      const { page, ...extras } = result.data;
      return { ...page, ...extras };
    },
    enabled: ready && !!courseId && !!pageId,
    retry: 1,
  });
}

export function useCompletePage(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageId: string) => {
      const token = await fetchToken();
      await api.completePage(token, courseId, pageId);
    },
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({
        queryKey: courseKeys.progress(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: courseKeys.page(courseId, pageId),
      });
    },
  });
}

export function useSubmitIntrospection(courseId: string, pageId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (responseText: string) => {
      const token = await fetchToken();
      const result = await api.submitIntrospection(
        token,
        courseId,
        pageId,
        responseText
      );
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseKeys.page(courseId, pageId),
      });
    },
  });
}

export function useSaveDraft(courseId: string, pageId: string) {
  const { fetchToken } = useAuthToken();

  return useMutation({
    mutationFn: async (responseText: string) => {
      const token = await fetchToken();
      await api.saveDraftIntrospection(token, courseId, pageId, responseText);
    },
  });
}

export function useUpdateVideoProgress(courseId: string, pageId: string) {
  const { fetchToken } = useAuthToken();

  return useMutation({
    mutationFn: async ({
      progressPercent,
      lastPosition,
    }: {
      progressPercent: number;
      lastPosition: number;
    }) => {
      const token = await fetchToken();
      await api.updateVideoProgress(
        token,
        courseId,
        pageId,
        progressPercent,
        lastPosition
      );
    },
  });
}
