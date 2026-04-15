import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { SessionState } from "@/api/generated/schema";
import { sessionsApi } from "@/features/sessions/api/sessions.api";
import { useSessionReport } from "@/features/sessions/hooks/useSessionReport";
import { formatScore } from "@/shared/lib/format";
import { Badge, Card, ErrorState, Loader, PageHeader } from "@/shared/ui";

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

  if (isActiveSession(state) || state === SessionState.Processing || reportQuery.isLoading) {
    return <Loader label="Формируем отчет по текущей сессии..." />;
  }

  if (reportQuery.isError) {
    return <ErrorState error={reportQuery.error} retry={() => reportQuery.refetch()} />;
  }

  const report = reportQuery.data;
  const strengths = report?.items?.filter((item) => item.itemType === "STRENGTH") ?? [];
  const weaknesses = report?.items?.filter((item) => item.itemType === "WEAKNESS") ?? [];
  const recommendations = report?.items?.filter((item) => item.itemType === "RECOMMENDATION") ?? [];

  return (
    <div className="grid">
      <PageHeader
        eyebrow="AI Feedback"
        title="Отчет по сессии"
        description={report?.summaryText ?? "Отчет формируется на backend."}
      />
      <div className="grid grid-2">
        <Card>
          <div className="score-ring" style={{ ["--score" as string]: String((report?.overallScore ?? 0) * 10) }}>
            <span>{formatScore(report?.overallScore)}</span>
          </div>
        </Card>
        <Card>
          <p className="muted">Статус отчета</p>
          <Badge tone={report?.status === "READY" ? "success" : "warning"}>{report?.status ?? "PENDING"}</Badge>
          <p style={{ marginTop: "1rem" }}>
            {report?.summaryText ?? "Промежуточный результат пока недоступен. Обновим экран, как только backend соберет отчет."}
          </p>
        </Card>
      </div>
      <div className="grid grid-3">
        <Card>
          <h3>Сильные стороны</h3>
          {strengths.length ? strengths.map((item) => <p key={item.title}>{item.title}: {item.content}</p>) : <p className="muted">Пока нет данных.</p>}
        </Card>
        <Card>
          <h3>Слабые стороны</h3>
          {weaknesses.length ? weaknesses.map((item) => <p key={item.title}>{item.title}: {item.content}</p>) : <p className="muted">Пока нет данных.</p>}
        </Card>
        <Card>
          <h3>Рекомендации</h3>
          {recommendations.length ? recommendations.map((item) => <p key={item.title}>{item.title}: {item.content}</p>) : <p className="muted">Пока нет данных.</p>}
        </Card>
      </div>
    </div>
  );
}
