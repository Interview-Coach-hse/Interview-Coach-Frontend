import { Link } from "react-router-dom";
import { useProfiles } from "@/features/profiles/hooks/useProfiles";
import { Badge, Card, ErrorState, Loader, PageHeader } from "@/shared/ui";

export function AdminProfilesPage() {
  const query = useProfiles({ page: 0, size: 50 });

  if (query.isLoading) {
    return <Loader />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  }

  return (
    <div className="grid">
      <PageHeader eyebrow="Admin Content" title="Профили" />
      <div className="list">
        {query.data?.items?.map((profile) => (
          <Card key={profile.id}>
            <div className="list-item">
              <div>
                <h3>{profile.title}</h3>
                <p className="muted">{profile.description}</p>
              </div>
              <div className="inline-actions">
                <Badge>{profile.status ?? "—"}</Badge>
                <Link className="ghost-link" to={`/admin/profiles/${profile.id}/edit`}>
                  Редактировать
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
