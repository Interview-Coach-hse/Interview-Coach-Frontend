import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ReportStatus, SessionState } from "@/api/generated/schema";
import { sessionsApi } from "@/features/sessions/api/sessions.api";
import { useSessionReport } from "@/features/sessions/hooks/useSessionReport";
import { SessionReportSummary } from "@/features/sessions/ui/SessionReportSummary";
import { HttpError } from "@/shared/lib/error";
import { ErrorState, Loader, PageHeader } from "@/shared/ui";

function isActiveSession(state?: SessionState) {
  return (
    state === SessionState.Created ||
    state === SessionState.InProgress ||
    state === SessionState.Paused
  );
}

function isFinishStateConflict(error: unknown) {
  return (
    error instanceof HttpError &&
    error.status === 400 &&
    error.payload?.message?.toLowerCase().includes("session cannot be finished from current state")
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
  const retryReportMutation = useMutation({
    mutationFn: () => sessionsApi.retryReport(sessionId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      await queryClient.invalidateQueries({ queryKey: ["session", sessionId, "report"] });
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      await sessionQuery.refetch();
      await reportQuery.refetch();
    },
  });

  const state = sessionQuery.data?.state;
  const reportQuery = useSessionReport(sessionId, Boolean(sessionId) && !isActiveSession(state));

  useEffect(() => {
    if (!sessionId || !state || !isActiveSession(state) || finishMutation.isPending || finishAttemptedRef.current) {
      return;
    }

    finishAttemptedRef.current = true;
    void (async () => {
      try {
        const freshSession = await sessionQuery.refetch();
        const freshState = freshSession.data?.state;

        if (
          freshState === SessionState.Processing ||
          freshState === SessionState.Finished ||
          freshState === SessionState.Failed ||
          freshState === SessionState.Canceled
        ) {
          return;
        }

        if (!isActiveSession(freshState)) {
          finishAttemptedRef.current = false;
          return;
        }

        await finishMutation.mutateAsync();
      } catch (error) {
        if (!isFinishStateConflict(error)) {
          return;
        }

        const nextSession = await sessionQuery.refetch();
        const nextState = nextSession.data?.state;

        if (nextState === SessionState.Processing || nextState === SessionState.Finished) {
          return;
        }
      }
    })();
  }, [finishMutation, sessionId, sessionQuery, state]);

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
      />
      <SessionReportSummary
        report={reportQuery.data}
        isRetrying={retryReportMutation.isPending}
        onRetry={() => {
          if (reportQuery.data?.status === ReportStatus.Failed) {
            retryReportMutation.mutate();
            return;
          }

          void reportQuery.refetch();
        }}
      />
    </div>
  );
}
