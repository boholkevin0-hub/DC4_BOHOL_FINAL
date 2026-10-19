import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import BrandMark from "./BrandMark";

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  }

  const links = [
    { to: "/", label: "Dashboard", icon: "▦", end: true },
    { to: "/requests", label: "My Requests", icon: "▤", end: true },
    { to: "/requests/new", label: "Request Document", icon: "＋" },
    { to: "/document-types", label: "Document Types", icon: "▧" },
    ...(user?.role === "admin" ? [{ to: "/manage", label: "Manage Requests", icon: "⚙" }] : []),
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <BrandMark />
          <div><h1>Student Portal</h1><span>Document Request System</span></div>
        </div>
        <p className="nav-label">MAIN MENU</p>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <span>{link.icon}</span><span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer"><strong>Student Document Portal</strong><span>School service management</span></div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <span className="breadcrumb">Signed in as <strong>{user?.name}</strong> ({user?.role})</span>
          <button type="button" className="button button-secondary" onClick={handleLogout}>Log out</button>
        </header>
        <div className="content-area"><Outlet /></div>
      </main>
    </div>
  );
}
