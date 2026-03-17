import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authStore } from "@/features/auth/hooks/auth-store";

export function ProtectedRoute() {
  const location = useLocation();
  const hydrated = authStore((state) => state.hydrated);
  const tokens = authStore((state) => state.tokens);

  if (!hydrated) {
    return null;
  }

  if (!tokens?.accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const user = authStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";

  if (!isAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
