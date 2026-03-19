import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { sessionsApi } from "@/features/sessions/api/sessions.api";
import { authStore } from "@/features/auth/hooks/auth-store";
import { useProfile } from "@/features/profiles/hooks/useProfiles";
import { HttpError } from "@/shared/lib/error";
import { formatDateTime } from "@/shared/lib/format";
import { Badge, Button, Card, ErrorState, Loader, PageHeader } from "@/shared/ui";

export function ProfileDetailsPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const tokens = authStore((state) => state.tokens);
  const [showAuthNotice, setShowAuthNotice] = useState(false);
  const profileQuery = useProfile(profileId);
  const createSession = useMutation({
    mutationFn: () => sessionsApi.create({ profileId: profileId! }),
    onSuccess: (session) => navigate(`/app/sessions/${session.id}`),
    onError: (error) => {
      if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
        setShowAuthNotice(true);
      }
    },
  });
  const isAuthenticated = Boolean(tokens?.accessToken);
  const isAuthError =
    createSession.error instanceof HttpError
    && (createSession.error.status === 401 || createSession.error.status === 403);
  const shouldShowAuthNotice = showAuthNotice || isAuthError;

  useEffect(() => {
    if (!shouldShowAuthNotice) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowAuthNotice(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [shouldShowAuthNotice]);

  const handleStartInterview = () => {
    if (!isAuthenticated) {
      setShowAuthNotice(true);
      return;
    }

    createSession.mutate();
  };

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
      <Link className="ghost-link" to=".." relative="path">
        ← Назад к каталогу
      </Link>
      <Card>
        <PageHeader
          eyebrow={profile.direction}
          title={profile.title ?? "Профиль"}
          description={profile.description ?? "Описание профиля"}
          actions={
            <Button onClick={handleStartInterview} disabled={createSession.isPending}>
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
      {createSession.isError && !isAuthError ? (
        <ErrorState error={createSession.error} retry={handleStartInterview} />
      ) : null}
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
      {shouldShowAuthNotice ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowAuthNotice(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" aria-label="Закрыть" onClick={() => setShowAuthNotice(false)}>
              ×
            </button>
            <p className="eyebrow">Требуется регистрация</p>
            <h3 id="auth-modal-title">Чтобы начать собеседование, нужно создать аккаунт.</h3>
            <p className="muted">После регистрации вы сможете запускать сессии и сохранять историю прогресса.</p>
            <div className="inline-actions">
              <Link to="/register" className="btn btn-primary" onClick={() => setShowAuthNotice(false)}>
                Зарегистрироваться
              </Link>
              <Link to="/login" className="btn btn-secondary" onClick={() => setShowAuthNotice(false)}>
                Войти
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
