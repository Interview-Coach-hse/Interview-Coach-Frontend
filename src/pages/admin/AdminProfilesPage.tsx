import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { InterviewDirection, InterviewLevel } from "@/api/generated/schema";
import type { ProfilesFilters } from "@/features/profiles/api/profiles.api";
import { useAdminProfiles } from "@/features/admin/hooks/useAdmin";
import { formatDateTime } from "@/shared/lib/format";
import { directionOptions, levelOptions } from "@/shared/lib/options";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { Badge, Button, Card, EmptyState, ErrorState, Input, Loader, PageHeader, Select } from "@/shared/ui";

export function AdminProfilesPage() {
  const [filters, setFilters] = useState<ProfilesFilters>({
    direction: "",
    level: "",
    query: "",
    tag: "",
    page: 0,
    size: 50,
  });
  const debouncedTag = useDebouncedValue(filters.tag ?? "");
  const debouncedQuery = useDebouncedValue(filters.query ?? "");
  const requestFilters = useMemo(
    () => ({
      ...filters,
      tag: debouncedTag,
      query: debouncedQuery,
    }),
    [debouncedQuery, debouncedTag, filters],
  );
  const query = useAdminProfiles(requestFilters);

  const profiles = query.data?.items ?? [];

  return (
    <div className="grid">
      <PageHeader
        eyebrow="Admin Content"
        title="Профили"
        actions={
          <Link to="/admin/profiles/new" className="btn btn-primary">
            Создать профиль
          </Link>
        }
      />
      <Card>
        <div className="filters">
          <Select
            label="Направление"
            options={directionOptions}
            value={filters.direction}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, direction: event.target.value as InterviewDirection | "", page: 0 }))
            }
          />
          <Select
            label="Уровень"
            options={levelOptions}
            value={filters.level}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, level: event.target.value as InterviewLevel | "", page: 0 }))
            }
          />
          <Input
            label="Тег"
            placeholder="Spring, SQL, REST"
            value={filters.tag}
            onChange={(event) => setFilters((prev) => ({ ...prev, tag: event.target.value, page: 0 }))}
          />
          <Input
            label="Поиск"
            placeholder="По названию и описанию"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value, page: 0 }))}
          />
          <Button
            variant="secondary"
            type="button"
            onClick={() => setFilters({ direction: "", level: "", query: "", tag: "", page: 0, size: 50 })}
          >
            Сбросить
          </Button>
        </div>
      </Card>
      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState error={query.error} retry={() => query.refetch()} /> : null}
      <div className="list">
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <div className="list-item">
              <div>
                <p className="eyebrow">{profile.direction}</p>
                <h3>{profile.title}</h3>
                <p className="muted">{profile.description}</p>
                <p className="muted">
                  Вопросов: {profile.questions?.length ?? 0}
                  {profile.publishedAt ? ` • Опубликовано: ${formatDateTime(profile.publishedAt)}` : ""}
                </p>
                <div className="tag-row">
                  {profile.tags?.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="inline-actions">
                <Badge tone="accent">{profile.level ?? "—"}</Badge>
                <Badge>{profile.status ?? "—"}</Badge>
                <Link className="ghost-link" to={`/admin/profiles/${profile.id}/edit`}>
                  Редактировать
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {!profiles.length ? (
        <EmptyState title="Профили не найдены" description="Попробуйте ослабить фильтры или изменить запрос." />
      ) : null}
    </div>
  );
}
