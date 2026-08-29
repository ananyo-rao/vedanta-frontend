"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Flame,
  Loader2,
  Plus,
  Check,
  Trophy,
  X,
  RefreshCw,
  Pause,
  Play,
} from "lucide-react";
import * as api from "@/lib/api/dharma-habits";
import type { Habit, HabitCheckin, HabitStats } from "@/lib/api/dharma-habits";

// ---- Tapas framework constants ----

const LEVELS = [
  { threshold: 0, title: "Mumukshu", meaning: "Seeker", color: "text-on-surface-variant" },
  { threshold: 50, title: "Abhyasi", meaning: "Practitioner", color: "text-amber-400" },
  { threshold: 150, title: "Sadhaka", meaning: "Disciplined", color: "text-orange-400" },
  { threshold: 400, title: "Tapasvi", meaning: "Austere", color: "text-red-400" },
  { threshold: 1000, title: "Sthitaprajna", meaning: "Steady-minded", color: "text-yellow-300" },
];

const MILESTONES = [
  { days: 7, label: "Spark" },
  { days: 21, label: "Flame" },
  { days: 66, label: "Fire" },
  { days: 100, label: "Eternal Flame" },
];

function getLevel(ahutis: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (ahutis >= LEVELS[i].threshold) {
      const next = LEVELS[i + 1] ?? null;
      return {
        ...LEVELS[i],
        index: i + 1,
        next,
        progress: next
          ? (ahutis - LEVELS[i].threshold) / (next.threshold - LEVELS[i].threshold)
          : 1,
      };
    }
  }
  return { ...LEVELS[0], index: 1, next: LEVELS[1], progress: 0 };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getRecentDays(n = 70): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function buildHeatmapGrid(days: string[]): (string | null)[][] {
  const firstDate = new Date(days[0]);
  const dow = (firstDate.getDay() + 6) % 7;
  const padded: (string | null)[] = [...Array(dow).fill(null), ...days];
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    const week = padded.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

// ---- Types ----

interface HabitData {
  habit: Habit;
  checkins: HabitCheckin[];
  stats: HabitStats;
}

// ---- Page ----

export default function TapasPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [habitData, setHabitData] = useState<HabitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStack, setNewStack] = useState("");
  const [newGuna, setNewGuna] = useState("sattva");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    const t = await getToken();
    if (!t) throw new Error("Not authenticated");
    return t;
  }, [getToken]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = await fetchToken();
      const me = await api.getMe(token);
      setMemberId(me.member_id);

      const habits = await api.getHabits(token, me.member_id);
      const startDate = getRecentDays(70)[0];
      const endDate = todayStr();

      const data = await Promise.all(
        habits.map(async (h) => {
          const [checkins, stats] = await Promise.all([
            api.getCheckins(token, h.id, startDate, endDate),
            api.getHabitStats(token, h.id),
          ]);
          return { habit: h, checkins: checkins ?? [], stats };
        })
      );
      setHabitData(data);
    } catch (e) {
      console.error("tapas: load failed", e);
    } finally {
      setLoading(false);
    }
  }, [fetchToken]);

  useEffect(() => {
    if (isLoaded && isSignedIn) loadAll();
  }, [isLoaded, isSignedIn, loadAll]);

  const totalAhutis = useMemo(
    () => habitData.reduce((sum, d) => sum + d.stats.total_days, 0),
    [habitData]
  );
  const level = useMemo(() => getLevel(totalAhutis), [totalAhutis]);
  const activeCount = habitData.filter((d) => d.habit.status === "active").length;

  const handleCheckin = async (habitId: string, completed: boolean) => {
    setCheckingIn(habitId);
    try {
      await api.recordCheckin(await fetchToken(), habitId, todayStr(), completed);
      await loadAll();
    } finally {
      setCheckingIn(null);
    }
  };

  const handleCreate = async () => {
    if (!memberId || !newName.trim()) return;
    setCreating(true);
    try {
      await api.createHabit(await fetchToken(), {
        member_id: memberId,
        name: newName.trim(),
        frequency: "daily",
        guna_target: newGuna,
        stack_formula: newStack.trim() || undefined,
      });
      setNewName("");
      setNewStack("");
      setShowCreate(false);
      await loadAll();
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (habitId: string, status: string) => {
    await api.updateHabitStatus(await fetchToken(), habitId, status);
    await loadAll();
  };

  const days = useMemo(() => getRecentDays(70), []);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold text-on-surface">Tapas</h1>
            <p className="text-sm text-on-surface-variant">
              The fire of discipline — consistent practice builds transformation.
            </p>
          </div>
        </div>
        <button
          onClick={loadAll}
          className="flex items-center gap-1.5 rounded-lg border border-outline-variant/20 px-3 py-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Level Progress */}
      <div className="mb-6 rounded-xl border border-outline-variant/10 bg-surface-container-low p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Flame className={`h-5 w-5 ${level.color}`} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${level.color}`}>{level.title}</h3>
              <p className="text-xs text-on-surface-variant">{level.meaning}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{totalAhutis}</p>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              Total Ahutis
            </p>
          </div>
        </div>

        {level.next ? (
          <div>
            <div className="mb-1 flex justify-between text-[11px] text-on-surface-variant">
              <span>Level {level.index}</span>
              <span>{level.next.threshold - totalAhutis} ahutis to {level.next.title}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                style={{ width: `${Math.min(level.progress * 100, 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-1 text-xs text-primary/60">
            Highest level — the fire burns eternal.
          </p>
        )}
      </div>

      {/* Active Habits Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-on-surface">
          Active Habits ({activeCount}/3)
        </h2>
        {activeCount < 3 && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New Practice
          </button>
        )}
      </div>

      {/* Empty State */}
      {habitData.length === 0 && !showCreate && (
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-8 text-center">
          <Flame className="mx-auto mb-2 h-8 w-8 text-on-surface-variant/30" />
          <p className="text-sm text-on-surface-variant">
            No habits yet. Start your first practice to ignite the fire.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="mr-1 inline h-4 w-4" /> Add First Practice
          </button>
        </div>
      )}

      {/* Habit Cards */}
      <div className="space-y-4">
        {habitData.map(({ habit, checkins, stats }) => {
          const completedSet = new Set(
            (checkins ?? []).filter((c) => c.completed).map((c) => c.date)
          );
          const todayDone = completedSet.has(todayStr());
          const isActive = habit.status === "active";
          const weeks = buildHeatmapGrid(days);
          const streak = habit.streak_current;
          const achieved = MILESTONES.filter((m) => stats.streak_best >= m.days);

          return (
            <div
              key={habit.id}
              className={`rounded-xl border bg-surface-container-low p-5 ${
                isActive ? "border-outline-variant/10" : "border-outline-variant/5 opacity-60"
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <button
                      onClick={() => handleCheckin(habit.id, !todayDone)}
                      disabled={checkingIn === habit.id}
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        todayDone
                          ? "border-primary bg-primary/20"
                          : "border-outline-variant/30 hover:border-primary/50"
                      }`}
                    >
                      {checkingIn === habit.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : todayDone ? (
                        <Check className="h-5 w-5 text-primary" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-outline-variant/30" />
                      )}
                    </button>
                  ) : (
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-outline-variant/10">
                      <Pause className="h-4 w-4 text-on-surface-variant/40" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">{habit.name}</h3>
                    {habit.stack_formula && (
                      <p className="mt-0.5 text-xs italic text-on-surface-variant">
                        &ldquo;{habit.stack_formula}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {streak > 0 && (
                    <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1">
                      <Flame className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-bold text-primary">{streak}d</span>
                    </div>
                  )}
                  {isActive ? (
                    <button
                      onClick={() => handleStatusChange(habit.id, "paused")}
                      className="p-1.5 text-on-surface-variant/40 hover:text-on-surface-variant"
                      title="Pause habit"
                    >
                      <Pause className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(habit.id, "active")}
                      className="p-1.5 text-on-surface-variant/40 hover:text-green-400"
                      title="Resume habit"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Heatmap */}
              <div className="mb-3 flex gap-[3px] overflow-x-auto py-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((day, di) => {
                      if (!day) return <div key={di} className="h-[13px] w-[13px]" />;
                      const done = completedSet.has(day);
                      const isToday = day === todayStr();
                      return (
                        <div
                          key={di}
                          title={`${day}${done ? " — completed" : ""}`}
                          className={`h-[13px] w-[13px] rounded-[2px] transition-colors ${
                            done
                              ? "bg-primary"
                              : isToday
                              ? "bg-surface-container-high ring-1 ring-primary/50"
                              : "bg-surface-container-high/80"
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-on-surface-variant">
                <span>Best streak: <strong className="text-on-surface">{stats.streak_best}d</strong></span>
                <span>Total: <strong className="text-on-surface">{stats.total_days} ahutis</strong></span>
                <span>
                  Completion:{" "}
                  <strong className="text-on-surface">
                    {stats.total_checkins > 0 ? Math.round(stats.completion_rate * 100) : 0}%
                  </strong>
                </span>
                {habit.guna_target && (
                  <span className="rounded bg-surface-container-high px-1.5 py-0.5 capitalize">
                    {habit.guna_target}
                  </span>
                )}
                {habit.status !== "active" && (
                  <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 capitalize text-yellow-500">
                    {habit.status}
                  </span>
                )}
              </div>

              {/* Milestone badges */}
              {achieved.length > 0 && (
                <div className="mt-2.5 flex gap-2">
                  {achieved.map((m) => (
                    <span
                      key={m.days}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary/80"
                    >
                      <Trophy className="h-3 w-3" /> {m.label} ({m.days}d)
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Habit Form */}
      {showCreate && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-surface-container-low p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-primary">New Practice</h3>
            <button
              onClick={() => setShowCreate(false)}
              className="text-on-surface-variant/40 hover:text-on-surface-variant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-on-surface-variant">
                What practice will you do daily?
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Meditate for 2 minutes"
                className="w-full rounded-lg border border-outline-variant/20 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-on-surface-variant">
                Habit Stack (optional): &ldquo;After I ___, I will ___&rdquo;
              </label>
              <input
                value={newStack}
                onChange={(e) => setNewStack(e.target.value)}
                placeholder="e.g. After I pour my morning tea, I will sit and meditate"
                className="w-full rounded-lg border border-outline-variant/20 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-on-surface-variant">
                Guna Target
              </label>
              <select
                value={newGuna}
                onChange={(e) => setNewGuna(e.target.value)}
                className="rounded-lg border border-outline-variant/20 bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50"
              >
                <option value="sattva">Sattva (clarity &amp; peace)</option>
                <option value="rajas">Rajas (energy &amp; action)</option>
              </select>
            </div>

            <button
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Flame className="h-4 w-4" />
              )}
              Ignite Practice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
