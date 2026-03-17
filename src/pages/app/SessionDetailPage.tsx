import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSession } from "@/features/sessions/hooks/useSession";
import { Button, Card, ErrorState, Input, Loader, PageHeader } from "@/shared/ui";

export function SessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const { sessionQuery, messagesQuery, startMutation, pauseMutation, resumeMutation, cancelMutation, finishMutation, sendMessageMutation } =
    useSession(sessionId);

  if (sessionQuery.isLoading || messagesQuery.isLoading) {
    return <Loader />;
  }

  if (sessionQuery.isError || messagesQuery.isError) {
    return <ErrorState error={sessionQuery.error ?? messagesQuery.error} />;
  }

  const state = sessionQuery.data?.state;

  return (
    <div className="grid">
      <PageHeader
        eyebrow="Live Session"
        title={sessionQuery.data?.profileTitle ?? "Сессия"}
        description={`Статус: ${state}`}
        actions={
          <div className="inline-actions">
            {state === "CREATED" ? <Button onClick={() => startMutation.mutate()}>Старт</Button> : null}
            {state === "IN_PROGRESS" ? <Button variant="secondary" onClick={() => pauseMutation.mutate()}>Пауза</Button> : null}
            {state === "PAUSED" ? <Button variant="secondary" onClick={() => resumeMutation.mutate()}>Возобновить</Button> : null}
            <Button variant="danger" onClick={() => cancelMutation.mutate()}>Отменить</Button>
            <Button
              onClick={() =>
                finishMutation.mutate(undefined, {
                  onSuccess: () => navigate(`/app/sessions/${sessionId}/report`),
                })
              }
            >
              Завершить
            </Button>
          </div>
        }
      />
      <Card>
        <div className="message-list">
          {messagesQuery.data?.items?.map((item) => (
            <div key={item.id} className={`message-bubble ${item.senderType === "USER" ? "user" : ""}`}>
              <p className="eyebrow">{item.senderType}</p>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
      </Card>
      <div className="sticky-composer">
        <Input
          label="Ваш ответ"
          placeholder="Введите ответ до 4000 символов"
          value={message}
          maxLength={4000}
          onChange={(event) => setMessage(event.target.value)}
        />
        <div className="inline-actions">
          <Button
            onClick={() =>
              sendMessageMutation.mutate(message, {
                onSuccess: () => setMessage(""),
              })
            }
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            Отправить
          </Button>
          <Link to={`/app/sessions/${sessionId}/report`} className="ghost-link">
            К отчету
          </Link>
        </div>
      </div>
    </div>
  );
}
