"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import * as api from "@/lib/api/dharma-teachings";
import type { NewTeaching } from "@/lib/api/dharma-teachings";

const teachingKeys = { list: ["dharma-teachings"] as const };

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

export function useTeachings() {
  const { fetchToken, ready } = useAuthToken();
  return useQuery({
    queryKey: teachingKeys.list,
    queryFn: async () => api.getTeachings(await fetchToken()),
    enabled: ready,
    retry: 1,
  });
}

export function useAddTeaching() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewTeaching) =>
      api.addTeaching(await fetchToken(), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teachingKeys.list }),
  });
}

export function useDeleteTeaching() {
  const { fetchToken } = useAuthToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.deleteTeaching(await fetchToken(), id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teachingKeys.list }),
  });
}
