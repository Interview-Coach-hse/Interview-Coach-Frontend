import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { InterviewDirection, InterviewLevel, SessionState } from "@/api/generated/schema";
import { useProgress } from "@/features/progress/hooks/useProgress";
import { ProgressTrendChart } from "@/features/progress/ui/ProgressTrendChart";
import { useHistory } from "@/features/sessions/hooks/useSession";
import { formatDateTime, formatDuration } from "@/shared/lib/format";
import { directionOptions, levelOptions } from "@/shared/lib/options";
import { Badge, Button, Card, ErrorState, Input, Loader, PageHeader, Select } from "@/shared/ui";

type SessionInsightsViewProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

function getSessionLink(sessionId?: string, state?: SessionState) {
  if (!sessionId) {
    return "/app/history";
  }

  if (state === SessionState.Created || state === SessionState.InProgress || state === SessionState.Paused) {
    return `/app/sessions/${sessionId}`;
  }

  return `/app/history/${sessionId}`;
}

export function SessionInsightsView({ eyebrow, title, description, actions }: SessionInsightsViewProps) {
  const [sharedFilters, setSharedFilters] = useState({
    createdFrom: "",
    createdTo: "",
    direction: "" as InterviewDirection | "",
    level: "" as InterviewLevel | "",
  });
  const [historyFilters, setHistoryFilters] = useState({
    page: 0,
    size: 20,
  });

  const progressQuery = useProgress(sharedFilters);
  const historyQuery = useHistory({
    ...sharedFilters,
    ...historyFilters,
  });

  const updateSharedFilters = (patch: Partial<typeof sharedFilters>) => {
    setSharedFilters((prev) => ({ ...prev, ...patch }));
    setHistoryFilters((prev) => ({ ...prev, page: 0 }));
  };

  const updateHistoryFilters = (patch: Partial<typeof historyFilters>) => {
    setHistoryFilters((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="grid">
      <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      <Card>
        <div className="filters filters-grid">
          <Input
            label="С"
            type="datetime-local"
            value={sharedFilters.createdFrom}
            onChange={(event) => updateSharedFilters({ createdFrom: event.target.value })}
          />
          <Input
            label="По"
            type="datetime-local"
            value={sharedFilters.createdTo}
            onChange={(event) => updateSharedFilters({ createdTo: event.target.value })}
          />
          <Select
            label="Направление"
            options={directionOptions}
            value={sharedFilters.direction}
            onChange={(event) => updateSharedFilters({ direction: event.target.value as InterviewDirection | "" })}
          />
          <Select
            label="Уровень"
            options={levelOptions}
            value={sharedFilters.level}
            onChange={(event) => updateSharedFilters({ level: event.target.value as InterviewLevel | "" })}
          />
        </div>
      </Card>
      {progressQuery.isLoading && !progressQuery.data ? <Loader label="Загружаем прогресс..." /> : null}
      {progressQuery.isError ? <ErrorState error={progressQuery.error} retry={() => progressQuery.refetch()} /> : null}
      {!progressQuery.isError ? <ProgressTrendChart data={progressQuery.data} /> : null}
      <Card>
        <div className="split-header" style={{ marginBottom: "1rem" }}>
          <div>
            <h2>История сессий</h2>
            <p className="muted" style={{ marginBottom: 0 }}>
              Выберите сессию, чтобы открыть её детали и встроенный отчёт.
            </p>
          </div>
          <div className="inline-actions">
            <Button
              type="button"
              variant="secondary"
              disabled={(historyFilters.page ?? 0) === 0}
              onClick={() => updateHistoryFilters({ page: Math.max((historyFilters.page ?? 0) - 1, 0) })}
            >
              Назад
            </Button>
            <Badge>{`Страница ${(historyQuery.data?.page ?? historyFilters.page) + 1} / ${Math.max(historyQuery.data?.totalPages ?? 1, 1)}`}</Badge>
            <Button
              type="button"
              variant="secondary"
              disabled={(historyFilters.page ?? 0) >= Math.max((historyQuery.data?.totalPages ?? 1) - 1, 0)}
              onClick={() => updateHistoryFilters({ page: (historyFilters.page ?? 0) + 1 })}
            >
              Вперёд
            </Button>
          </div>
        </div>
        {historyQuery.isLoading && !historyQuery.data ? <Loader label="Загружаем историю..." /> : null}
        {historyQuery.isError ? <ErrorState error={historyQuery.error} retry={() => historyQuery.refetch()} /> : null}
        <div className="list">
          {historyQuery.data?.items?.map((session) => (
            <div key={session.id} className="session-history-card">
              <div className="session-history-card-copy">
                <h3>{session.profileTitle ?? "Сессия"}</h3>
                <p className="muted">
                  {[session.directionSnapshot, session.levelSnapshot].filter(Boolean).join(" • ") || "Снимок профиля недоступен"}
                </p>
                <p className="muted">Старт: {formatDateTime(session.startedAt)}</p>
                <p className="muted">Финиш: {formatDateTime(session.finishedAt)}</p>
                <p className="muted">Длительность: {formatDuration(session.durationSeconds)}</p>
              </div>
              <div className="session-history-card-actions">
                <Badge tone={session.state === SessionState.Finished ? "success" : session.state === SessionState.Failed ? "danger" : "accent"}>
                  {session.state ?? "—"}
                </Badge>
                <Link to={getSessionLink(session.id, session.state)} className="btn btn-secondary">
                  Открыть
                </Link>
              </div>
            </div>
          ))}
          {!historyQuery.isLoading && !historyQuery.data?.items?.length ? (
            <p className="muted">По текущим фильтрам сессии не найдены.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
