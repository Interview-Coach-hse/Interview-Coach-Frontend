import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { normalizeError } from "@/shared/lib/error";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

export function RouteErrorBoundary() {
  const routeError = useRouteError();

  const normalized = isRouteErrorResponse(routeError)
    ? normalizeError(new Error(routeError.statusText || routeError.data?.message || "Маршрут недоступен"))
    : normalizeError(routeError);

  return (
    <div className="state route-error-state">
      <Card>
        <p className="eyebrow">Что-то пошло не так</p>
        <h2>{normalized.title}</h2>
        <p className="muted">{normalized.message}</p>
        <div className="inline-actions" style={{ justifyContent: "center", marginTop: "1rem" }}>
          <Button type="button" onClick={() => window.location.reload()}>
            Обновить страницу
          </Button>
          <Link to="/app/dashboard" className="btn btn-secondary">
            На дашборд
          </Link>
        </div>
      </Card>
    </div>
  );
}
