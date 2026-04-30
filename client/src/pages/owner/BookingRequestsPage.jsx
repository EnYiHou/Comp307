import { useEffect, useState } from "react";
import api from "../../shared/api/api";
import { buildMailto } from "../../shared/utils/mailto";
import "./OwnerDashboardPage.css";

function formatDateTime(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  async function loadRequests() {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/meeting-requests/owner", {
        params: { status: "PENDING" },
      });
      setRequests(response.data.data || []);
    } catch (error) {
      console.error("Requests load error:", error);
      setMessage(error.response?.data?.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(request, status) {
    setUpdatingId(request._id);
    setMessage("");

    try {
      await api.patch(`/meeting-requests/${request._id}/status`, { status });
      setRequests((prev) => prev.filter((item) => item._id !== request._id));
      setMessage(`Request ${status.toLowerCase()}.`);
    } catch (error) {
      console.error("Request update error:", error);
      setMessage(error.response?.data?.message || "Failed to update request.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <section className="owner-dashboard">
      <div className="owner-dashboard-hero">
        <div>
          <p className="owner-dashboard-eyebrow">Custom requests</p>
          <h1>Booking Requests</h1>
          <p>Accept or decline custom meeting requests from students.</p>
        </div>
      </div>

      {message && <p className="dashboard-message">{message}</p>}

      <section className="owner-dashboard-panel">
        <div className="owner-dashboard-panel-header">
          <div>
            <h2>Pending Requests</h2>
            <p>{loading ? "Loading..." : `${requests.length} pending`}</p>
          </div>
        </div>

        {loading ? (
          <p className="dashboard-message">Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="owner-empty-state">
            <h3>No pending requests</h3>
            <p>New request-a-time submissions will appear here.</p>
          </div>
        ) : (
          <div className="owner-request-list">
            {requests.map((request) => (
              <article className="owner-request-card" key={request._id}>
                <div className="owner-request-time">
                  <span>Preferred</span>
                  <strong>{formatDateTime(request.preferredStart)}</strong>
                </div>
                <div className="owner-request-main">
                  <h3>{request.requesterId?.name || "Unknown requester"}</h3>
                  <p>{request.topic}</p>
                  {request.message && <p>{request.message}</p>}
                </div>
                <div className="owner-request-actions">
                  {request.requesterId?.email && (
                    <a
                      href={buildMailto(
                        request.requesterId.email,
                        `Meeting request: ${request.topic}`,
                        `Hello,\n\nI am following up about your requested meeting for ${formatDateTime(
                          request.preferredStart,
                        )}.\n\nThank you.`,
                      )}
                    >
                      Email
                    </a>
                  )}
                  <button
                    type="button"
                    disabled={updatingId === request._id}
                    onClick={() => updateStatus(request, "ACCEPTED")}
                  >
                    Accept
                  </button>
                  <button
                    className="decline-button"
                    type="button"
                    disabled={updatingId === request._id}
                    onClick={() => updateStatus(request, "DECLINED")}
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
