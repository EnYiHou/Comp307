import { useEffect, useMemo, useState } from "react";
import api from "../../shared/api/api";
import { bookingMailto } from "../../shared/utils/mailto";
import "./OwnerDashboardPage.css";

function formatDateTime(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ViewBookingsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await api.get("/bookings/owner/all");
        setSlots(response.data.data || []);
      } catch (error) {
        console.error("Owner bookings load error:", error);
        setMessage(error.response?.data?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  const bookedSlots = useMemo(
    () => slots.filter((slot) => (slot.participants?.length || 0) > 0),
    [slots],
  );

  return (
    <section className="owner-dashboard">
      <div className="owner-dashboard-hero">
        <div>
          <p className="owner-dashboard-eyebrow">Roster view</p>
          <h1>View Bookings</h1>
          <p>See every slot with booked students and email participants directly.</p>
        </div>
      </div>

      {message && <p className="dashboard-message">{message}</p>}

      <section className="owner-dashboard-panel">
        <div className="owner-dashboard-panel-header">
          <div>
            <h2>Booked Appointments</h2>
            <p>{loading ? "Loading..." : `${bookedSlots.length} booked slots`}</p>
          </div>
        </div>

        {loading ? (
          <p className="owner-empty-state">Loading bookings...</p>
        ) : bookedSlots.length === 0 ? (
          <div className="owner-empty-state">
            <h3>No booked slots yet</h3>
            <p>Student reservations will appear here once public slots are booked.</p>
          </div>
        ) : (
          <div className="owner-request-list">
            {bookedSlots.map((slot) => (
              <article className="owner-request-card" key={slot._id}>
                <div className="owner-request-time">
                  <span>{slot.status}</span>
                  <strong>{formatDateTime(slot.startTime)}</strong>
                </div>
                <div className="owner-request-main">
                  <h3>{slot.title}</h3>
                  <p>
                    {slot.participants.length}/{slot.capacity} participants
                  </p>
                  <p>{slot.participants.map((participant) => participant.name).join(", ")}</p>
                </div>
                <div className="owner-request-actions">
                  {slot.participants.map((participant) => (
                    <a
                      key={participant._id}
                      href={bookingMailto(participant.email, "Appointment message", slot)}
                    >
                      Email {participant.name}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
