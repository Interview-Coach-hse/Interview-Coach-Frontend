import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ReportStatus, SessionState } from "@/api/generated/schema";
import { sessionsApi } from "@/features/sessions/api/sessions.api";
import { useSessionReport } from "@/features/sessions/hooks/useSessionReport";
import { SessionReportSummary } from "@/features/sessions/ui/SessionReportSummary";
import { useSession } from "@/features/sessions/hooks/useSession";
import { formatDateTime } from "@/shared/lib/format";
import { Badge, Card, ErrorState, Loader, PageHeader } from "@/shared/ui";

export function SessionHistoryDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { sessionQuery, messagesQuery } = useSession(sessionId);
  const state = sessionQuery.data?.state;
  const reportQuery = useSessionReport(
    sessionId,
    Boolean(sessionId) &&
      state !== SessionState.Created &&
      state !== SessionState.InProgress &&
      state !== SessionState.Paused,
  );
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

  useEffect(() => {
    if (
      sessionId &&
      (state === SessionState.Created || state === SessionState.InProgress || state === SessionState.Paused)
    ) {
      navigate(`/app/sessions/${sessionId}`, { replace: true });
    }
  }, [navigate, sessionId, state]);

  if (sessionQuery.isLoading || messagesQuery.isLoading) {
    return <Loader />;
  }

  if (sessionQuery.isError) {
    return <ErrorState error={sessionQuery.error} retry={() => sessionQuery.refetch()} />;
  }

  if (state === SessionState.Created || state === SessionState.InProgress || state === SessionState.Paused) {
    return <Loader label="Возвращаем вас в активную сессию..." />;
  }

  return (
    <div className="grid">
      <PageHeader
        eyebrow="Session Detail"
        title={sessionQuery.data?.profileTitle ?? "Сессия"}
        actions={
          <Link to={`/app/sessions/${sessionId}/report`} className="ghost-link">
            Смотреть отчет
          </Link>
        }
      />
      <Card>
        <div className="inline-actions">
          <Badge tone="accent">{sessionQuery.data?.state ?? "—"}</Badge>
          <span className="muted">{formatDateTime(sessionQuery.data?.startedAt)}</span>
        </div>
      </Card>
      <Card>
        <h2>Диалог</h2>
        <div className="message-list">
          {messagesQuery.data?.items?.map((message) => (
            <div key={message.id} className={`message-bubble ${message.senderType === "USER" ? "user" : ""}`}>
              <p className="eyebrow">{message.senderType}</p>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      </Card>
      <div>
        <h2 style={{ marginBottom: "1rem" }}>Отчёт по сессии</h2>
        <SessionReportSummary
          report={reportQuery.data}
          isLoading={reportQuery.isLoading}
          isError={reportQuery.isError}
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
    </div>
  );
}
