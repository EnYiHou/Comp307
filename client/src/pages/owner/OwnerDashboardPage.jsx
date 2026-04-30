import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useConfirmationDialog from "../../components/confirmation/useConfirmationDialog";
import LoadingState from "../../components/loading/LoadingState";
import OwnerPolls from "../../features/booking/components/OwnerPolls";
import api from "../../shared/api/api";
import "./OwnerDashboardPage.css";

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "No time picked yet";
  }

  return new Date(dateValue).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTodayBookings(bookings) {
  const today = new Date();
  return bookings.filter((booking) => {
    const bookingDate = new Date(booking.startTime);
    return bookingDate.toDateString() === today.toDateString();
  });
}

export default function OwnerDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const { confirm, confirmationDialog } = useConfirmationDialog();

  const todayBookings = useMemo(() => getTodayBookings(bookings), [bookings]);

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
    if (status === "DECLINED") {
      const confirmed = await confirm({
        title: "Decline request?",
        message: "The request will move out of your pending queue.",
        confirmLabel: "Decline",
      });
      if (!confirmed) {
        return;
      }
    }

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
      <div className="owner-hero">
        <div>
          <p className="owner-eyebrow">Owner workspace</p>
          <h1>Owner Dashboard</h1>
          <p>
            Review student requests first, then keep an eye on upcoming bookings.
          </p>
        </div>
        <Link className="owner-main-action" to="/owner/slots/new">
          Create Availability
        </Link>
      </div>

      {message && <p className="owner-message">{message}</p>}

      <div className="owner-summary" aria-label="Owner dashboard summary">
        <article>
          <span>{loading ? "-" : requests.length}</span>
          <p>Pending requests</p>
        </article>
        <article>
          <span>{loading ? "-" : todayBookings.length}</span>
          <p>Today</p>
        </article>
        <article>
          <span>{loading ? "-" : bookings.length}</span>
          <p>Total upcoming</p>
        </article>
      </div>

      <div className="owner-main-grid">
        <section className="owner-dashboard-panel owner-requests-panel">
          <PanelHeader
            title="Request Queue"
            subtitle="Accept or decline custom meeting requests"
            count={requests.length}
            loading={loading}
          />

          {loading ? (
            <LoadingState label="Loading requests..." variant="panel" />
          ) : requests.length === 0 ? (
            <EmptyState
              title="No pending requests"
              message="New student requests will appear here for quick review."
            />
          ) : (
            <div className="owner-requests-list">
              {requests.map((request) => (
                <RequestRow
                  key={request._id}
                  request={request}
                  updating={updatingRequestId === request._id}
                  onUpdate={updateRequestStatus}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="owner-side">
          <section className="owner-dashboard-panel">
            <PanelHeader
              title="Upcoming Bookings"
              subtitle="Confirmed appointments on your calendar."
              count={bookings.length}
              loading={loading}
            />

            {loading ? (
              <LoadingState label="Loading bookings..." variant="panel" />
            ) : bookings.length === 0 ? (
              <EmptyState
                title="No upcoming bookings"
                message="Create availability so students can reserve a time."
                action={<Link to="/owner/slots/new">Create Availability</Link>}
              />
            ) : (
              <div className="owner-bookings-small">
                {bookings.map((booking) => (
                  <BookingRow key={booking._id} booking={booking} />
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      <OwnerPolls />
      {confirmationDialog}
    </section>
  );
}

function PanelHeader({ title, subtitle, count, loading }) {
  return (
    <div className="owner-panel-head">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {!loading && <span>{count}</span>}
    </div>
  );
}

function EmptyState({ title, message, action }) {
  return (
    <div className="owner-empty">
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

function RequestRow({ request, updating, onUpdate }) {
  return (
    <article className="owner-request-card">
      <div className="request-time">
        <span>Preferred</span>
        <strong>{formatDateTime(request.preferredStart)}</strong>
      </div>

      <div className="request-main">
        <div>
          <h3>{request.requesterId?.name || "Unknown requester"}</h3>
          <p>{request.topic}</p>
        </div>
        {request.message && <p className="request-note">{request.message}</p>}
      </div>

      <div className="request-buttons">
        <button
          type="button"
          disabled={updating}
          onClick={() => onUpdate(request._id, "ACCEPTED")}
        >
          {updating ? "Saving..." : "Accept"}
        </button>
        <button
          type="button"
          className="no-button"
          disabled={updating}
          onClick={() => onUpdate(request._id, "DECLINED")}
        >
          Decline
        </button>
      </div>
    </article>
  );
}

function BookingRow({ booking }) {
  return (
    <article className="booking-card-small">
      <div>
        <span>{formatDateTime(booking.startTime)}</span>
        <h3>{booking.title}</h3>
        <p>
          {booking.participants?.length
            ? booking.participants.map((participant) => participant.name).join(", ")
            : "No participants listed"}
        </p>
      </div>
      <Link to={`/owner/bookings/${booking._id}/edit`}>Edit</Link>
    </article>
  );
}
