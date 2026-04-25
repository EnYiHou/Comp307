import { Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import "./DashboardShell.css";
import Sidebar from "./Sidebar";

const links = [
  {
    label: "Student",
    items: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/dashboard-owners", label: "Book Appointments" },
      { to: "/tinder", label: "Tinder" },
    ],
  },
  {
    label: "Owner",
    items: [
      { to: "/owner/dashboard", label: "Owner Dashboard" },
      { to: "/owner/slots/new", label: "Create Availability" },
    ],
  },
];

export default function DashboardShell() {
  const { user } = useAuth();
  const visibleLinks = links.filter(
    (group) => group.label !== "Owner" || user?.role === "OWNER",
  );

  return (
    <div className="dashboard-shell">
      <Sidebar links={visibleLinks} />
      <main className="dashboard-shell_content">
        <Outlet />
      </main>
    </div>
  );
}
