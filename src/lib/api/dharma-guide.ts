import { fetchWithAuth } from "./fetch";
import type { ChatMessage } from "./dharma-chat";

// Guide/student endpoints on the Dharma Sadhana backend — the same service that
// stores the guide chat, so a teacher reads and answers questions where they
// were written.
const DHARMA_API_URL =
  process.env.NEXT_PUBLIC_DHARMA_API_URL || "http://localhost:8081/api";

/** How far through the primary text a student has been taken. */
export interface VerseMarker {
  verse_text: string;
  chapter: number;
  verse: number;
  updated_at?: string;
}

/** One revision of the guide's note. The newest is the current note. */
export interface StudentNote {
  id: string;
  content: string;
  author_name?: string;
  created_at: string;
}

export interface TeacherStudent {
  clerk_id: string;
  name: string;
  email: string;
  /** Questions raised since the guide last replied. Drives the badge. */
  unanswered_count: number;
  last_message_at?: string;
  verse: VerseMarker | null;
  note_preview?: string;
  /** Who guides them. Only worth showing to an admin, who sees every guide's students. */
  guide_clerk_id?: string;
  guide_name?: string;
}

export interface StudentDetail {
  clerk_id: string;
  name: string;
  email: string;
  assigned_at?: string;
  unanswered_count: number;
  verse: VerseMarker | null;
  note: StudentNote | null;
}

export type NotificationType =
  | "student_assigned"
  | "guide_assigned"
  | "student_question"
  | "guide_replied";

export interface AppNotification {
  id: string;
  type: NotificationType;
  student_clerk_id?: string;
  title: string;
  body?: string;
  link?: string;
  read_at?: string;
  created_at: string;
}

const student = (clerkId: string) =>
  `${DHARMA_API_URL}/teacher/students/${encodeURIComponent(clerkId)}`;

// ---- Teacher: my students ----

export async function getMyStudents(token: string): Promise<TeacherStudent[]> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/teacher/students`, token);
  return (res.data as TeacherStudent[]) ?? [];
}

export async function getStudent(
  token: string,
  clerkId: string
): Promise<StudentDetail> {
  const res = await fetchWithAuth(student(clerkId), token);
  return res.data as StudentDetail;
}

export async function getStudentThread(
  token: string,
  clerkId: string
): Promise<ChatMessage[]> {
  const res = await fetchWithAuth(`${student(clerkId)}/chat`, token);
  return (res.data as ChatMessage[]) ?? [];
}

export async function replyToStudent(
  token: string,
  clerkId: string,
  message: string
): Promise<ChatMessage> {
  const res = await fetchWithAuth(`${student(clerkId)}/chat`, token, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
  return res.data as ChatMessage;
}

// ---- Teacher: the student profile ----

export async function getStudentNote(
  token: string,
  clerkId: string
): Promise<StudentNote | null> {
  const res = await fetchWithAuth(`${student(clerkId)}/note`, token);
  return (res.data as StudentNote) ?? null;
}

/**
 * Saving appends a revision rather than overwriting: the teacher edits "the
 * current note", and every earlier version stays readable under View history.
 */
export async function saveStudentNote(
  token: string,
  clerkId: string,
  content: string
): Promise<void> {
  await fetchWithAuth(`${student(clerkId)}/note`, token, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

export async function getStudentNoteHistory(
  token: string,
  clerkId: string
): Promise<StudentNote[]> {
  const res = await fetchWithAuth(`${student(clerkId)}/note/history`, token);
  return (res.data as StudentNote[]) ?? [];
}

export async function saveVerseMarker(
  token: string,
  clerkId: string,
  chapter: number,
  verse: number
): Promise<void> {
  await fetchWithAuth(`${student(clerkId)}/verse`, token, {
    method: "PUT",
    body: JSON.stringify({ chapter, verse }),
  });
}

// ---- Notifications (any signed-in user) ----

export async function getNotifications(
  token: string,
  unreadOnly = true
): Promise<AppNotification[]> {
  const res = await fetchWithAuth(
    `${DHARMA_API_URL}/notifications?unread=${unreadOnly}`,
    token
  );
  return (res.data as AppNotification[]) ?? [];
}

export async function getUnreadCount(token: string): Promise<number> {
  const res = await fetchWithAuth(
    `${DHARMA_API_URL}/notifications/unread-count`,
    token
  );
  return (res.data as { count: number })?.count ?? 0;
}

export async function markNotificationsRead(
  token: string,
  ids: string[]
): Promise<void> {
  await fetchWithAuth(`${DHARMA_API_URL}/notifications/read`, token, {
    method: "POST",
    body: JSON.stringify({ ids, all: false }),
  });
}

// ---- Admin: assigning a guide to each member ----

export interface AdminStudent {
  clerk_id: string;
  name: string;
  email: string;
  guide_clerk_id?: string;
  guide_name?: string;
  unanswered_count: number;
  verse: VerseMarker | null;
}

export interface GuideOption {
  clerk_id: string;
  name: string;
  email: string;
  student_count: number;
}

export async function getAdminStudents(
  token: string,
  filter: "all" | "assigned" | "unassigned" = "all"
): Promise<AdminStudent[]> {
  const res = await fetchWithAuth(
    `${DHARMA_API_URL}/students?filter=${filter}`,
    token
  );
  return (res.data as AdminStudent[]) ?? [];
}

export async function getGuideOptions(token: string): Promise<GuideOption[]> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/guides`, token);
  return (res.data as GuideOption[]) ?? [];
}

export async function assignGuide(
  token: string,
  studentClerkId: string,
  guideClerkId: string,
  reason = ""
): Promise<void> {
  await fetchWithAuth(
    `${DHARMA_API_URL}/students/${encodeURIComponent(studentClerkId)}/guide`,
    token,
    { method: "POST", body: JSON.stringify({ guide_clerk_id: guideClerkId, reason }) }
  );
}

export async function unassignGuide(
  token: string,
  studentClerkId: string
): Promise<void> {
  await fetchWithAuth(
    `${DHARMA_API_URL}/students/${encodeURIComponent(studentClerkId)}/guide`,
    token,
    { method: "DELETE" }
  );
}
