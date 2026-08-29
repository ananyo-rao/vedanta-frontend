import { fetchWithAuth } from "./fetch";

// The Dharma Sadhana backend base URL (…/api). The AI chat is powered by its
// simple_retrieval pipeline. Falls back to local dev.
const DHARMA_API_URL =
  process.env.NEXT_PUBLIC_DHARMA_API_URL || "http://localhost:8081/api";

export interface ChatMessage {
  role: "user" | "assistant" | "guide";
  content: string;
  created_at?: string;
  metadata?: ChatMetadata | null;
}

export interface ChatMetadata {
  teaching?: {
    title: string;
    source: string;
    reference: string;
    content?: string;
    application?: string;
    problem?: string;
    solution?: string;
  } | null;
  journal?: {
    entries_used: { date: string; snippet: string; connection: string }[];
    reflection: string;
  } | null;
  steps?: {
    node_name: string;
    duration_ms: number;
    model: string;
    summary?: string;
    output?: Record<string, unknown>;
  }[];
  pipeline_duration_ms?: number;
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

// ---- Guide chat (human guide replies asynchronously; no auto-reply) ----

export async function sendGuide(
  token: string,
  message: string
): Promise<ChatMessage> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/guide`, token, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
  return res.data as ChatMessage;
}

export async function getGuideHistory(token: string): Promise<ChatMessage[]> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/guide/history`, token);
  return (res.data as ChatMessage[]) ?? [];
}

// ---- Journal (private timestamped logs; no reply) ----

export interface JournalEntry {
  id: string;
  content: string;
  logged_at: string;
}

// loggedAt is an optional ISO timestamp so a user can backdate a past
// recollection; omitted/empty means now.
export async function addJournal(
  token: string,
  content: string,
  loggedAt?: string
): Promise<void> {
  await fetchWithAuth(`${DHARMA_API_URL}/journal`, token, {
    method: "POST",
    body: JSON.stringify({ content, logged_at: loggedAt ?? "" }),
  });
}

export async function updateJournal(
  token: string,
  id: string,
  content: string,
  loggedAt?: string
): Promise<void> {
  await fetchWithAuth(`${DHARMA_API_URL}/journal/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify({ content, logged_at: loggedAt ?? "" }),
  });
}

export async function deleteJournal(token: string, id: string): Promise<void> {
  await fetchWithAuth(`${DHARMA_API_URL}/journal/${id}`, token, {
    method: "DELETE",
  });
}

export async function getJournal(token: string): Promise<JournalEntry[]> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/journal`, token);
  return (res.data as JournalEntry[]) ?? [];
}
