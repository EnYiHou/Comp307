import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../shared/api/api";
import "./OwnerDashboardPage.css";

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "No time selected";
  }

  return new Date(dateValue).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OwnerDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

  async function loadDashboard() {
    setLoading(true);
    setMessage("");

    try {
      const [requestsResponse, bookingsResponse] = await Promise.all([
        api.get("/meeting-requests/owner", {
          params: { status: "PENDING" },
        }),
        api.get("/meeting-requests/owner/upcoming"),
      ]);

      setRequests(requestsResponse.data.data || []);
      setBookings(bookingsResponse.data.data || []);
    } catch (error) {
      console.error("Owner dashboard load error:", error);
      setMessage("Failed to load owner dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function updateRequestStatus(requestId, status) {
    setUpdatingRequestId(requestId);
    setMessage("");

    try {
      await api.patch(`/meeting-requests/${requestId}/status`, { status });
      await loadDashboard();
    } catch (error) {
      console.error("Meeting request update error:", error);
      setMessage(
        error.response?.data?.message || "Failed to update meeting request.",
      );
    } finally {
      setUpdatingRequestId(null);
    }
  }

  return (
    <section className="owner-dashboard">
      <div className="owner-dashboard-header">
        <div>
          <h1>Owner Dashboard</h1>
          <p>Review meeting requests and keep track of upcoming bookings.</p>
        </div>
        <Link className="create-meeting-button" to="/owner/slots/new">
          Create meeting
        </Link>
      </div>

      {message && <p className="dashboard-message">{message}</p>}

      <div className="owner-dashboard-grid">
        <section className="dashboard-panel">
          <h2>Requests</h2>
          {loading ? (
            <p className="empty-text">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="empty-text">No pending requests.</p>
          ) : (
            <div className="dashboard-list">
              {requests.map((request) => (
                <article className="dashboard-list-item" key={request._id}>
                  <div>
                    <h3>{request.requesterId?.name || "Unknown requester"}</h3>
                    <p>{request.topic}</p>
                    {request.message && <p>{request.message}</p>}
                  </div>
                  <div className="request-actions">
                    <span>{formatDateTime(request.preferredStart)}</span>
                    <button
                      type="button"
                      disabled={updatingRequestId === request._id}
                      onClick={() =>
                        updateRequestStatus(request._id, "ACCEPTED")
                      }
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="decline-button"
                      disabled={updatingRequestId === request._id}
                      onClick={() =>
                        updateRequestStatus(request._id, "DECLINED")
                      }
                    >
                      Decline
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <h2>Upcoming Bookings</h2>
          {loading ? (
            <p className="empty-text">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="empty-text">No upcoming bookings.</p>
          ) : (
            <div className="dashboard-list">
              {bookings.map((booking) => (
                <article className="dashboard-list-item" key={booking._id}>
                  <div>
                    <h3>{booking.title}</h3>
                    <span className="booking-status">{booking.status}</span>
                    <p>
                      {booking.participants?.length
                        ? booking.participants
                            .map((participant) => participant.name)
                            .join(", ")
                        : "No participants listed"}
                    </p>
                  </div>
                  <div className="booking-actions">
                    <span>{formatDateTime(booking.startTime)}</span>
                    <Link to={`/owner/bookings/${booking._id}/edit`}>Edit</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
