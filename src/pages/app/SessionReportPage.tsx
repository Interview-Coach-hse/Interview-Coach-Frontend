import { useParams } from "react-router-dom";
import { useSessionReport } from "@/features/sessions/hooks/useSessionReport";
import { formatScore } from "@/shared/lib/format";
import { Badge, Card, ErrorState, Loader, PageHeader } from "@/shared/ui";

export function SessionReportPage() {
  const { sessionId } = useParams();
  const reportQuery = useSessionReport(sessionId);

  if (reportQuery.isLoading) {
    return <Loader label="Получаем отчет..." />;
  }

  if (reportQuery.isError) {
    return <ErrorState error={reportQuery.error} retry={() => reportQuery.refetch()} />;
  }

  const report = reportQuery.data;
  const strengths = report?.items?.filter((item) => item.itemType === "STRENGTH") ?? [];
  const weaknesses = report?.items?.filter((item) => item.itemType === "WEAKNESS") ?? [];
  const recommendations = report?.items?.filter((item) => item.itemType === "RECOMMENDATION") ?? [];

  return (
    <div className="grid">
      <PageHeader eyebrow="AI Feedback" title="Отчет по сессии" description={report?.summaryText ?? "Отчет формируется на backend."} />
      <div className="grid grid-2">
        <Card>
          <div className="score-ring" style={{ ["--score" as string]: String((report?.overallScore ?? 0) * 10) }}>
            <span>{formatScore(report?.overallScore)}</span>
          </div>
        </Card>
        <Card>
          <p className="muted">Статус отчета</p>
          <Badge tone={report?.status === "READY" ? "success" : "warning"}>{report?.status ?? "PENDING"}</Badge>
          <p style={{ marginTop: "1rem" }}>{report?.summaryText ?? "TODO: backend не уточняет более детальную breakdown-структуру score cards."}</p>
        </Card>
      </div>
      <div className="grid grid-3">
        <Card>
          <h3>Сильные стороны</h3>
          {strengths.map((item) => (
            <p key={item.title}>{item.title}: {item.content}</p>
          ))}
        </Card>
        <Card>
          <h3>Слабые стороны</h3>
          {weaknesses.map((item) => (
            <p key={item.title}>{item.title}: {item.content}</p>
          ))}
        </Card>
        <Card>
          <h3>Рекомендации</h3>
          {recommendations.map((item) => (
            <p key={item.title}>{item.title}: {item.content}</p>
          ))}
        </Card>
      </div>
    </div>
  );
}
