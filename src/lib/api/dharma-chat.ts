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

export type StreamStepEvent = {
  node_name: string;
  duration_ms: number;
  model: string;
  summary?: string;
  output?: Record<string, unknown>;
  error?: string;
};

export type StreamEvent =
  | { type: "step"; data: StreamStepEvent }
  | { type: "done"; data: ChatMessage }
  | { type: "error"; data: ChatMessage };

// streamChat sends a message via the streaming endpoint. The onEvent callback
// fires for each SSE event so the UI can show progressive results.
export async function streamChat(
  token: string,
  message: string,
  onEvent: (event: StreamEvent) => void
): Promise<ChatMessage> {
  const res = await fetch(`${DHARMA_API_URL}/chat/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error(
      res.status >= 500
        ? "Something went wrong. Please try again later."
        : "Request failed. Please try again."
    );
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  let finalMessage: ChatMessage | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    let currentEvent = "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith("data: ") && currentEvent) {
        try {
          const data = JSON.parse(line.slice(6));
          const event = { type: currentEvent, data } as StreamEvent;
          onEvent(event);
          if (currentEvent === "done" || currentEvent === "error") {
            finalMessage = data as ChatMessage;
          }
        } catch {
          // skip malformed JSON
        }
        currentEvent = "";
      }
    }
  }

  return finalMessage ?? { role: "assistant", content: "" };
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
