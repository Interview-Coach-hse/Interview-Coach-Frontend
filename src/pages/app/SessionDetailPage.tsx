import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SessionState } from "@/api/generated/schema";
import { useProfile } from "@/features/profiles/hooks/useProfiles";
import { useSession } from "@/features/sessions/hooks/useSession";
import { Button, Card, ErrorState, Loader, PageHeader, Textarea } from "@/shared/ui";

export function SessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const autoStartAttemptedRef = useRef(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const { sessionQuery, messagesQuery, startMutation, pauseMutation, resumeMutation, cancelMutation, finishMutation, sendMessageMutation } =
    useSession(sessionId);
  const profileQuery = useProfile(sessionQuery.data?.profileId);

  const state = sessionQuery.data?.state;
  const messages = messagesQuery.data?.items ?? [];
  const hasMessages = Boolean(messagesQuery.data?.items?.length);
  const isInProgress = state === SessionState.InProgress;
  const isPaused = state === SessionState.Paused;
  const isLocked = !isInProgress;
  const totalQuestions = profileQuery.data?.questions?.length ?? 0;
  const currentQuestionIndex = sessionQuery.data?.currentQuestionIndex ?? null;
  const isAnsweringLastQuestion = currentQuestionIndex !== null && totalQuestions > 0 && currentQuestionIndex >= totalQuestions - 1;

  const scrollMessagesToBottom = (behavior: ScrollBehavior = "smooth") => {
    const node = messageListRef.current;

    if (!node) {
      return;
    }

    node.scrollTo({
      top: node.scrollHeight,
      behavior,
    });
  };

  const handleFinish = () => {
    finishMutation.mutate(undefined, {
      onSuccess: () => navigate(`/app/sessions/${sessionId}/report`),
    });
  };

  useEffect(() => {
    autoStartAttemptedRef.current = false;
  }, [sessionId]);

  useEffect(() => {
    shouldStickToBottomRef.current = true;
    requestAnimationFrame(() => {
      scrollMessagesToBottom("auto");
    });
  }, [sessionId]);

  useEffect(() => {
    if (state !== "CREATED" || hasMessages || startMutation.isPending || autoStartAttemptedRef.current) {
      return;
    }

    autoStartAttemptedRef.current = true;
    startMutation.mutate();
  }, [hasMessages, startMutation, state]);

  useEffect(() => {
    if (shouldStickToBottomRef.current) {
      requestAnimationFrame(() => {
        scrollMessagesToBottom(messages.length > 1 ? "smooth" : "auto");
      });
    }
  }, [messages.length]);

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
          handleFinish();
        }}
      />
    );
  }

  const handleSubmitAnswer = () => {
    sendMessageMutation.mutate(message, {
      onSuccess: () => {
        shouldStickToBottomRef.current = true;
        setMessage("");

        if (isAnsweringLastQuestion) {
          handleFinish();
        }
      },
    });
  };

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
              onClick={handleFinish}
            >
              {finishMutation.isPending ? "Завершаем..." : "Завершить"}
            </Button>
          </div>
        }
      />
      <Card>
        <div
          ref={messageListRef}
          className="message-list"
          onScroll={(event) => {
            const node = event.currentTarget;
            const distanceToBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
            shouldStickToBottomRef.current = distanceToBottom < 48;
          }}
        >
          {messages.map((item) => (
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
            onClick={handleSubmitAnswer}
            disabled={isLocked || !message.trim() || sendMessageMutation.isPending}
          >
            {isAnsweringLastQuestion ? "Отправить и завершить" : "Отправить"}
          </Button>
          {!isAnsweringLastQuestion ? (
            <Button
              type="button"
              variant="ghost"
              disabled={finishMutation.isPending}
              onClick={handleFinish}
            >
              {finishMutation.isPending ? "Готовим отчет..." : "Завершить и перейти к отчету"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
