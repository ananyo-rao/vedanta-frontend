"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import * as guideApi from "@/lib/api/dharma-guide";
import type { ChatMessage } from "@/lib/api/dharma-chat";

export const guideStudentKeys = {
  all: ["guide-students"] as const,
  list: () => [...guideStudentKeys.all, "list"] as const,
  detail: (clerkId: string) =>
    [...guideStudentKeys.all, "detail", clerkId] as const,
  thread: (clerkId: string) =>
    [...guideStudentKeys.all, "thread", clerkId] as const,
  noteHistory: (clerkId: string) =>
    [...guideStudentKeys.all, "note-history", clerkId] as const,
  notifications: () => [...guideStudentKeys.all, "notifications"] as const,
  unreadCount: () => [...guideStudentKeys.all, "unread-count"] as const,
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

/**
 * The teacher's roster. Polled because the unanswered count is what tells them
 * someone is waiting, and a question can arrive while the page is open.
 */
export function useGuideStudents() {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: guideStudentKeys.list(),
    queryFn: async () => guideApi.getMyStudents(await fetchToken()),
    enabled: ready,
    retry: 1,
    refetchInterval: 30000,
  });
}

export function useStudent(clerkId: string) {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: guideStudentKeys.detail(clerkId),
    queryFn: async () => guideApi.getStudent(await fetchToken(), clerkId),
    enabled: ready && !!clerkId,
    retry: 1,
  });
}

/** Polled on the same 15s cadence as the member's own guide chat. */
export function useStudentThread(clerkId: string) {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: guideStudentKeys.thread(clerkId),
    queryFn: async () => guideApi.getStudentThread(await fetchToken(), clerkId),
    enabled: ready && !!clerkId,
    retry: 1,
    refetchInterval: 15000,
  });
}

export function useReplyToStudent(clerkId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) =>
      guideApi.replyToStudent(await fetchToken(), clerkId, message),
    onMutate: (message: string) => {
      queryClient.setQueryData<ChatMessage[]>(
        guideStudentKeys.thread(clerkId),
        (prev = []) => [...prev, { role: "guide", content: message }]
      );
    },
    onSettled: () => {
      // The roster's unanswered count and the badge both flip on a reply. The
      // thread itself is left alone — the 15s poll reconciles it, and
      // invalidating here would fight the optimistic append.
      queryClient.invalidateQueries({ queryKey: guideStudentKeys.list() });
      queryClient.invalidateQueries({ queryKey: guideStudentKeys.unreadCount() });
    },
  });
}

export function useStudentNoteHistory(clerkId: string, enabled: boolean) {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: guideStudentKeys.noteHistory(clerkId),
    queryFn: async () =>
      guideApi.getStudentNoteHistory(await fetchToken(), clerkId),
    // Only fetched when the history panel is actually opened.
    enabled: ready && !!clerkId && enabled,
    retry: 1,
  });
}

export function useSaveStudentNote(clerkId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) =>
      guideApi.saveStudentNote(await fetchToken(), clerkId, content),
    onSuccess: () => {
      // A save is a new revision, so both the current note and the history are
      // stale.
      queryClient.invalidateQueries({ queryKey: guideStudentKeys.detail(clerkId) });
      queryClient.invalidateQueries({
        queryKey: guideStudentKeys.noteHistory(clerkId),
      });
      queryClient.invalidateQueries({ queryKey: guideStudentKeys.list() });
    },
  });
}

export function useSaveVerseMarker(clerkId: string) {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { chapter: number; verse: number }) =>
      guideApi.saveVerseMarker(await fetchToken(), clerkId, vars.chapter, vars.verse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guideStudentKeys.detail(clerkId) });
      // The roster shows each student's marker as a chip.
      queryClient.invalidateQueries({ queryKey: guideStudentKeys.list() });
    },
  });
}

// ---- Notifications ----

export function useNotifications() {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: guideStudentKeys.notifications(),
    queryFn: async () => guideApi.getNotifications(await fetchToken()),
    enabled: ready,
    retry: 1,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}

export function useUnreadCount() {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: guideStudentKeys.unreadCount(),
    queryFn: async () => guideApi.getUnreadCount(await fetchToken()),
    enabled: ready,
    retry: 1,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationsRead() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) =>
      guideApi.markNotificationsRead(await fetchToken(), ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guideStudentKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: guideStudentKeys.unreadCount() });
    },
  });
}
