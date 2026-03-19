import { useState } from "react";
import { Link } from "react-router-dom";
import { InterviewDirection, InterviewLevel } from "@/api/generated/schema";
import type { ProfilesFilters } from "@/features/profiles/api/profiles.api";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import { directionOptions, levelOptions } from "@/shared/lib/options";
import { Badge, Button, Card, EmptyState, ErrorState, Input, Loader, PageHeader, Select } from "@/shared/ui";

export function ProfilesPage() {
  const [filters, setFilters] = useState<ProfilesFilters>({
    direction: "",
    level: "",
    query: "",
    tag: "",
    page: 0,
    size: 12,
  });
  const query = useProfiles(filters);

  return (
    <div className="grid">
      <PageHeader
        eyebrow="Interview Simulator"
        title="Каталог сценариев"
        description="Подбирайте профиль по роли, уровню и темам."
      />
      <Card>
        <div className="filters">
          <Select
            label="Роль"
            options={directionOptions}
            value={filters.direction}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, direction: event.target.value as InterviewDirection | "" }))
            }
          />
          <Select
            label="Уровень"
            options={levelOptions}
            value={filters.level}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, level: event.target.value as InterviewLevel | "" }))
            }
          />
          <Input
            label="Тематика"
            placeholder="Spring, SQL, REST"
            value={filters.tag}
            onChange={(event) => setFilters((prev) => ({ ...prev, tag: event.target.value }))}
          />
          <Input
            label="Поиск"
            placeholder="По названию и описанию"
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          />
          <Button variant="secondary" onClick={() => setFilters({ direction: "", level: "", query: "", tag: "", page: 0, size: 12 })}>
            Сбросить
          </Button>
        </div>
      </Card>
      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState error={query.error} retry={() => query.refetch()} /> : null}
      {query.data?.items?.length ? (
        <div className="list">
          {query.data.items.map((profile) => (
            <Card key={profile.id}>
              <div className="list-item">
                <div>
                  <p className="eyebrow">{profile.direction}</p>
                  <h2>{profile.title}</h2>
                  <p className="muted">{profile.description}</p>
                  <div className="tag-row">
                    {profile.tags?.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="inline-actions">
                  <Badge tone="accent">{profile.level ?? "—"}</Badge>
                  <Link to={profile.id ?? ""} className="btn btn-primary">
                    Открыть
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      {!query.isLoading && !query.data?.items?.length ? (
        <EmptyState title="Профили не найдены" description="Попробуйте ослабить фильтры или изменить запрос." />
      ) : null}
    </div>
  );
}
