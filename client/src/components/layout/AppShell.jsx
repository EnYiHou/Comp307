import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/instructions", label: "Instructions" },
  { to: "/owners", label: "Owners" },
  { to: "/dashboard", label: "Student Dashboard" },
  { to: "/owner/dashboard", label: "Owner Dashboard" },
];

export default function AppShell() {
  return (
    <div className="shell">
      <header className="hero">
        <p className="eyebrow">COMP 307 Project Skeleton</p>
        <h1>McGill Booking App</h1>
        <p className="hero-copy">
          A MERN-based appointment system for students, professors, and TAs.
        </p>
      </header>

      <nav className="main-nav" aria-label="Primary">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "nav-link nav-link-active" : "nav-link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main className="content-card">
        <Outlet />
      </main>
    </div>
  );
}
