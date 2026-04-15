import { useParams } from "react-router-dom";
import { useAdminUser } from "@/features/admin/hooks/useAdmin";
import { Badge, Card, ErrorState, Loader, PageHeader } from "@/shared/ui";

export function AdminUserDetailPage() {
  const { userId } = useParams();
  const query = useAdminUser(userId);

  if (query.isLoading) {
    return <Loader />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  }

  return (
    <div className="grid">
      <PageHeader eyebrow="Admin User" title={query.data?.email ?? "Пользователь"} />
      <Card>
        <div className="grid grid-2">
          <div>
            <p className="eyebrow">Email</p>
            <p>{query.data?.email ?? "—"}</p>
          </div>
          <div>
            <p className="eyebrow">Роль</p>
            <p>{query.data?.roleCode ?? "—"}</p>
          </div>
          <div>
            <p className="eyebrow">Имя</p>
            <p>{query.data?.firstName ?? "—"}</p>
          </div>
          <div>
            <p className="eyebrow">Фамилия</p>
            <p>{query.data?.lastName ?? "—"}</p>
          </div>
          <div>
            <p className="eyebrow">Статус</p>
            <Badge>{query.data?.status ?? "—"}</Badge>
          </div>
          <div>
            <p className="eyebrow">Предпочтительное направление</p>
            <p>{query.data?.preference?.preferredDirection ?? "—"}</p>
          </div>
          <div>
            <p className="eyebrow">Предпочтительный уровень</p>
            <p>{query.data?.preference?.preferredLevel ?? "—"}</p>
          </div>
          <div>
            <p className="eyebrow">Язык интервью</p>
            <p>{query.data?.preference?.preferredLanguage ?? "—"}</p>
          </div>
          <div>
            <p className="eyebrow">Язык интерфейса</p>
            <p>{query.data?.preference?.interfaceLanguage ?? "—"}</p>
          </div>
          <div>
            <p className="eyebrow">Тема</p>
            <p>{query.data?.preference?.theme ?? "—"}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
