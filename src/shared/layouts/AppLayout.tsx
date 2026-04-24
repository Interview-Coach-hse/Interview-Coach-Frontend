import { Link, NavLink, Outlet } from "react-router-dom";
import { authStore } from "@/features/auth/hooks/auth-store";
import { cn } from "@/shared/lib/cn";
import { useTopbarState } from "@/shared/lib/useTopbarState";

const links = [
  { to: "/app/dashboard", label: "Дашборд" },
  { to: "/app/profiles", label: "Сценарии" },
];

export function AppLayout() {
  const user = authStore((state) => state.user);
  const isScrolled = useTopbarState();
  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";
  const navLinks = isAdmin ? [...links, { to: "/admin/users", label: "Админка" }] : links;

  return (
    <div className="shell">
      <header className={cn("topbar", isScrolled && "topbar-scrolled")}>
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
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
