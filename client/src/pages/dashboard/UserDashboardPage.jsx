import { useAuth } from "../../context/AuthContext.jsx";

export default function UserDashboardPage() {
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <section className="page-stack">
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
      <h1>User Dashboard</h1>
      <p>
        Welcome to your dashboard! Here you can manage your appointments, view
        your schedule, and update your settings.
      </p>
    </section>
  );
}
