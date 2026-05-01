import { useState } from "react";
import api from "../../shared/api/api";
import "./NewMeetingRequestModal.css";

// Extra fixes: Ronald Zhang
// EnYi Hou (261165635)

function toDateTimeInputValue(date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function getDefaultStart() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setMinutes(0, 0, 0);
  return toDateTimeInputValue(date);
}

function getNowMinString() {
  const date = new Date();
  date.setSeconds(0, 0);
  return toDateTimeInputValue(date);
}

export default function NewMeetingRequestModal({
  teacher,
  onClose,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    topic: "",
    message: "",
    preferredStart: getDefaultStart(),
    durationHours: 1,
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const preferredStart = new Date(formData.preferredStart);

      if (preferredStart <= new Date()) {
        setMessage("Preferred start must be in the future.");
        setSubmitting(false);
        return;
      }

      const preferredEnd = new Date(
        preferredStart.getTime() + Number(formData.durationHours) * 60 * 60 * 1000,
      );

      await api.post("/meeting-requests", {
        ...formData,
        ownerId: teacher._id,
        preferredStart: preferredStart.toISOString(),
        preferredEnd: preferredEnd.toISOString(),
      });
      onSuccess?.("Meeting request sent.", "success");
      onClose();
    } catch (error) {
      console.error("Create meeting request error:", error);
      setMessage(
        error.response?.data?.message || "Failed to create meeting request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="request-modal-backdrop" onClick={onClose}>
      <div
        className="request-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="request-modal-header">
          <h2>Request a Time</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="request-form" onSubmit={handleSubmit}>
          <div className="request-selected-teacher">
            <p>Requesting {teacher.name}</p>
          </div>

          <label>
            Topic
            <input
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              maxLength={100}
              required
            />
          </label>

          <label>
            Message
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              maxLength={500}
              rows="4"
            />
          </label>

          <div className="request-form-row">
            <label>
              Preferred start
              <input
                type="datetime-local"
                name="preferredStart"
                value={formData.preferredStart}
                min={getNowMinString()}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Hours
              <input
                type="number"
                min="0.5"
                step="0.5"
                name="durationHours"
                value={formData.durationHours}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {message && <p className="request-form-message">{message}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send request"}
          </button>
        </form>
      </div>
    </div>
  );
}
