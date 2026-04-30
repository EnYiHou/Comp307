import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingState from "../../components/loading/LoadingState";
import api from "../../shared/api/api";
import { acceptBooking } from "../../features/booking/bookingService";
import { bookingMailto } from "../../shared/utils/mailto";
import "../../features/dashboard/components/dashboard.css";

function formatDateTime(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function spotsAvailable(booking) {
  return booking.capacity - (booking.participants?.length || 0);
}

export default function InviteBookingPage() {
  const { token } = useParams();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    async function loadInvite() {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get(`/invites/${token}`);
        setInvite(response.data.data);
      } catch (error) {
        console.error("Invite load error:", error);
        setMessage(error.response?.data?.message || "Failed to load invite.");
      } finally {
        setLoading(false);
      }
    }

    loadInvite();
  }, [token]);

  async function bookSlot(slot) {
    setBookingId(slot._id);
    setMessage("");

    try {
      await acceptBooking(slot._id);
      setInvite((prev) => ({
        ...prev,
        bookings: prev.bookings.filter((booking) => booking._id !== slot._id),
      }));
      setMessage("Appointment booked successfully.");
    } catch (error) {
      console.error("Invite booking error:", error);
      setMessage(error.response?.data?.message || "Failed to book appointment.");
    } finally {
      setBookingId("");
    }
  }

  if (loading) {
    return <LoadingState label="Loading invite..." variant="page" size="large" />;
  }

  return (
    <section className="user-dashboard">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Invite booking</p>
          <h1>{invite?.owner?.name || "Booking Invite"}</h1>
          <p>
            This page shows only the active public slots shared by this owner.
          </p>
        </div>
      </div>

      {message && <p className="dashboard-panel-message">{message}</p>}

      <section className="dashboard-panel dashboard-panel-wide">
        <div className="dashboard-panel-head">
          <div>
            <h2>Available Slots</h2>
            <p>{invite?.bookings?.length || 0} open slots</p>
          </div>
          {invite?.owner?.email && (
            <a
              className="dashboard-action"
              href={bookingMailto(invite.owner.email, "Question about invite", {})}
            >
              Email owner
            </a>
          )}
        </div>

        {!invite ? (
          <p className="dashboard-panel-message">Invite not found.</p>
        ) : invite.bookings.length === 0 ? (
          <p className="dashboard-panel-message">
            This owner has no active public slots right now.
          </p>
        ) : (
          <div className="dashboard-panel-scroll">
            <div className="dashboard-list">
              {invite.bookings.map((slot) => (
                <article className="dashboard-row" key={slot._id}>
                  <div className="dashboard-row-time">{formatDateTime(slot.startTime)}</div>
                  <div className="dashboard-row-main">
                    <h3>{slot.title}</h3>
                    {slot.description && <p>{slot.description}</p>}
                    <div className="dashboard-row-meta">
                      <span className="dashboard-chip">
                        {spotsAvailable(slot)} spots available
                      </span>
                    </div>
                  </div>
                  <div className="dashboard-row-actions">
                    <button
                      className="dashboard-action"
                      type="button"
                      disabled={bookingId === slot._id}
                      onClick={() => bookSlot(slot)}
                    >
                      {bookingId === slot._id ? "Booking..." : "Book"}
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
