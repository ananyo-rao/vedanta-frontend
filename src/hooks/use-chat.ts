"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import * as chatApi from "@/lib/api/dharma-chat";
import type { ChatMessage } from "@/lib/api/dharma-chat";

const chatKeys = {
  history: ["dharma-chat", "history"] as const,
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
