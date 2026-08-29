"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import * as chatApi from "@/lib/api/dharma-chat";
import type { ChatMessage, StreamStepEvent, TimelineFilter } from "@/lib/api/dharma-chat";

const chatKeys = {
  history: ["dharma-chat", "history"] as const,
  guide: ["dharma-chat", "guide"] as const,
  journal: ["dharma-chat", "journal"] as const,
  timeline: (f: string) => ["dharma-chat", "timeline", f] as const,
  timelinePrefix: ["dharma-chat", "timeline"] as const,
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

// useChatHistory loads the signed-in user's full conversation from the Dharma
// Sadhana backend.
export function useChatHistory() {
  const { fetchToken, ready } = useAuthToken();

  return useQuery({
    queryKey: chatKeys.history,
    queryFn: async () => chatApi.getChatHistory(await fetchToken()),
    enabled: ready,
    retry: 1,
  });
}

// useTimeline loads the unified timeline (all channels + journal).
export function useTimeline(filter: TimelineFilter = "all") {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: chatKeys.timeline(filter),
    queryFn: async () => chatApi.getTimeline(await fetchToken(), filter),
    enabled: ready,
    retry: 1,
    refetchInterval: filter === "all" || filter === "guide" ? 15000 : undefined,
  });
}

// useSendChat sends a message via the streaming endpoint. It progressively
// shows each pipeline step as it completes so the user sees progress.
export function useSendChat() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [liveSteps, setLiveSteps] = useState<StreamStepEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const append = useCallback(
    (msg: ChatMessage) =>
      queryClient.setQueryData<ChatMessage[]>(chatKeys.history, (prev = []) => [
        ...prev,
        msg,
      ]),
    [queryClient]
  );

  const send = useCallback(
    async (message: string) => {
      setError(null);
      setIsPending(true);
      setLiveSteps([]);

      // Optimistically append the user message.
      append({ role: "user", content: message });

      try {
        const token = await fetchToken();
        const reply = await chatApi.streamChat(token, message, (event) => {
          if (event.type === "step") {
            setLiveSteps((prev) => [...prev, event.data]);
          }
        });
        // Stream done — append the final assistant message and clear live steps.
        append(reply);
        queryClient.invalidateQueries({ queryKey: chatKeys.timelinePrefix });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send message");
      } finally {
        setIsPending(false);
        setLiveSteps([]);
      }
    },
    [append, fetchToken]
  );

  return { send, isPending, liveSteps, error };
}

// ---- Guide chat: user messages are stored; a human guide replies later, so we
// poll the history to surface replies as they arrive. ----
export function useGuideHistory() {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: chatKeys.guide,
    queryFn: async () => chatApi.getGuideHistory(await fetchToken()),
    enabled: ready,
    retry: 1,
    refetchInterval: 15000,
  });
}

export function useSendGuide() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) =>
      chatApi.sendGuide(await fetchToken(), message),
    onMutate: (message: string) => {
      queryClient.setQueryData<ChatMessage[]>(chatKeys.guide, (prev = []) => [
        ...prev,
        { role: "user", content: message },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.timelinePrefix });
    },
  });
}

// ---- Journal: private timestamped logs, no reply. ----
export function useJournal() {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: chatKeys.journal,
    queryFn: async () => chatApi.getJournal(await fetchToken()),
    enabled: ready,
    retry: 1,
  });
}

export function useAddJournal() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { content: string; loggedAt?: string }) =>
      chatApi.addJournal(await fetchToken(), vars.content, vars.loggedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.journal });
      queryClient.invalidateQueries({ queryKey: chatKeys.timelinePrefix });
    },
  });
}

export function useUpdateJournal() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; content: string; loggedAt?: string }) =>
      chatApi.updateJournal(await fetchToken(), vars.id, vars.content, vars.loggedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.journal });
      queryClient.invalidateQueries({ queryKey: chatKeys.timelinePrefix });
    },
  });
}

export function useDeleteJournal() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => chatApi.deleteJournal(await fetchToken(), id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.journal });
      queryClient.invalidateQueries({ queryKey: chatKeys.timelinePrefix });
    },
  });
}
