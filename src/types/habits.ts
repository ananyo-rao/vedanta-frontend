export interface Habit {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  cue: string;
  reward: string;
  status: "active" | "paused" | "dropped" | "formed";
  streak_current: number;
  streak_best: number;
  started_at: string;
  formed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitCheckin {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  reflection: string | null;
  created_at: string;
}

export interface HabitWithCheckins extends Habit {
  checkins: HabitCheckin[];
}

export interface CreateHabitInput {
  name: string;
  category?: string;
  cue: string;
  reward: string;
}

export interface UpdateHabitInput {
  name?: string;
  category?: string;
  cue?: string;
  reward?: string;
}

export interface RecordCheckinInput {
  date: string;
  completed: boolean;
  reflection?: string;
}

export interface CheckinResult {
  checkin: HabitCheckin;
  habit: Habit;
  milestones?: string[];
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
