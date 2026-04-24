import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ links }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <div className="sidebar-header">
        <span className="title">App</span>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "coll" : "open"}
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive
                ? "sidebar-item nav-link-active"
                : "sidebar-item"
            }
          >
            <span className="label">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">Logout</div>
    </aside>
  );
}
