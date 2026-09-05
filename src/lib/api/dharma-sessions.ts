import { fetchWithAuth } from "./fetch";

// Live session endpoints on the Dharma Sadhana backend — the same service that
// holds the guide chat and teachings.
const DHARMA_API_URL =
  process.env.NEXT_PUBLIC_DHARMA_API_URL || "http://localhost:8081/api";

export type SessionStatus =
  | "scheduled"
  | "live"
  | "processing"
  | "completed"
  | "cancelled";

/** One member invited to a class. */
export interface SessionParticipant {
  clerk_id: string;
  name: string;
  email: string;
  added_by?: string;
  created_at?: string;
}

/** A recurring class definition. Membership hangs off this, not the sitting. */
export interface SessionSeries {
  id: string;
  title: string;
  description?: string;
  /** Only weekly with a single BYDAY is supported, e.g. "FREQ=WEEKLY;BYDAY=WE". */
  rrule: string;
  start_time: string;
  timezone: string;
  duration_minutes: number;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  participants?: SessionParticipant[];
}

/** One sitting of a class on one date. */
export interface Session {
  id: string;
  series_id?: string;
  title: string;
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  status: SessionStatus;
  livekit_room_name?: string;
  egress_id?: string;
  recording_gcs_path?: string;
  recording_duration_seconds?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  duration_minutes?: number;
  /** Server-computed: live, and the clock has not run past the window. */
  can_join: boolean;
}

/** Credentials for connecting to the LiveKit room. */
export interface RoomToken {
  token: string;
  url: string;
  room_name: string;
}

/** Deepgram's response shape, narrowed to what the transcript view reads. */
export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  speaker: number;
}

export interface TranscriptData {
  results?: {
    channels?: Array<{
      alternatives?: Array<{
        transcript: string;
        words?: TranscriptWord[];
      }>;
    }>;
  };
}

const range = (from: Date, to: Date) =>
  `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(
    to.toISOString()
  )}`;

// ── Member ──────────────────────────────────────────────────────────────────

/** The classes this member was invited to, within a window. */
export async function getMySessions(
  token: string,
  from: Date,
  to: Date
): Promise<Session[]> {
  const res = await fetchWithAuth(
    `${DHARMA_API_URL}/sessions/mine?${range(from, to)}`,
    token
  );
  return res.data ?? [];
}

export async function getSession(
  token: string,
  id: string
): Promise<Session> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/sessions/${id}`, token);
  return res.data;
}

/** Join a live class. Fails unless invited and inside the time window. */
export async function joinSession(
  token: string,
  id: string
): Promise<RoomToken> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/sessions/${id}/join`, token, {
    method: "POST",
  });
  return res.data;
}

export async function getRecordingUrl(
  token: string,
  id: string
): Promise<string> {
  const res = await fetchWithAuth(
    `${DHARMA_API_URL}/sessions/${id}/recording`,
    token
  );
  return res.data.url;
}

export async function getTranscript(
  token: string,
  id: string
): Promise<TranscriptData> {
  const res = await fetchWithAuth(
    `${DHARMA_API_URL}/sessions/${id}/transcript`,
    token
  );
  return res.data;
}

// ── Admin ───────────────────────────────────────────────────────────────────

export async function listSeries(token: string): Promise<SessionSeries[]> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/sessions/series`, token);
  return res.data ?? [];
}

export interface SeriesInput {
  title: string;
  description?: string;
  rrule: string;
  start_time: string;
  timezone?: string;
  duration_minutes?: number;
  participant_ids?: string[];
}

export async function createSeries(
  token: string,
  input: SeriesInput
): Promise<SessionSeries> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/sessions/series`, token, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function updateSeries(
  token: string,
  id: string,
  input: Partial<SeriesInput> & { is_active?: boolean }
): Promise<SessionSeries> {
  const res = await fetchWithAuth(
    `${DHARMA_API_URL}/sessions/series/${id}`,
    token,
    { method: "PUT", body: JSON.stringify(input) }
  );
  return res.data;
}

export async function deleteSeries(token: string, id: string): Promise<void> {
  await fetchWithAuth(`${DHARMA_API_URL}/sessions/series/${id}`, token, {
    method: "DELETE",
  });
}

/** Every sitting in a window, across all classes. */
export async function listSessions(
  token: string,
  from: Date,
  to: Date
): Promise<Session[]> {
  const res = await fetchWithAuth(
    `${DHARMA_API_URL}/sessions?${range(from, to)}`,
    token
  );
  return res.data ?? [];
}

/** Open the room and get a teacher token. */
export async function startSession(
  token: string,
  id: string
): Promise<RoomToken> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/sessions/${id}/start`, token, {
    method: "POST",
  });
  return res.data;
}

/** Close the room. Everyone still connected is dropped. */
export async function endSession(token: string, id: string): Promise<void> {
  await fetchWithAuth(`${DHARMA_API_URL}/sessions/${id}/end`, token, {
    method: "POST",
  });
}

export async function cancelSession(token: string, id: string): Promise<void> {
  await fetchWithAuth(`${DHARMA_API_URL}/sessions/${id}/cancel`, token, {
    method: "POST",
  });
}
