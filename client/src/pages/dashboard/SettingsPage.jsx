import { useAuth } from "../../features/auth/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <section className="page-stack">
      <h1>Account Settings</h1>
      <p>
        Review the account information used for booking permissions and mailto
        contact links.
      </p>

      <div className="dashboard-panel__message">
        <p>
          <strong>Name:</strong> {user?.name || "Unknown"}
        </p>
        <p>
          <strong>Email:</strong> {user?.email || "Unknown"}
        </p>
        <p>
          <strong>Role:</strong> {user?.role === "OWNER" ? "Owner" : "User"}
        </p>
      </div>
    </section>
  );
}
