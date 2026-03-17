import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { sessionsApi } from "@/features/sessions/api/sessions.api";
import { useProfile } from "@/features/profiles/hooks/useProfiles";
import { formatDateTime } from "@/shared/lib/format";
import { Badge, Button, Card, ErrorState, Loader, PageHeader } from "@/shared/ui";

export function ProfileDetailsPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const profileQuery = useProfile(profileId);
  const createSession = useMutation({
    mutationFn: () => sessionsApi.create({ profileId: profileId! }),
    onSuccess: (session) => navigate(`/app/sessions/${session.id}`),
  });

  if (profileQuery.isLoading) {
    return <Loader />;
  }

  if (profileQuery.isError) {
    return <ErrorState error={profileQuery.error} retry={() => profileQuery.refetch()} />;
  }

  const profile = profileQuery.data;

  if (!profile) {
    return <Loader />;
  }

  return (
    <div className="grid">
      <Link className="ghost-link" to="/profiles">
        ← Назад к каталогу
      </Link>
      <Card>
        <PageHeader
          eyebrow={profile.direction}
          title={profile.title ?? "Профиль"}
          description={profile.description ?? "Описание профиля"}
          actions={
            <Button onClick={() => createSession.mutate()} disabled={createSession.isPending}>
              Начать собеседование
            </Button>
          }
        />
        <div className="tag-row">
          {profile.tags?.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          <Badge tone="accent">{profile.level ?? "—"}</Badge>
          <Badge tone="warning">{profile.status ?? "—"}</Badge>
        </div>
        <p className="muted" style={{ marginTop: "1rem" }}>
          Опубликовано: {formatDateTime(profile.publishedAt)}
        </p>
      </Card>
      <Card>
        <h2>Вопросы в сценарии</h2>
        <div className="list">
          {profile.questions?.map((item) => (
            <div key={item.id} className="list-item">
              <div>
                <strong>{item.questionText}</strong>
                <p className="muted">Тип: {item.questionType}</p>
              </div>
              <div className="inline-actions">
                <Badge>{`#${item.orderIndex}`}</Badge>
                {item.required ? <Badge tone="accent">Обязательный</Badge> : null}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
