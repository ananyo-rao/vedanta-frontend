"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import * as chatApi from "@/lib/api/dharma-chat";

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

// useSendChat sends a message and refreshes the history on success.
export function useSendChat() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) =>
      chatApi.sendChat(await fetchToken(), message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.history });
    },
  });
}
