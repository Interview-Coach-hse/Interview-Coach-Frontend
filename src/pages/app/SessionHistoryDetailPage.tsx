import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SessionState } from "@/api/generated/schema";
import { useSession } from "@/features/sessions/hooks/useSession";
import { formatDateTime } from "@/shared/lib/format";
import { Badge, Card, ErrorState, Loader, PageHeader } from "@/shared/ui";

export function SessionHistoryDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessionQuery, messagesQuery } = useSession(sessionId);
  const state = sessionQuery.data?.state;

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
    </div>
  );
}
