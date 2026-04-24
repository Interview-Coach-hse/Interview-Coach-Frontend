import { ReportItemType, ReportStatus, ScoreSource, type ReportItemResponse, type ReportResponse } from "@/api/generated/schema";
import { Badge, Card, EmptyState, Loader } from "@/shared/ui";

type SessionReportSummaryProps = {
  report?: ReportResponse;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

function formatReportScore(value?: number | null) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${Math.round(value)}`;
}

function getScoreSourceLabel(source?: ScoreSource | null) {
  if (source === ScoreSource.Ai) {
    return "AI assessment";
  }

  if (source === ScoreSource.Fallback) {
    return "Local fallback";
  }

  return "Unknown source";
}

function getScoreSourceTone(source?: ScoreSource | null): "accent" | "warning" | "default" {
  if (source === ScoreSource.Ai) {
    return "accent";
  }

  if (source === ScoreSource.Fallback) {
    return "warning";
  }

  return "default";
}

function sortReportItems(items?: ReportItemResponse[]) {
  return [...(items ?? [])].sort((left, right) => (left.sortOrder ?? Number.MAX_SAFE_INTEGER) - (right.sortOrder ?? Number.MAX_SAFE_INTEGER));
}

export function SessionReportSummary({ report, isLoading, isError, onRetry }: SessionReportSummaryProps) {
  if (isLoading || report?.status === ReportStatus.Pending) {
    return (
      <Card>
        <Loader label="Генерируем отчёт..." />
      </Card>
    );
  }

  if (isError || report?.status === ReportStatus.Failed) {
    return (
      <Card>
        <EmptyState
          title="Не удалось сформировать отчёт"
          description="Попробуйте обновить данные ещё раз. Если проблема повторится, значит backend не смог собрать финальный анализ."
          action={onRetry ? { label: "Обновить", onClick: onRetry } : undefined}
        />
      </Card>
    );
  }

  const items = sortReportItems(report?.items);
  const categoryScores = items.filter((item) => item.itemType === ReportItemType.CategoryScore);
  const strengths = items.filter((item) => item.itemType === ReportItemType.Strength);
  const weaknesses = items.filter((item) => item.itemType === ReportItemType.Weakness);
  const recommendations = items.filter((item) => item.itemType === ReportItemType.Recommendation);

  return (
    <div className="grid">
      <div className="grid grid-2">
        <Card>
          <div className="inline-actions" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <p className="muted" style={{ marginBottom: "0.35rem" }}>Итоговый балл</p>
              <h3 style={{ marginBottom: 0 }}>Session score</h3>
            </div>
            <Badge tone={getScoreSourceTone(report?.scoreSource)}>{getScoreSourceLabel(report?.scoreSource)}</Badge>
          </div>
          <div className="score-ring" style={{ ["--score" as string]: String(Math.max(0, Math.min(report?.overallScore ?? 0, 100))) }}>
            <span>{formatReportScore(report?.overallScore)}</span>
          </div>
        </Card>
        <Card>
          <p className="muted">Статус отчета</p>
          <Badge tone={report?.status === ReportStatus.Ready ? "success" : "warning"}>{report?.status ?? ReportStatus.Pending}</Badge>
          <p style={{ marginTop: "1rem" }}>
            {report?.summaryText ?? "Промежуточный результат пока недоступен. Обновим экран, как только backend соберет отчет."}
          </p>
          {report?.scoreSource === ScoreSource.Fallback ? (
            <div className="report-hint">
              Отчёт собран в локальном режиме. Детализация может быть менее точной.
            </div>
          ) : null}
        </Card>
      </div>
      <Card>
        <h3>Критерии оценки</h3>
        {categoryScores.length ? (
          <div className="report-metrics">
            {categoryScores.map((item) => {
              const score = Math.max(0, Math.min(item.score ?? 0, 100));

              return (
                <div key={`${item.title}-${item.sortOrder}`} className="report-metric">
                  <div className="report-metric-head">
                    <strong>{item.title ?? "Критерий"}</strong>
                    <span>{formatReportScore(item.score)}</span>
                  </div>
                  <div className="report-metric-bar">
                    <span style={{ width: `${score}%` }} />
                  </div>
                  <p className="muted">{item.content ?? "Комментарий по критерию недоступен."}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted">Детализация по критериям пока недоступна.</p>
        )}
      </Card>
      <div className="grid grid-3">
        <Card>
          <h3>Сильные стороны</h3>
          {strengths.length ? strengths.map((item) => <p key={`${item.title}-${item.sortOrder}`}>{item.title}: {item.content}</p>) : <p className="muted">Пока нет данных.</p>}
        </Card>
        <Card>
          <h3>Слабые стороны</h3>
          {weaknesses.length ? weaknesses.map((item) => <p key={`${item.title}-${item.sortOrder}`}>{item.title}: {item.content}</p>) : <p className="muted">Пока нет данных.</p>}
        </Card>
        <Card>
          <h3>Рекомендации</h3>
          {recommendations.length ? recommendations.map((item) => <p key={`${item.title}-${item.sortOrder}`}>{item.title}: {item.content}</p>) : <p className="muted">Пока нет данных.</p>}
        </Card>
      </div>
    </div>
  );
}
