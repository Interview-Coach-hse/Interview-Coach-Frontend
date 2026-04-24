import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScoreSource, type ProgressResponse } from "@/api/generated/schema";
import { formatDateTime } from "@/shared/lib/format";
import { Badge, Card } from "@/shared/ui";

type ScoreTrendPoint = NonNullable<ProgressResponse["scoreTrend"]>[number];

type ProgressTrendChartProps = {
  data?: ProgressResponse;
};

const WIDTH = 880;
const HEIGHT = 280;
const PADDING_LEFT = 72;
const PADDING_RIGHT = 32;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 44;

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
      : PADDING_LEFT + ((WIDTH - PADDING_LEFT - PADDING_RIGHT) * index) / Math.max(points.length - 1, 1);
    const y = HEIGHT - PADDING_BOTTOM - (((point.score ?? 0) - min) / span) * (HEIGHT - PADDING_TOP - PADDING_BOTTOM);

    return { ...point, x, y };
  });
}

export function ProgressTrendChart({ data }: ProgressTrendChartProps) {
  const navigate = useNavigate();
  const [activePoint, setActivePoint] = useState<(ScoreTrendPoint & { x: number; y: number }) | null>(null);
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
  const tooltipPlacement = activePoint && activePoint.y < HEIGHT * 0.38 ? "below" : "above";
  const tooltipAlign =
    activePoint && activePoint.x < WIDTH * 0.2
      ? "left"
      : activePoint && activePoint.x > WIDTH * 0.8
        ? "right"
        : "center";

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
          <path d={`M ${PADDING_LEFT} ${HEIGHT - PADDING_BOTTOM} L ${WIDTH - PADDING_RIGHT} ${HEIGHT - PADDING_BOTTOM}`} className="progress-chart-axis" />
          <path d={`M ${PADDING_LEFT} ${PADDING_TOP} L ${PADDING_LEFT} ${HEIGHT - PADDING_BOTTOM}`} className="progress-chart-axis" />
          <text x={WIDTH / 2} y={HEIGHT - 10} textAnchor="middle" className="progress-chart-axis-label">
            Дата
          </text>
          <text
            x={20}
            y={HEIGHT / 2}
            textAnchor="middle"
            transform={`rotate(-90 20 ${HEIGHT / 2})`}
            className="progress-chart-axis-label"
          >
            Балл
          </text>
          {chartPoints.length > 1 ? (
            <path d={buildPath(chartPoints)} className="progress-chart-line" />
          ) : null}
          {[0, 50, 100].map((score) => {
            const y = HEIGHT - PADDING_BOTTOM - (score / 100) * (HEIGHT - PADDING_TOP - PADDING_BOTTOM);

            return (
              <g key={score}>
                <path d={`M ${PADDING_LEFT} ${y} L ${WIDTH - PADDING_RIGHT} ${y}`} className="progress-chart-grid" />
                <text x={PADDING_LEFT - 12} y={y + 4} textAnchor="end" className="progress-chart-tick">
                  {score}
                </text>
              </g>
            );
          })}
          {chartPoints.map((point) => (
            <circle
              key={`${point.sessionId}-${point.createdAt}`}
              cx={point.x}
              cy={point.y}
              r={6}
              className={`progress-chart-point progress-chart-point-${point.scoreSource === ScoreSource.Fallback ? "fallback" : "ai"}`}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setActivePoint(point)}
              onMouseLeave={() => setActivePoint((current) => (current?.sessionId === point.sessionId ? null : current))}
              onFocus={() => setActivePoint(point)}
              onBlur={() => setActivePoint((current) => (current?.sessionId === point.sessionId ? null : current))}
              onClick={() => {
                if (point.sessionId) {
                  navigate(`/app/history/${point.sessionId}`);
                }
              }}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && point.sessionId) {
                  event.preventDefault();
                  navigate(`/app/history/${point.sessionId}`);
                }
              }}
            />
          ))}
        </svg>
        {activePoint ? (
          <div
            className={`progress-chart-tooltip progress-chart-tooltip-${tooltipPlacement} progress-chart-tooltip-${tooltipAlign}`}
            style={{
              left: `${(activePoint.x / WIDTH) * 100}%`,
              top: `${(activePoint.y / HEIGHT) * 100}%`,
            }}
          >
            <strong>{formatDateTime(activePoint.createdAt)}</strong>
            <span>Балл: {activePoint.score ?? "—"}</span>
            <span>Уровень: {activePoint.level ?? "—"}</span>
            <span>Направление: {activePoint.direction ?? "—"}</span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
