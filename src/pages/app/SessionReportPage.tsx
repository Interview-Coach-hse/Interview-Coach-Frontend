import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ReportStatus, SessionState } from "@/api/generated/schema";
import { sessionsApi } from "@/features/sessions/api/sessions.api";
import { useSessionReport } from "@/features/sessions/hooks/useSessionReport";
import { SessionReportSummary } from "@/features/sessions/ui/SessionReportSummary";
import { ErrorState, Loader, PageHeader } from "@/shared/ui";

function isActiveSession(state?: SessionState) {
  return (
    state === SessionState.Created ||
    state === SessionState.InProgress ||
    state === SessionState.Paused
  );
}

export function SessionReportPage() {
  const { sessionId } = useParams();
  const queryClient = useQueryClient();
  const finishAttemptedRef = useRef(false);

  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => sessionsApi.get(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state === SessionState.Processing ? 5000 : false;
    },
  });

  const finishMutation = useMutation({
    mutationFn: () => sessionsApi.finish(sessionId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["session", sessionId, "report"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });

  const state = sessionQuery.data?.state;
  const reportQuery = useSessionReport(sessionId, Boolean(sessionId) && !isActiveSession(state));

  useEffect(() => {
    if (!sessionId || !state || !isActiveSession(state) || finishMutation.isPending || finishAttemptedRef.current) {
      return;
    }

    finishAttemptedRef.current = true;
    finishMutation.mutate();
  }, [finishMutation, sessionId, state]);

  if (sessionQuery.isLoading) {
    return <Loader label="Открываем отчет..." />;
  }

  if (sessionQuery.isError) {
    return <ErrorState error={sessionQuery.error} retry={() => sessionQuery.refetch()} />;
  }

  if (finishMutation.isError) {
    return (
      <ErrorState
        error={finishMutation.error}
        retry={() => {
          finishAttemptedRef.current = false;
          finishMutation.reset();
          finishMutation.mutate();
        }}
      />
    );
  }

  if (finishMutation.isPending) {
    return <Loader label="Интервью завершено. Готовим отчёт..." />;
  }

  if (isActiveSession(state) || state === SessionState.Processing || reportQuery.isLoading || reportQuery.data?.status === ReportStatus.Pending) {
    return <Loader label="Генерируем отчёт..." />;
  }

  if (reportQuery.isError) {
    return <ErrorState error={reportQuery.error} retry={() => reportQuery.refetch()} />;
  }

  return (
    <div className="grid">
      <PageHeader
        eyebrow="AI Feedback"
        title="Отчет по сессии"
        description={reportQuery.data?.summaryText ?? "Отчет собран backend и готов к просмотру."}
      />
      <SessionReportSummary report={reportQuery.data} onRetry={() => void reportQuery.refetch()} />
    </div>
  );
}
