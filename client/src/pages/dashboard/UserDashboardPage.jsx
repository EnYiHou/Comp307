import Dashboard from "../../features/dashboard/components/Dashboard.jsx";

export default function UserDashboardPage() {
  return (
    <section className="page-stack">
      <h1>User Dashboard</h1>
      <p>
        Welcome to your dashboard! Here you can manage your appointments, view
        your schedule, and update your settings.
      </p>
      <Dashboard />
    </section>
  );
}
