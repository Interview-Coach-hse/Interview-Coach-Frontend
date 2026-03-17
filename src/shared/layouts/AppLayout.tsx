import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { authStore } from "@/features/auth/hooks/auth-store";
import { Button } from "@/shared/ui/Button";

const links = [
  { to: "/app/dashboard", label: "Дашборд" },
  { to: "/app/history", label: "История" },
  { to: "/profiles", label: "Сценарии" },
  { to: "/app/settings", label: "Профиль" },
];

export function AppLayout() {
  const navigate = useNavigate();
  const user = authStore((state) => state.user);
  const clearSession = authStore((state) => state.clearSession);

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/app/dashboard" className="brand">
          Interview Coach
        </Link>
        <nav className="topnav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="topnav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-actions">
          <span className="user-chip">{user?.email ?? "User"}</span>
          <Button
            variant="ghost"
            onClick={() => {
              clearSession();
              navigate("/login");
            }}
          >
            Выйти
          </Button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
