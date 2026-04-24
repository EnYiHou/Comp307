import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./AppShell.css";

const links = [
  { to: "/", label: "Home" },
  { to: "/instructions", label: "Instructions" },
  { to: "/owners", label: "Owners" },
  { to: "/dashboard", label: "Student Dashboard" },
  { to: "/owner/dashboard", label: "Owner Dashboard" },
];

export default function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar links={links} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
