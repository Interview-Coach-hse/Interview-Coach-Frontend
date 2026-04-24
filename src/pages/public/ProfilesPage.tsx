import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ProfilesFilters } from "@/features/profiles/api/profiles.api";
import { useCatalogs } from "@/features/catalogs/hooks/useCatalogs";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { Badge, Button, Card, EmptyState, ErrorState, Input, Loader, PageHeader, Select } from "@/shared/ui";

export function ProfilesPage() {
  const { directionOptions, levelOptions, isLoading: catalogsLoading, isError: catalogsError, error: catalogsErrorValue, getDirectionName, getLevelName } = useCatalogs();
  const [filters, setFilters] = useState<ProfilesFilters>({
    direction: "",
    level: "",
    query: "",
    tag: "",
    page: 0,
    size: 12,
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
  const query = useProfiles(requestFilters);

  if (catalogsLoading) {
    return <Loader />;
  }

  if (catalogsError) {
    return <ErrorState error={catalogsErrorValue} retry={() => window.location.reload()} />;
  }

  return (
    <div className="grid">
      <PageHeader
        eyebrow="Interview Simulator"
        title="Каталог сценариев"
        description=""
      />
      <Card>
        <div className="filters">
          <Select
            label="Роль"
            options={directionOptions}
            value={filters.direction}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, direction: event.target.value }))
            }
          />
          <Select
            label="Уровень"
            options={levelOptions}
            value={filters.level}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, level: event.target.value }))
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
                  <p className="eyebrow">{getDirectionName(profile.direction)}</p>
                  <h2>{profile.title}</h2>
                  <p className="muted">{profile.description}</p>
                  <div className="tag-row">
                    {profile.tags?.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="inline-actions">
                  <Badge tone="accent">{getLevelName(profile.level)}</Badge>
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
