"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import * as sessionsApi from "@/lib/api/dharma-sessions";
import type { SeriesInput } from "@/lib/api/dharma-sessions";

export const sessionKeys = {
  all: ["sessions"] as const,
  mine: (from: string, to: string) =>
    [...sessionKeys.all, "mine", from, to] as const,
  window: (from: string, to: string) =>
    [...sessionKeys.all, "window", from, to] as const,
  detail: (id: string) => [...sessionKeys.all, "detail", id] as const,
  transcript: (id: string) => [...sessionKeys.all, "transcript", id] as const,
  series: () => [...sessionKeys.all, "series"] as const,
};

/**
 * A clock that ticks, so "is this class still upcoming?" re-evaluates as time
 * passes instead of freezing at first render. Reading Date.now() during render
 * would be impure — and would leave a finished class sitting under "Upcoming"
 * until something else happened to re-render the page.
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

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

/**
 * A window covering the classes worth showing: recent enough to still offer a
 * recording, far enough ahead to show what is coming. Memo-stable by day so it
 * does not re-key the query on every render.
 */
export function defaultWindow() {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 30);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setDate(to.getDate() + 60);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

// ── Member ──────────────────────────────────────────────────────────────────

/**
 * The classes this member is invited to. Polled because a class going live is
 * the thing the page exists to surface, and it happens while they are looking.
 */
export function useMySessions(from: Date, to: Date) {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: sessionKeys.mine(from.toISOString(), to.toISOString()),
    queryFn: async () =>
      sessionsApi.getMySessions(await fetchToken(), from, to),
    enabled: ready,
    retry: 1,
    refetchInterval: 30_000,
  });
}

export function useSession(id: string, poll = false) {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: async () => sessionsApi.getSession(await fetchToken(), id),
    enabled: ready && !!id,
    retry: 1,
    // While live or processing the status changes underneath us.
    refetchInterval: poll ? 5_000 : false,
  });
}

export function useTranscript(id: string, enabled: boolean) {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: sessionKeys.transcript(id),
    queryFn: async () => sessionsApi.getTranscript(await fetchToken(), id),
    enabled: ready && enabled && !!id,
    // A missing transcript is a 404, not a transient failure.
    retry: false,
  });
}

export function useJoinSession() {
  const { fetchToken } = useAuthToken();
  return useMutation({
    mutationFn: async (id: string) =>
      sessionsApi.joinSession(await fetchToken(), id),
  });
}

// ── Admin ───────────────────────────────────────────────────────────────────

export function useSessionSeries() {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: sessionKeys.series(),
    queryFn: async () => sessionsApi.listSeries(await fetchToken()),
    enabled: ready,
    retry: 1,
  });
}

export function useAllSessions(from: Date, to: Date) {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: sessionKeys.window(from.toISOString(), to.toISOString()),
    queryFn: async () => sessionsApi.listSessions(await fetchToken(), from, to),
    enabled: ready,
    retry: 1,
    refetchInterval: 30_000,
  });
}

/** Invalidates everything session-shaped; scheduling changes ripple widely. */
function useInvalidateSessions() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: sessionKeys.all });
}

export function useCreateSeries() {
  const { fetchToken } = useAuthToken();
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: async (input: SeriesInput) =>
      sessionsApi.createSeries(await fetchToken(), input),
    onSuccess: invalidate,
  });
}

export function useUpdateSeries() {
  const { fetchToken } = useAuthToken();
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<SeriesInput> & { is_active?: boolean };
    }) => sessionsApi.updateSeries(await fetchToken(), id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteSeries() {
  const { fetchToken } = useAuthToken();
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: async (id: string) =>
      sessionsApi.deleteSeries(await fetchToken(), id),
    onSuccess: invalidate,
  });
}

export function useStartSession() {
  const { fetchToken } = useAuthToken();
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: async (id: string) =>
      sessionsApi.startSession(await fetchToken(), id),
    onSuccess: invalidate,
  });
}

export function useEndSession() {
  const { fetchToken } = useAuthToken();
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: async (id: string) =>
      sessionsApi.endSession(await fetchToken(), id),
    onSuccess: invalidate,
  });
}

export function useCancelSession() {
  const { fetchToken } = useAuthToken();
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: async (id: string) =>
      sessionsApi.cancelSession(await fetchToken(), id),
    onSuccess: invalidate,
  });
}
