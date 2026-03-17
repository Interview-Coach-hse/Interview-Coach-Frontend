import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionsApi, type HistoryFilters } from "@/features/sessions/api/sessions.api";

export function useHistory(filters: HistoryFilters) {
  return useQuery({
    queryKey: ["history", filters],
    queryFn: () => sessionsApi.history(filters),
  });
}

export function useSession(sessionId?: string) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => sessionsApi.get(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state === "PROCESSING" ? 5000 : false;
    },
  });

  const messagesQuery = useQuery({
    queryKey: ["session", sessionId, "messages"],
    queryFn: () => sessionsApi.messages(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: 4000,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["session", sessionId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  };

  return {
    sessionQuery,
    messagesQuery,
    startMutation: useMutation({
      mutationFn: () => sessionsApi.start(sessionId!),
      ...mutationOptions,
    }),
    pauseMutation: useMutation({
      mutationFn: () => sessionsApi.pause(sessionId!),
      ...mutationOptions,
    }),
    resumeMutation: useMutation({
      mutationFn: () => sessionsApi.resume(sessionId!),
      ...mutationOptions,
    }),
    cancelMutation: useMutation({
      mutationFn: () => sessionsApi.cancel(sessionId!),
      ...mutationOptions,
    }),
    finishMutation: useMutation({
      mutationFn: () => sessionsApi.finish(sessionId!),
      ...mutationOptions,
    }),
    sendMessageMutation: useMutation({
      mutationFn: (message: string) => sessionsApi.sendMessage(sessionId!, { message }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["session", sessionId, "messages"] });
        queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      },
    }),
  };
}
