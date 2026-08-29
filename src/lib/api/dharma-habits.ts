import { fetchWithAuth } from "./fetch";

const DHARMA_API_URL =
  process.env.NEXT_PUBLIC_DHARMA_API_URL || "http://localhost:8081/api";

// ---- Types ----

export interface MemberProfile {
  member_id: string;
  name: string;
  email: string;
}

export interface Habit {
  id: string;
  member_id: string;
  name: string;
  category?: string;
  guna_target?: string;
  frequency: string;
  stack_formula?: string;
  status: "active" | "paused" | "formed" | "dropped";
  streak_current: number;
  streak_best: number;
  started_at: string;
  formed_at?: string;
  created_at: string;
}

export interface HabitCheckin {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  reflection?: string;
  created_at: string;
}

export interface HabitStats {
  habit_id: string;
  streak_current: number;
  streak_best: number;
  total_days: number;
  total_checkins: number;
  completion_rate: number;
  milestones: string[];
}

// ---- API ----

export async function getMe(token: string): Promise<MemberProfile> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/me`, token);
  return res.data ?? res;
}

export async function getHabits(token: string, memberId: string): Promise<Habit[]> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/habits?member_id=${memberId}`, token);
  return (res.data ?? res) as Habit[];
}

export async function createHabit(
  token: string,
  data: { member_id: string; name: string; frequency?: string; guna_target?: string; stack_formula?: string }
): Promise<Habit> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/habits`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return (res.data ?? res) as Habit;
}

export async function updateHabitStatus(token: string, id: string, status: string): Promise<void> {
  await fetchWithAuth(`${DHARMA_API_URL}/habits/${id}/status`, token, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function recordCheckin(
  token: string,
  habitId: string,
  date: string,
  completed: boolean
): Promise<void> {
  await fetchWithAuth(`${DHARMA_API_URL}/habits/${habitId}/checkins`, token, {
    method: "POST",
    body: JSON.stringify({ date, completed }),
  });
}

export async function getCheckins(
  token: string,
  habitId: string,
  startDate: string,
  endDate: string
): Promise<HabitCheckin[]> {
  const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
  const res = await fetchWithAuth(`${DHARMA_API_URL}/habits/${habitId}/checkins?${params}`, token);
  return (res.data ?? res) as HabitCheckin[];
}

export async function getHabitStats(token: string, habitId: string): Promise<HabitStats> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/habits/${habitId}/stats`, token);
  return (res.data ?? res) as HabitStats;
}
