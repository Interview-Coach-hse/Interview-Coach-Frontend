import { SessionInsightsView } from "@/features/sessions/ui/SessionInsightsView";

export function HistoryPage() {
  return (
    <SessionInsightsView
      eyebrow="Session Archive"
      title="История сессий"
      description="Сначала фильтруем период и срез, потом анализируем динамику и открываем нужную сессию."
    />
  );
}
