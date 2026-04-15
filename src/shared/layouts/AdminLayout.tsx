import { Link, NavLink, Outlet } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { useTopbarState } from "@/shared/lib/useTopbarState";
import { Button } from "@/shared/ui";

const links = [
  { to: "/admin/users", label: "Пользователи" },
  { to: "/admin/questions", label: "Вопросы" },
  { to: "/admin/profiles", label: "Профили" },
];

export function AdminLayout() {
  const isScrolled = useTopbarState();

  return (
    <div className="shell">
      <header className={cn("topbar", isScrolled && "topbar-scrolled")}>
        <Link to="/admin/users" className="brand">
          Interview Coach Admin
        </Link>
        <nav className="topnav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="topnav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-actions">
          <Link to="/app/dashboard">
            <Button variant="ghost" type="button">
              В приложение
            </Button>
          </Link>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
