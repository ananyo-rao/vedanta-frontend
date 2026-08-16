"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import * as chatApi from "@/lib/api/dharma-chat";
import type { ChatMessage } from "@/lib/api/dharma-chat";

const chatKeys = {
  history: ["dharma-chat", "history"] as const,
  guide: ["dharma-chat", "guide"] as const,
  journal: ["dharma-chat", "journal"] as const,
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

// useSendChat sends a message and keeps the history query cache as the single
// source of truth: it optimistically appends the user's turn, then appends the
// assistant's reply on success. No local component state / effects needed.
export function useSendChat() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  const append = (msg: ChatMessage) =>
    queryClient.setQueryData<ChatMessage[]>(chatKeys.history, (prev = []) => [
      ...prev,
      msg,
    ]);

  return useMutation({
    mutationFn: async (message: string) =>
      chatApi.sendChat(await fetchToken(), message),
    onMutate: (message: string) => {
      append({ role: "user", content: message });
    },
    onSuccess: (reply) => {
      append(reply);
    },
  });
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
    },
  });
}
