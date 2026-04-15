import { useState } from "react";
import { Link } from "react-router-dom";
import { SessionState } from "@/api/generated/schema";
import type { HistoryFilters } from "@/features/sessions/api/sessions.api";
import { useHistory } from "@/features/sessions/hooks/useSession";
import { formatDateTime, formatDuration } from "@/shared/lib/format";
import { sessionStateOptions } from "@/shared/lib/options";
import { Badge, Button, Card, ErrorState, Loader, PageHeader, Input, Select } from "@/shared/ui";

export function HistoryPage() {
  const [filters, setFilters] = useState<HistoryFilters>({
    state: "",
    profileId: "",
    createdFrom: "",
    createdTo: "",
    page: 0,
    size: 20,
  });
  const query = useHistory(filters);

  const getSessionLink = (sessionId?: string, state?: SessionState) => {
    if (!sessionId) {
      return "/app/history";
    }

    if (
      state === SessionState.Created ||
      state === SessionState.InProgress ||
      state === SessionState.Paused
    ) {
      return `/app/sessions/${sessionId}`;
    }

    return `/app/history/${sessionId}`;
  };

  return (
    <div className="grid">
      <PageHeader eyebrow="Session Archive" title="История сессий" />
      <Card>
        <div className="filters">
          <Select
            label="Статус"
            options={sessionStateOptions}
            value={filters.state}
            onChange={(event) => setFilters((prev) => ({ ...prev, state: event.target.value as SessionState | "" }))}
          />
          <Input
            label="Profile ID"
            value={filters.profileId}
            onChange={(event) => setFilters((prev) => ({ ...prev, profileId: event.target.value }))}
          />
          <Input
            label="С"
            type="datetime-local"
            value={filters.createdFrom}
            onChange={(event) => setFilters((prev) => ({ ...prev, createdFrom: event.target.value }))}
          />
          <Input
            label="По"
            type="datetime-local"
            value={filters.createdTo}
            onChange={(event) => setFilters((prev) => ({ ...prev, createdTo: event.target.value }))}
          />
        </div>
      </Card>
      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState error={query.error} retry={() => query.refetch()} /> : null}
      {query.data?.items?.map((session) => (
        <Card key={session.id}>
          <div className="list-item">
            <div>
              <h3>{session.profileTitle}</h3>
              <p className="muted">{formatDateTime(session.startedAt ?? session.finishedAt)}</p>
              <p className="muted">Длительность: {formatDuration(session.durationSeconds)}</p>
            </div>
            <div className="inline-actions">
              <Badge tone="accent">{session.state ?? "—"}</Badge>
              <Link to={getSessionLink(session.id, session.state)} className="btn btn-secondary">
                Открыть
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
