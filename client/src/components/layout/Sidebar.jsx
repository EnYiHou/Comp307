import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth.js";
import "./Sidebar.css";

export default function Sidebar({ links }) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="sidebar-header">
        <span className="title">BERK</span>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "Show" : "Hide"}
        </button>
      </div>

      <nav className="sidebar-nav">
        {links.map((group) => (
          <div className="sidebar-group" key={group.label}>
            <p className="sidebar-group-label">{group.label}</p>
            {group.items.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "sidebar-item nav-link-active" : "sidebar-item"
                }
              >
                <span className="label">{link.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <button className="sidebar-footer" type="button" onClick={handleLogout}>
        <span className="label">Logout</span>
      </button>
    </aside>
  );
}
