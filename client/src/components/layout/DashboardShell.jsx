import { Link, NavLink, Outlet } from "react-router-dom";
import "./DashboardShell.css";

export default function DashboardShell() {
  return (
    <div className="dashboard-shell">
      <main className="dashboard-shell_content">
        <Outlet />
      </main>
    </div>
  );
}
