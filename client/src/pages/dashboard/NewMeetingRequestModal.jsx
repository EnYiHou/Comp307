import { useCallback, useEffect, useState } from "react";
import api from "../../shared/api/api";
import { getMcGillOwners } from "../../features/search/services/searchService";
import "./NewMeetingRequestModal.css";

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

export default function NewMeetingRequestModal({
  initialTeacher = null,
  lockTeacher = false,
  onClose,
  onSuccess,
}) {
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(initialTeacher);
  const [formData, setFormData] = useState({
    topic: "",
    message: "",
    preferredStart: getDefaultStart(),
    durationHours: 1,
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadTeachers = useCallback(async () => {
    try {
      const data = await getMcGillOwners(teacherSearch);
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Appointment host search error:", error);
      setTeachers([]);
    }
  }, [teacherSearch]);

  useEffect(() => {
    const timeout = setTimeout(loadTeachers, 300);
    return () => clearTimeout(timeout);
  }, [loadTeachers]);

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
      const preferredEnd = new Date(
        preferredStart.getTime() + Number(formData.durationHours) * 60 * 60 * 1000,
      );

      await api.post("/meeting-requests", {
        ...formData,
        ownerId: selectedTeacher._id,
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="request-modal-header">
          <h2 id="request-modal-title">Request a Time</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>

        {!selectedTeacher && (
          <label>
            Search appointment host
            <input
              type="search"
              value={teacherSearch}
              onChange={(event) => {
                setTeacherSearch(event.target.value);
                setSelectedTeacher(null);
              }}
              placeholder="Type a name..."
            />
          </label>
        )}

        {!selectedTeacher && (
          <div className="teacher-search-results">
            {teachers.length === 0 ? (
              <p>No appointment hosts found.</p>
            ) : (
              teachers.map((teacher) => (
                <button
                  type="button"
                  key={teacher._id}
                  onClick={() => setSelectedTeacher(teacher)}
                >
                  <strong>{teacher.name}</strong>
                  <span>{teacher.email}</span>
                </button>
              ))
            )}
          </div>
        )}

        {selectedTeacher && (
          <form className="request-form" onSubmit={handleSubmit}>
            <div className="request-selected-teacher">
              <p>Requesting {selectedTeacher.name}</p>
              {!lockTeacher && (
                <button type="button" onClick={() => setSelectedTeacher(null)}>
                  Change
                </button>
              )}
            </div>

            <label>
              Topic
              <input
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Message
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
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
        )}
      </div>
    </div>
  );
}
