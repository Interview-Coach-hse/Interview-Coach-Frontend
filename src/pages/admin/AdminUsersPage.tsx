import { Link } from "react-router-dom";
import { useAdminUsers } from "@/features/admin/hooks/useAdmin";
import { Badge, Card, ErrorState, Loader, PageHeader } from "@/shared/ui";

export function AdminUsersPage() {
  const query = useAdminUsers({});

  if (query.isLoading) {
    return <Loader />;
  }

  if (query.isError) {
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  }

  return (
    <div className="grid">
      <PageHeader eyebrow="Admin Zone" title="Пользователи" />
      <Card>
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {query.data?.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.roleCode}</td>
                <td><Badge>{user.status ?? "—"}</Badge></td>
                <td>
                  <Link className="ghost-link" to={`/admin/users/${user.id}`}>
                    Открыть
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
