import { ScoreSource, type ProgressResponse } from "@/api/generated/schema";
import { formatDateTime } from "@/shared/lib/format";
import { Badge, Card } from "@/shared/ui";

type ScoreTrendPoint = NonNullable<ProgressResponse["scoreTrend"]>[number];

type ProgressTrendChartProps = {
  data?: ProgressResponse;
};

const WIDTH = 880;
const HEIGHT = 280;
const PADDING_X = 28;
const PADDING_Y = 26;

function getPointTone(scoreSource?: ScoreSource | null) {
  return scoreSource === ScoreSource.Fallback ? "warning" : "accent";
}

function buildPath(points: { x: number; y: number }[]) {
  if (!points.length) {
    return "";
  }

  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function getTrendLabel(points: ScoreTrendPoint[]) {
  if (points.length < 2) {
    return "Недостаточно данных";
  }

  const firstScore = points[0]?.score ?? 0;
  const lastScore = points.at(-1)?.score ?? 0;
  const delta = lastScore - firstScore;

  if (delta > 0) {
    return `Рост +${Math.round(delta)}`;
  }

  if (delta < 0) {
    return `Снижение ${Math.round(delta)}`;
  }

  return "Без изменений";
}

function getAverageScore(points: ScoreTrendPoint[]) {
  const scoredPoints = points.filter((point) => point.score !== null && point.score !== undefined);

  if (!scoredPoints.length) {
    return "—";
  }

  const total = scoredPoints.reduce((sum, point) => sum + (point.score ?? 0), 0);
  return `${Math.round(total / scoredPoints.length)}`;
}

function mapPoints(points: ScoreTrendPoint[]) {
  const values = points.map((point) => point.score ?? 0);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);
  const span = Math.max(max - min, 1);

  return points.map((point, index) => {
    const x = points.length === 1
      ? WIDTH / 2
      : PADDING_X + ((WIDTH - PADDING_X * 2) * index) / Math.max(points.length - 1, 1);
    const y = HEIGHT - PADDING_Y - (((point.score ?? 0) - min) / span) * (HEIGHT - PADDING_Y * 2);

    return { ...point, x, y };
  });
}

export function ProgressTrendChart({ data }: ProgressTrendChartProps) {
  const points = [...(data?.scoreTrend ?? [])].sort((left, right) =>
    new Date(left.createdAt ?? 0).getTime() - new Date(right.createdAt ?? 0).getTime(),
  );

  if (!points.length) {
    return (
      <Card>
        <h2>График прогресса</h2>
        <p className="muted">Пока недостаточно данных, чтобы построить динамику по завершённым попыткам.</p>
      </Card>
    );
  }

  const chartPoints = mapPoints(points);
  const latest = points.at(-1);

  return (
    <Card>
      <div className="split-header" style={{ marginBottom: "1rem" }}>
        <div>
          <h2>График прогресса</h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            Средний балл: {getAverageScore(points)} • Последний результат: {latest?.score ?? "—"} • Тренд: {getTrendLabel(points)}
          </p>
        </div>
        <div className="inline-actions">
          <Badge tone="accent">AI</Badge>
          <Badge tone="warning">Fallback</Badge>
        </div>
      </div>
      <div className="progress-chart-shell">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="progress-chart" role="img" aria-label="График прогресса по сессиям">
          <path d={`M ${PADDING_X} ${HEIGHT - PADDING_Y} L ${WIDTH - PADDING_X} ${HEIGHT - PADDING_Y}`} className="progress-chart-axis" />
          {chartPoints.length > 1 ? (
            <path d={buildPath(chartPoints)} className="progress-chart-line" />
          ) : null}
          {chartPoints.map((point) => (
            <circle
              key={`${point.sessionId}-${point.createdAt}`}
              cx={point.x}
              cy={point.y}
              r={6}
              className={`progress-chart-point progress-chart-point-${point.scoreSource === ScoreSource.Fallback ? "fallback" : "ai"}`}
            >
              <title>
                {[
                  formatDateTime(point.createdAt),
                  `Балл: ${point.score ?? "—"}`,
                  `Направление: ${point.direction ?? "—"}`,
                  `Уровень: ${point.level ?? "—"}`,
                  `Источник: ${point.scoreSource ?? "—"}`,
                ].join("\n")}
              </title>
            </circle>
          ))}
        </svg>
      </div>
      <div className="progress-chart-labels">
        {points.map((point) => (
          <div key={`${point.sessionId}-label`} className="progress-chart-label">
            <span>{formatDateTime(point.createdAt)}</span>
            <Badge tone={getPointTone(point.scoreSource)}>{point.score !== null && point.score !== undefined ? String(point.score) : "—"}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
