import { useQuery } from "@tanstack/react-query";
import { sessionsApi } from "@/features/sessions/api/sessions.api";

export function useSessionReport(sessionId?: string) {
  return useQuery({
    queryKey: ["session", sessionId, "report"],
    queryFn: () => sessionsApi.report(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" ? 5000 : false;
    },
  });
}
