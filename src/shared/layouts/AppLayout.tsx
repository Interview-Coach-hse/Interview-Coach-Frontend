import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { authStore } from "@/features/auth/hooks/auth-store";
import { Button } from "@/shared/ui/Button";

const links = [
  { to: "/app/dashboard", label: "Дашборд" },
  { to: "/app/history", label: "История" },
  { to: "/app/profiles", label: "Сценарии" },
];

export function AppLayout() {
  const navigate = useNavigate();
  const user = authStore((state) => state.user);
  const clearSession = authStore((state) => state.clearSession);
  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";
  const navLinks = isAdmin ? [...links, { to: "/admin/users", label: "Админка" }] : links;

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/app/dashboard" className="brand">
          Interview Coach
        </Link>
        <nav className="topnav">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="topnav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-actions">
          <NavLink to="/app/settings" className="user-chip">
            {user?.email ?? "User"}
          </NavLink>
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
