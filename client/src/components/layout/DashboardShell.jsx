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
      { to: "/dashboard/appointments", label: "My Appointments" },
      { to: "/dashboard/request-meeting", label: "Request Meeting" },
      { to: "/tinder", label: "Tinder" },
    ],
  },
  {
    label: "Owner",
    items: [
      { to: "/owner/dashboard", label: "Owner Dashboard" },
      { to: "/owner/slots/new", label: "Create Availability" },
      { to: "/owner/slots", label: "Manage Slots" },
      { to: "/owner/bookings", label: "View Bookings" },
      { to: "/owner/requests", label: "Booking Requests" },
      { to: "/owner/group-meetings/new", label: "Group Meetings" },
      { to: "/owner/recurring-office-hours", label: "Recurring Hours" },
      { to: "/owner/invite-links", label: "Invite Links" },
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
