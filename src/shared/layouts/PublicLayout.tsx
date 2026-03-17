import { Link, NavLink, Outlet } from "react-router-dom";

const publicLinks = [
  { to: "/profiles", label: "Сценарии" },
  { to: "/app/history", label: "История" },
  { to: "/app/settings", label: "Профиль" },
];

export function PublicLayout() {
  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/profiles" className="brand">
          Interview Coach
        </Link>
        <nav className="topnav">
          {publicLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="topnav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-actions">
          <Link to="/login" className="ghost-link">
            Войти
          </Link>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
