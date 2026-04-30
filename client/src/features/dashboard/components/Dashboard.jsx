import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useConfirmationDialog from "../../../components/confirmation/useConfirmationDialog";
import LoadingState from "../../../components/loading/LoadingState.jsx";
import UserInvites from "../../booking/components/UserInvites";
import api from "../../../shared/api/api.js";
import "./dashboard.css";

function formatDateTime(value) {
  if (!value) {
    return "No time picked yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function DashboardPanel({ title, count, loading, error, emptyText, children }) {
  const countText = count === 1 ? "1 item total" : `${count} items total`;

  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-head">
        <div>
          <h2>{title}</h2>
          <p>{loading ? "Loading ..." : countText}</p>
        </div>
        {!loading && <span className="dashboard-panel-count">{count}</span>}
      </div>

      {error ? (
        <p className="dashboard-panel-message is-error">{error}</p>
      ) : loading ? (
        <LoadingState label={`Loading ${title.toLowerCase()}...`} variant="panel" />
      ) : count === 0 ? (
        <p className="dashboard-panel-message">{emptyText}</p>
      ) : (
        <div className="dashboard-panel-scroll">{children}</div>
      )}
    </section>
  );
}

function AppointmentSection() {
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [cancellingRequestId, setCancellingRequestId] = useState(null);
  const { confirm, confirmationDialog } = useConfirmationDialog();

  useEffect(() => {
    let isMounted = true;

    async function loadAppointments() {
      try {
        const [appointmentsResponse, requestsResponse] = await Promise.all([
          api.get("/dashboard/appointments"),
          api.get("/meeting-requests/user"),
        ]);
        if (!isMounted) {
          return;
        }
        setAppointments(appointmentsResponse.data);
        setRequests(requestsResponse.data.data || []);
        setError(null);
      } catch (caughtError) {
        if (isMounted) {
          setError(caughtError.response?.data?.message || "Failed to fetch dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      isMounted = false;
    };
  }, []);

  async function deleteAppointment(appointmentId) {
    const confirmed = await confirm({
      title: "Delete appointment?",
      message: "This removes the appointment from your dashboard.",
      confirmLabel: "Delete",
    });
    if (!confirmed) {
      return;
    }

    setDeletingId(appointmentId);
    setError(null);

    try {
      await api.delete(`/bookings/${appointmentId}/appointment`);
      setAppointments((prev) =>
        prev.filter((appointment) => appointment._id !== appointmentId),
      );
    } catch (caughtError) {
      setError(caughtError.response?.data?.message || "Failed to delete appointment.");
    } finally {
      setDeletingId(null);
    }
  }

  async function cancelRequest(requestId) {
    const confirmed = await confirm({
      title: "Cancel meeting request?",
      message: "The owner will no longer see this request as pending.",
      confirmLabel: "Cancel request",
    });
    if (!confirmed) {
      return;
    }

    setCancellingRequestId(requestId);
    setError(null);

    try {
      const { data } = await api.patch(`/meeting-requests/${requestId}/cancel`);
      setRequests((prev) =>
        prev.map((request) => (request._id === requestId ? data.data : request)),
      );
    } catch (caughtError) {
      setError(caughtError.response?.data?.message || "Failed to cancel request.");
    } finally {
      setCancellingRequestId(null);
    }
  }

  return (
    <>
      <DashboardPanel
        title="Upcoming Appointments"
        count={appointments.length}
        loading={loading}
        error={error}
        emptyText="No appointments booked yet - try Book Appointments when you are ready."
      >
        <div className="dashboard-list">
          {appointments.map((appointment) => (
            <UpcomingAppointment
              key={appointment._id}
              appointment={appointment}
              deleting={deletingId === appointment._id}
              onDelete={deleteAppointment}
            />
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel
        title="Meeting Requests"
        count={requests.length}
        loading={loading}
        error={error}
        emptyText="No custom meeting requests right now, for now."
      >
        <div className="dashboard-list">
          {requests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              cancelling={cancellingRequestId === request._id}
              onCancel={cancelRequest}
            />
          ))}
        </div>
      </DashboardPanel>
      {confirmationDialog}
    </>
  );
}

function UpcomingAppointment({ appointment, deleting, onDelete }) {
  return (
    <article className="dashboard-row">
      <div className="dashboard-row-time">{formatDateTime(appointment.startTime)}</div>

      <div className="dashboard-row-main">
        <h3>{appointment.title}</h3>
        {appointment.description && <p>{appointment.description}</p>}
        <div className="dashboard-row-meta">
          {appointment.ownerId?.name && (
            <span className="dashboard-chip">With {appointment.ownerId.name}</span>
          )}
          {appointment.status && (
            <span className="dashboard-chip is-status">{appointment.status}</span>
          )}
          {appointment.visibility && (
            <span className="dashboard-chip">{appointment.visibility}</span>
          )}
        </div>
      </div>

      <div className="dashboard-row-actions">
        {appointment.ownerId?.email && (
          <a className="dashboard-action" href={`mailto:${appointment.ownerId.email}`}>
            Email
          </a>
        )}
        <button
          className="dashboard-action danger-action"
          type="button"
          disabled={deleting}
          onClick={() => onDelete(appointment._id)}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

function RequestCard({ request, cancelling, onCancel }) {
  return (
    <article className="dashboard-row">
      <div className="dashboard-row-time">{formatDateTime(request.preferredStart)}</div>

      <div className="dashboard-row-main">
        <h3>{request.topic}</h3>
        {request.message && <p>{request.message}</p>}
        <div className="dashboard-row-meta">
          {request.ownerId?.name && (
            <span className="dashboard-chip">With {request.ownerId.name}</span>
          )}
          {request.status && (
            <span className="dashboard-chip is-status">{request.status}</span>
          )}
        </div>
      </div>

      <div className="dashboard-row-actions">
        {request.ownerId?.email && (
          <a className="dashboard-action" href={`mailto:${request.ownerId.email}`}>
            email
          </a>
        )}
        {request.status === "PENDING" && (
          <button
            className="dashboard-action danger-action"
            type="button"
            disabled={cancelling}
            onClick={() => onCancel(request._id)}
          >
            {cancelling ? "Cancelling..." : "Cancel"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function Dashboard() {
  return (
    <section className="user-dashboard">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Student workspace</p>
          <h1>Dashboard</h1>
          <p>
            Track appointments, custom requests, and group invite votes from one place.
          </p>
        </div>
      </div>

      <div className="dashboard-quick-actions" aria-label="Quick actions">
        <Link className="dashboard-quick-action" to="/dashboard-owners">
          Book Appointments
        </Link>
      </div>

      <div className="dashboard-grid">
        <AppointmentSection />
        <UserInvites />
      </div>
    </section>
  );
}
