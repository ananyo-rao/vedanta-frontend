import { fetchWithAuth } from "./fetch";

// The Dharma Sadhana backend base URL (…/api). The AI chat is powered by its
// simple_retrieval pipeline. Falls back to local dev.
const DHARMA_API_URL =
  process.env.NEXT_PUBLIC_DHARMA_API_URL || "http://localhost:8081/api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

// sendChat posts a message and returns the assistant's reply. The Dharma backend
// wraps responses as { data: ... }.
export async function sendChat(
  token: string,
  message: string
): Promise<ChatMessage> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/chat`, token, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
  return res.data as ChatMessage;
}

// getChatHistory returns the signed-in user's full conversation (oldest first).
export async function getChatHistory(token: string): Promise<ChatMessage[]> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/chat/history`, token);
  return (res.data as ChatMessage[]) ?? [];
}
