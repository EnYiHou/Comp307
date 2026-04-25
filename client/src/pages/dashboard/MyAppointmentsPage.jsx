import { useEffect, useState } from "react";
import LoadingState from "../../components/loading/LoadingState";
import api from "../../shared/api/api";
import { bookingMailto } from "../../shared/utils/mailto";
import "../../features/dashboard/components/dashboard.css";

function formatDateTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [notifyLink, setNotifyLink] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function loadAppointments() {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/bookings/my");
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error("Appointments load error:", error);
      setMessage(error.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function deleteAppointment(appointment) {
    const confirmed = window.confirm("Delete this appointment?");
    if (!confirmed) {
      return;
    }

    setDeletingId(appointment._id);
    setMessage("");
    setNotifyLink("");

    try {
      const response = await api.delete(`/bookings/${appointment._id}/appointment`);
      setAppointments((prev) => prev.filter((item) => item._id !== appointment._id));

      const ownerEmail = response.data.data?.ownerId?.email || appointment.ownerId?.email;
      if (ownerEmail) {
        setNotifyLink(bookingMailto(ownerEmail, "Appointment cancelled", appointment));
        setMessage("Appointment deleted. Use the mail link below to notify the owner.");
      } else {
        setMessage("Appointment deleted.");
      }
    } catch (error) {
      console.error("Appointment delete error:", error);
      setMessage(error.response?.data?.message || "Failed to delete appointment.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="user-dashboard">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Student appointments</p>
          <h1>My Appointments</h1>
          <p>Review bookings, email appointment owners, or cancel a future booking.</p>
        </div>
      </div>

      {message && <p className="dashboard-panel__message">{message}</p>}
      {notifyLink && (
        <p className="dashboard-panel__message">
          <a className="dashboard-action" href={notifyLink}>
            Notify owner by email
          </a>
        </p>
      )}

      <section className="dashboard-panel dashboard-panel--wide">
        <div className="dashboard-panel__header">
          <div>
            <h2>Booked Slots</h2>
            <p>{loading ? "Loading..." : `${appointments.length} total`}</p>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading appointments..." variant="panel" />
        ) : appointments.length === 0 ? (
          <p className="dashboard-panel__message">No appointments booked yet.</p>
        ) : (
          <div className="dashboard-panel__scroll">
            <div className="dashboard-list">
              {appointments.map((appointment) => (
                <article className="dashboard-row" key={appointment._id}>
                  <div className="dashboard-row__time">
                    {formatDateTime(appointment.startTime)}
                  </div>
                  <div className="dashboard-row__main">
                    <h3>{appointment.title}</h3>
                    {appointment.description && <p>{appointment.description}</p>}
                    <div className="dashboard-row__meta">
                      <span className="dashboard-chip">
                        {appointment.ownerId?.name || "Unknown owner"}
                      </span>
                      <span className="dashboard-chip is-status">{appointment.status}</span>
                    </div>
                  </div>
                  <div className="dashboard-row__actions">
                    {appointment.ownerId?.email && (
                      <a
                        className="dashboard-action"
                        href={bookingMailto(
                          appointment.ownerId.email,
                          "Question about appointment",
                          appointment,
                        )}
                      >
                        Email owner
                      </a>
                    )}
                    <button
                      className="dashboard-action dashboard-action--danger"
                      type="button"
                      disabled={deletingId === appointment._id}
                      onClick={() => deleteAppointment(appointment)}
                    >
                      {deletingId === appointment._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
