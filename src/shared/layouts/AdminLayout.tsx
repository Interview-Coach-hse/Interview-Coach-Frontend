import { Link, NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin/users", label: "Пользователи" },
  { to: "/admin/questions", label: "Вопросы" },
  { to: "/admin/profiles", label: "Профили" },
];

export function AdminLayout() {
  return (
    <div className="shell">
      <header className="topbar">
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
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
