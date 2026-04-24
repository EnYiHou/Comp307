import { Link, NavLink, Outlet } from "react-router-dom";
import "./DashboardShell.css";
import Sidebar from "./Sidebar";

const links = [
  { to: "/dashboard", label: "Home" },
  { to: "/dashboard-owners", label: "Owners" },
  { to: "/owner/dashboard", label: "Owner Dashboard" },
];

export default function DashboardShell() {
  return (
    <div className="dashboard-shell">
      <Sidebar links={links} />
      <main className="dashboard-shell_content">
        <Outlet />
      </main>
    </div>
  );
}
