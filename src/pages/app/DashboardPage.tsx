import { Link } from "react-router-dom";
import { useProgress } from "@/features/progress/hooks/useProgress";
import { useHistory } from "@/features/sessions/hooks/useSession";
import { formatDateTime, formatScore } from "@/shared/lib/format";
import { Badge, Card, ErrorState, Loader, PageHeader } from "@/shared/ui";

export function DashboardPage() {
  const progressQuery = useProgress();
  const historyQuery = useHistory({ page: 0, size: 5 });

  if (progressQuery.isLoading || historyQuery.isLoading) {
    return <Loader />;
  }

  if (progressQuery.isError) {
    return <ErrorState error={progressQuery.error} retry={() => progressQuery.refetch()} />;
  }

  return (
    <div className="grid">
      <PageHeader
        eyebrow="Личный кабинет"
        title="Дашборд прогресса"
        description="Метрики из `/progress`, быстрый доступ к истории и активным сценариям."
        actions={<Link to="/app/profiles" className="btn btn-primary">Новая тренировка</Link>}
      />
      <div className="metrics">
        <Card>
          <p className="muted">Всего сессий</p>
          <div className="metric-value">{progressQuery.data?.totalSessions ?? 0}</div>
        </Card>
        <Card>
          <p className="muted">Завершено</p>
          <div className="metric-value">{progressQuery.data?.finishedSessions ?? 0}</div>
        </Card>
        <Card>
          <p className="muted">Средний score</p>
          <div className="metric-value">{formatScore(progressQuery.data?.averageScore)}</div>
        </Card>
        <Card>
          <p className="muted">Готовых отчетов</p>
          <div className="metric-value">{progressQuery.data?.reportsReady ?? 0}</div>
        </Card>
      </div>
      <Card>
        <h2>Последние сессии</h2>
        <div className="list">
          {historyQuery.data?.items?.map((session) => (
            <div key={session.id} className="list-item">
              <div>
                <strong>{session.profileTitle}</strong>
                <p className="muted">{formatDateTime(session.startedAt ?? session.finishedAt)}</p>
              </div>
              <div className="inline-actions">
                <Badge tone="accent">{session.state ?? "—"}</Badge>
                <Link to={`/app/history/${session.id}`} className="btn btn-secondary">
                  Открыть
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
