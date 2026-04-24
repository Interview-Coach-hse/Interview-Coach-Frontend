import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SessionState } from "@/api/generated/schema";
import { useSession } from "@/features/sessions/hooks/useSession";
import { Button, Card, ErrorState, Loader, PageHeader, Textarea } from "@/shared/ui";

export function SessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const autoStartAttemptedRef = useRef(false);
  const { sessionQuery, messagesQuery, startMutation, pauseMutation, resumeMutation, cancelMutation, finishMutation, sendMessageMutation } =
    useSession(sessionId);

  const state = sessionQuery.data?.state;
  const hasMessages = Boolean(messagesQuery.data?.items?.length);
  const isInProgress = state === SessionState.InProgress;
  const isPaused = state === SessionState.Paused;
  const isLocked = !isInProgress;

  useEffect(() => {
    autoStartAttemptedRef.current = false;
  }, [sessionId]);

  useEffect(() => {
    if (state !== "CREATED" || hasMessages || startMutation.isPending || autoStartAttemptedRef.current) {
      return;
    }

    autoStartAttemptedRef.current = true;
    startMutation.mutate();
  }, [hasMessages, startMutation, state]);

  if (sessionQuery.isLoading || messagesQuery.isLoading) {
    return <Loader />;
  }

  if (sessionQuery.isError || messagesQuery.isError) {
    return <ErrorState error={sessionQuery.error ?? messagesQuery.error} />;
  }

  if (state === "CREATED" && !hasMessages && startMutation.isPending) {
    return <Loader label="Получаем первый вопрос..." />;
  }

  if (state === "CREATED" && !hasMessages && startMutation.isError) {
    return (
      <ErrorState
        error={startMutation.error}
        retry={() => {
          autoStartAttemptedRef.current = false;
          startMutation.reset();
          startMutation.mutate();
        }}
      />
    );
  }

  if (finishMutation.isError) {
    return (
      <ErrorState
        error={finishMutation.error}
        retry={() => {
          finishMutation.reset();
          finishMutation.mutate(undefined, {
            onSuccess: () => navigate(`/app/sessions/${sessionId}/report`),
          });
        }}
      />
    );
  }

  return (
    <div className="grid session-page">
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
              disabled={finishMutation.isPending}
              onClick={() =>
                finishMutation.mutate(undefined, {
                  onSuccess: () => navigate(`/app/sessions/${sessionId}/report`),
                })
              }
            >
              {finishMutation.isPending ? "Завершаем..." : "Завершить"}
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
      <div className="sticky-composer session-composer">
        <Textarea
          label="Ваш ответ"
          className="session-composer-input"
          rows={3}
          placeholder={
            isPaused
              ? "Сессия на паузе. Нажмите «Возобновить», чтобы продолжить."
              : isInProgress
                ? "Введите ответ до 4000 символов"
                : "Отправка ответа доступна только во время активной сессии."
          }
          value={message}
          maxLength={4000}
          disabled={isLocked}
          onChange={(event) => setMessage(event.target.value)}
        />
        <div className="inline-actions">
          <span className="muted">{message.length}/4000</span>
        </div>
        <div className="inline-actions">
          <Button
            onClick={() =>
              sendMessageMutation.mutate(message, {
                onSuccess: () => setMessage(""),
              })
            }
            disabled={isLocked || !message.trim() || sendMessageMutation.isPending}
          >
            Отправить
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={finishMutation.isPending}
            onClick={() =>
              finishMutation.mutate(undefined, {
                onSuccess: () => navigate(`/app/sessions/${sessionId}/report`),
              })
            }
          >
            {finishMutation.isPending ? "Готовим отчет..." : "Завершить и перейти к отчету"}
          </Button>
        </div>
      </div>
    </div>
  );
}
