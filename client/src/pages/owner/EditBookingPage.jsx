import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../shared/api/api";
import "./EditBookingPage.css";

function toDateTimeInputValue(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  const offsetDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );
  return offsetDate.toISOString().slice(0, 16);
}

export default function EditBookingPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    visibility: "private",
    status: "open",
    capacity: 1,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        const booking = response.data.data;

        setFormData({
          title: booking.title || "",
          description: booking.description || "",
          startTime: toDateTimeInputValue(booking.startTime),
          endTime: toDateTimeInputValue(booking.endTime),
          visibility: booking.visibility || "private",
          status: booking.status || "open",
          capacity: booking.capacity || 1,
        });
      } catch (error) {
        console.error("Load booking error:", error);
        setMessage(error.response?.data?.message || "Failed to load booking.");
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [bookingId]);

  function handleChange(event) {
    const { name, type, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await api.patch(`/bookings/${bookingId}`, {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      });
      navigate("/owner/dashboard");
    } catch (error) {
      console.error("Update booking error:", error);
      setMessage(error.response?.data?.message || "Failed to update booking.");
    } finally {
      setSaving(false);
    }
  }


  return (
    <section className="edit-booking-page">
      <div className="edit-booking-header">
        <div>
          <h1>Edit Booking</h1>
          <p>Update the booking details for your dashboard.</p>
        </div>
        <Link to="/owner/dashboard">Back</Link>
      </div>

      {message && <p className="edit-booking-message">{message}</p>}

      <form className="edit-booking-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength={50}
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={200}
            rows="4"
          />
        </label>

        <div className="edit-booking-row">
          <label>
            Start
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            End
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="edit-booking-row">
          <label>
            Visibility
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </label>

          <label>
            Status
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="open">Open</option>
              <option value="reserved">Reserved</option>
            </select>
          </label>

          <label>
            Capacity
            <input
              type="number"
              min="1"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
            />
          </label>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save booking"}
        </button>
      </form>
    </section>
  );
}
