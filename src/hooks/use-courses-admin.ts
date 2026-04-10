"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { courseKeys } from "@/lib/query-keys";
import * as api from "@/lib/api/courses-admin";
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreatePageInput,
} from "@/types/course-schemas";

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

export function useAdminCourses() {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: courseKeys.adminList(),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.listAdminCourses(token);
      return result.data;
    },
    enabled: ready,
    retry: 1,
  });
}

export function useAdminCourse(courseId: string) {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.getAdminCourse(token, courseId);
      return result.data;
    },
    enabled: ready && !!courseId,
    retry: 1,
  });
}

export function useCreateCourse() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCourseInput) => {
      const token = await fetchToken();
      const result = await api.createCourse(token, data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function useUpdateCourse(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCourseInput) => {
      const token = await fetchToken();
      const result = await api.updateCourse(token, courseId, data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function usePublishCourse(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await fetchToken();
      const result = await api.publishCourse(token, courseId);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function useUnpublishCourse(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await fetchToken();
      const result = await api.unpublishCourse(token, courseId);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function useSetEndDate(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (endDate: string | null) => {
      const token = await fetchToken();
      if (endDate) {
        const result = await api.setEndDate(token, courseId, endDate);
        return result.data;
      } else {
        const result = await api.removeEndDate(token, courseId);
        return result.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.adminList() });
    },
  });
}

export function useAddPage(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePageInput) => {
      const token = await fetchToken();
      const result = await api.addPage(token, courseId, data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.pages(courseId) });
    },
  });
}

export function useUpdatePage(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pageId,
      data,
    }: {
      pageId: string;
      data: Partial<CreatePageInput>;
    }) => {
      const token = await fetchToken();
      const result = await api.updatePage(token, courseId, pageId, data);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.pages(courseId) });
    },
  });
}

export function useDeletePage(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageId: string) => {
      const token = await fetchToken();
      await api.deletePage(token, courseId, pageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.pages(courseId) });
    },
  });
}

export function useReorderPages(courseId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageIds: string[]) => {
      const token = await fetchToken();
      await api.reorderPages(token, courseId, pageIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

export function useIntrospectionResponses(courseId: string) {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: courseKeys.responses(courseId),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.getIntrospectionResponses(token, courseId);
      return result.data;
    },
    enabled: ready && !!courseId,
    retry: 1,
  });
}
