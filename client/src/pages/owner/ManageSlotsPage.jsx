import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useConfirmationDialog from "../../components/confirmation/useConfirmationDialog";
import LoadingState from "../../components/loading/LoadingState";
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

function participantNames(slot) {
  if (!slot.participants?.length) {
    return "No one has booked this slot yet.";
  }

  return slot.participants.map((participant) => participant.name).join(", ");
}

export default function ManageSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [deletedSlotNotice, setDeletedSlotNotice] = useState(null);
  const { confirm, confirmationDialog } = useConfirmationDialog();

  async function loadSlots() {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/bookings/owner/all");
      setSlots(response.data.data || []);
    } catch (error) {
      console.error("Owner slots load error:", error);
      setMessage(error.response?.data?.message || "Failed to load slots.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlots();
  }, []);

  async function updateSlot(slot, updates) {
    setUpdatingId(slot._id);
    setMessage("");
    setDeletedSlotNotice(null);

    try {
      const response = await api.patch(`/bookings/${slot._id}`, {
        title: slot.title,
        description: slot.description,
        startTime: slot.startTime,
        endTime: slot.endTime,
        visibility: slot.visibility,
        status: slot.status,
        capacity: slot.capacity,
        ...updates,
      });

      setSlots((prev) =>
        prev.map((item) => (item._id === slot._id ? response.data.data : item)),
      );
    } catch (error) {
      console.error("Owner slot update error:", error);
      setMessage(error.response?.data?.message || "Failed to update slot.");
    } finally {
      setUpdatingId("");
    }
  }

  async function deleteSlot(slot) {
    const confirmed = await confirm({
      title: "Delete slot?",
      message: "Students who reserved this time should be notified by email after deletion.",
      confirmLabel: "Delete slot",
    });
    if (!confirmed) {
      return;
    }

    setUpdatingId(slot._id);
    setMessage("");

    try {
      const response = await api.delete(`/bookings/${slot._id}`);
      const deletedSlot = response.data.data;
      setSlots((prev) => prev.filter((item) => item._id !== slot._id));

      if (deletedSlot.participants?.length) {
        setDeletedSlotNotice(deletedSlot);
        setMessage("Slot deleted. Use the participant email links below before closing this page.");
      } else {
        setMessage("Slot deleted.");
      }
    } catch (error) {
      console.error("Owner slot delete error:", error);
      setMessage(error.response?.data?.message || "Failed to delete slot.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <section className="owner-dashboard">
      <div className="owner-dashboard-hero">
        <div>
          <p className="owner-dashboard-eyebrow">Availability control</p>
          <h1>Manage Slots</h1>
          <p>
            Activate private slots, review who booked, email students, edit
            details, or delete old availability.
          </p>
        </div>
        <Link className="owner-primary-action" to="/owner/slots/new">
          Create Availability
        </Link>
      </div>

      {message && <p className="dashboard-message">{message}</p>}
      {deletedSlotNotice?.participants?.length > 0 && (
        <div className="owner-request-actions" style={{ marginBottom: "1rem" }}>
          {deletedSlotNotice.participants.map((participant) => (
            <a
              key={participant._id}
              href={bookingMailto(participant.email, "Booking slot deleted", deletedSlotNotice)}
            >
              Notify {participant.name}
            </a>
          ))}
        </div>
      )}

      <section className="owner-dashboard-panel">
        <div className="owner-dashboard-panel-header">
          <div>
            <h2>All Slots</h2>
            <p>{loading ? "Loading..." : `${slots.length} total`}</p>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading slots..." variant="panel" />
        ) : slots.length === 0 ? (
          <div className="owner-empty-state">
            <h3>No slots yet</h3>
            <p>Create availability to let students reserve appointments.</p>
            <Link to="/owner/slots/new">Create Availability</Link>
          </div>
        ) : (
          <div className="owner-request-list">
            {slots.map((slot) => (
              <article className="owner-request-card" key={slot._id}>
                <div className="owner-request-time">
                  <span>{slot.visibility}</span>
                  <strong>{formatDateTime(slot.startTime)}</strong>
                </div>
                <div className="owner-request-main">
                  <h3>{slot.title}</h3>
                  {slot.description && <p>{slot.description}</p>}
                  <p>
                    {slot.status} - {slot.participants?.length || 0}/{slot.capacity} booked
                  </p>
                  <p>{participantNames(slot)}</p>
                  {slot.participants?.length > 0 && (
                    <div className="owner-request-actions">
                      {slot.participants.map((participant) => (
                        <a
                          key={participant._id}
                          href={bookingMailto(participant.email, "Booking update", slot)}
                        >
                          Email {participant.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="owner-request-actions">
                  <button
                    type="button"
                    disabled={updatingId === slot._id}
                    onClick={() =>
                      updateSlot(slot, {
                        visibility: slot.visibility === "public" ? "private" : "public",
                      })
                    }
                  >
                    {slot.visibility === "public" ? "Make private" : "Activate"}
                  </button>
                  <Link to={`/owner/bookings/${slot._id}/edit`}>Edit</Link>
                  <button
                    className="decline-button"
                    type="button"
                    disabled={updatingId === slot._id}
                    onClick={() => deleteSlot(slot)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {confirmationDialog}
    </section>
  );
}
