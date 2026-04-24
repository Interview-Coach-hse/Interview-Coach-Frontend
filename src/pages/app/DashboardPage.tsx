import { Link } from "react-router-dom";
import { SessionInsightsView } from "@/features/sessions/ui/SessionInsightsView";

export function DashboardPage() {
  return (
    <SessionInsightsView
      eyebrow="Личный кабинет"
      title="Дашборд прогресса"
      description=""
      actions={<Link to="/app/profiles" className="btn btn-primary">Новая тренировка</Link>}
    />
  );
}
