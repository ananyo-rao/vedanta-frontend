import type {
  HabitWithCheckins,
  Habit,
  CreateHabitInput,
  UpdateHabitInput,
  RecordCheckinInput,
  CheckinResult,
  HabitStats,
  HabitCheckin,
} from "@/types/habits";
import { fetchWithAuth, API_URL } from "@/lib/api/fetch";

export async function listHabits(
  token: string
): Promise<{ data: HabitWithCheckins[] }> {
  return fetchWithAuth(`${API_URL}/api/habits`, token);
}

export async function createHabit(
  token: string,
  input: CreateHabitInput
): Promise<{ data: Habit }> {
  return fetchWithAuth(`${API_URL}/api/habits`, token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getHabit(
  token: string,
  habitId: string
): Promise<{ data: Habit }> {
  return fetchWithAuth(`${API_URL}/api/habits/${habitId}`, token);
}

export async function updateHabit(
  token: string,
  habitId: string,
  input: UpdateHabitInput
): Promise<{ data: Habit }> {
  return fetchWithAuth(`${API_URL}/api/habits/${habitId}`, token, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function updateHabitStatus(
  token: string,
  habitId: string,
  status: string
): Promise<{ data: Habit }> {
  return fetchWithAuth(`${API_URL}/api/habits/${habitId}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteHabit(
  token: string,
  habitId: string
): Promise<void> {
  await fetchWithAuth(`${API_URL}/api/habits/${habitId}`, token, {
    method: "DELETE",
  });
}

export async function recordCheckin(
  token: string,
  habitId: string,
  input: RecordCheckinInput
): Promise<{ data: CheckinResult }> {
  return fetchWithAuth(`${API_URL}/api/habits/${habitId}/checkins`, token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listCheckins(
  token: string,
  habitId: string,
  params?: { start_date?: string; end_date?: string }
): Promise<{ data: HabitCheckin[] }> {
  const qs = new URLSearchParams();
  if (params?.start_date) qs.set("start_date", params.start_date);
  if (params?.end_date) qs.set("end_date", params.end_date);
  const q = qs.toString();
  return fetchWithAuth(
    `${API_URL}/api/habits/${habitId}/checkins${q ? `?${q}` : ""}`,
    token
  );
}

export async function getHabitStats(
  token: string,
  habitId: string
): Promise<{ data: HabitStats }> {
  return fetchWithAuth(`${API_URL}/api/habits/${habitId}/stats`, token);
}
