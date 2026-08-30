"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { habitKeys } from "@/lib/query-keys";
import * as api from "@/lib/api/habits";
import type { CreateHabitInput, UpdateHabitInput, RecordCheckinInput } from "@/types/habits";

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

export function useHabits() {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: habitKeys.list(),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.listHabits(token);
      return result.data;
    },
    enabled: ready,
  });
}

export function useCreateHabit() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateHabitInput) => {
      const token = await fetchToken();
      const result = await api.createHabit(token, input);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}

export function useUpdateHabit() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      habitId,
      input,
    }: {
      habitId: string;
      input: UpdateHabitInput;
    }) => {
      const token = await fetchToken();
      const result = await api.updateHabit(token, habitId, input);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}

export function useUpdateHabitStatus() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      habitId,
      status,
    }: {
      habitId: string;
      status: string;
    }) => {
      const token = await fetchToken();
      const result = await api.updateHabitStatus(token, habitId, status);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}

export function useDeleteHabit() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (habitId: string) => {
      const token = await fetchToken();
      await api.deleteHabit(token, habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}

export function useRecordCheckin() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      habitId,
      input,
    }: {
      habitId: string;
      input: RecordCheckinInput;
    }) => {
      const token = await fetchToken();
      const result = await api.recordCheckin(token, habitId, input);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}

export function useHabitStats(habitId: string) {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: habitKeys.stats(habitId),
    queryFn: async () => {
      const token = await fetchToken();
      const result = await api.getHabitStats(token, habitId);
      return result.data;
    },
    enabled: ready && !!habitId,
  });
}
