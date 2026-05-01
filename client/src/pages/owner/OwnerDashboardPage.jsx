import { useEffect, useMemo, useState } from "react";
import useConfirmationDialog from "../../components/confirmation/useConfirmationDialog";
import OwnerPolls from "../../features/booking/components/OwnerPolls";
import api from "../../shared/api/api";
import "./OwnerDashboardPage.css";

//Kevin Xu

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
  const [bookingAction, setBookingAction] = useState(null);
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
        api.get("/bookings/owner/upcoming"),
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

  async function toggleBookingVisibility(booking) {
    const nextVisibility = booking.visibility === "public" ? "private" : "public";

    setBookingAction({ id: booking._id, type: "visibility" });
    setMessage("");

    try {
      const response = await api.patch(`/bookings/${booking._id}`, {
        title: booking.title,
        description: booking.description || "",
        startTime: booking.startTime,
        endTime: booking.endTime,
        visibility: nextVisibility,
        status: booking.status,
        capacity: booking.capacity || Math.max(booking.participants?.length || 0, 1),
      });

      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          currentBooking._id === booking._id ? response.data.data : currentBooking,
        ),
      );
    } catch (error) {
      console.error("Booking visibility update error:", error);
      setMessage(error.response?.data?.message || "Failed to update booking visibility.");
    } finally {
      setBookingAction(null);
    }
  }

  async function deleteBooking(booking) {
    const confirmed = await confirm({
      title: "Delete booking?",
      message: "This permanently removes the booking from your upcoming list.",
      confirmLabel: "Delete",
    });

    if (!confirmed) {
      return;
    }

    setBookingAction({ id: booking._id, type: "delete" });
    setMessage("");

    try {
      await api.delete(`/bookings/${booking._id}`);
      setBookings((currentBookings) =>
        currentBookings.filter((currentBooking) => currentBooking._id !== booking._id),
      );
      setMessage("Booking deleted.");
    } catch (error) {
      console.error("Booking delete error:", error);
      setMessage(error.response?.data?.message || "Failed to delete booking.");
    } finally {
      setBookingAction(null);
    }
  }

  return (
    <section className="owner-dashboard">
      <div className="owner-dashboard-hero">
        <div>
          <p className="owner-dashboard-eyebrow">Owner workspace</p>
          <h1>Owner Dashboard</h1>
          <p>
            Review student requests first, then keep an eye on upcoming booked
            appointments.
          </p>
        </div>
      </div>

      {message && <p className="dashboard-message">{message}</p>}

      <div className="owner-dashboard-summary">
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
          <p>Upcoming bookings</p>
        </article>
      </div>

      <div className="owner-dashboard-grid">
        <section className="owner-dashboard-panel owner-dashboard-panel--requests">
          <PanelHeader
            title="Request Queue"
            subtitle="Accept or decline custom meeting requests."
            count={requests.length}
            loading={loading}
          />

          {loading ? (
            <p className="dashboard-message">Loading requests...</p>
          ) : requests.length === 0 ? (
            <EmptyState
              title="No pending requests"
              message="New student requests will appear here for quick review."
            />
          ) : (
            <div className="owner-request-list">
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

        <aside className="owner-side-stack">
          <section className="owner-dashboard-panel">
            <PanelHeader
              title="Upcoming Bookings"
              subtitle="Confirmed appointments on your calendar."
              count={bookings.length}
              loading={loading}
            />

            {loading ? (
              <p className="dashboard-message">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <EmptyState
                title="No upcoming bookings"
                message="Create availability so students can reserve a time."
              />
            ) : (
              <div className="owner-booking-list-compact">
                {bookings.map((booking) => (
                  <BookingRow
                    key={booking._id}
                    booking={booking}
                    actionType={
                      bookingAction?.id === booking._id ? bookingAction.type : null
                    }
                    onDelete={deleteBooking}
                    onToggleVisibility={toggleBookingVisibility}
                  />
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
    <div className="owner-dashboard-panel-header">
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
    <div className="owner-empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

function RequestRow({ request, updating, onUpdate }) {
  return (
    <article className="owner-request-card">
      <div className="owner-request-time">
        <span>Preferred</span>
        <strong>{formatDateTime(request.preferredStart)}</strong>
      </div>

      <div className="owner-request-main">
        <div>
          <h3>{request.requesterId?.name || "Unknown requester"}</h3>
          <p>{request.topic}</p>
        </div>
        {request.message && <p className="owner-request-message">{request.message}</p>}
      </div>

      <div className="owner-request-actions">
        <button
          type="button"
          disabled={updating}
          onClick={() => onUpdate(request._id, "ACCEPTED")}
        >
          {updating ? "Saving..." : "Accept"}
        </button>
        <button
          type="button"
          className="decline-button"
          disabled={updating}
          onClick={() => onUpdate(request._id, "DECLINED")}
        >
          Decline
        </button>
      </div>
    </article>
  );
}

function BookingRow({ booking, actionType, onDelete, onToggleVisibility }) {
  const isPublic = booking.visibility === "public";
  const isBusy = Boolean(actionType);

  return (
    <article className="owner-booking-card">
      <div>
        <span>
          {formatDateTime(booking.startTime)} - {booking.visibility || "private"}
        </span>
        <h3>{booking.title}</h3>
        <p>
          {booking.participants?.length
            ? booking.participants.map((participant) => participant.name).join(", ")
            : "No participants listed"}
        </p>
      </div>
      <div className="owner-booking-actions">
        <button
          type="button"
          className={`secondary-button visibility-button ${
            isPublic ? "is-public" : "is-private"
          }`}
          disabled={isBusy}
          onClick={() => onToggleVisibility(booking)}
        >
          {actionType === "visibility"
            ? "Saving..."
            : `Make ${isPublic ? "private" : "public"}`}
        </button>
        <button
          type="button"
          className="delete-button"
          disabled={isBusy}
          onClick={() => onDelete(booking)}
        >
          {actionType === "delete" ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
