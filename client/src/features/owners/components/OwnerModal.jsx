import { acceptBooking, getOwnerBookings } from "../../booking/bookingService.js";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth.js";
import "./owner.css";

function formatTime(dateValue) {
  return new Date(dateValue).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSpotsAvailable(booking) {
  return booking.capacity - (booking.participants?.length || 0);
}

function BookingSlotCard({ booking, isSelected, onSelect }) {
  const spotsAvailable = getSpotsAvailable(booking);

  return (
    <button
      className={`owner-booking-slot${isSelected ? " is-selected" : ""}`}
      type="button"
      onClick={() => onSelect(booking)}
      aria-pressed={isSelected}
    >
      <span className="owner-booking-slot_title">{booking.title}</span>
      {booking.description && (
        <span className="owner-booking-slot_description">
          {booking.description}
        </span>
      )}
      <span className="owner-booking-slot_meta">
        {formatTime(booking.startTime)} - {formatTime(booking.endTime)} -{" "}
        {spotsAvailable} {spotsAvailable === 1 ? "spot" : "spots"} available
      </span>
    </button>
  );
}

function DateBookings({
  bookings,
  selectedDate,
  selectedBooking,
  onSelectDate,
  onSelectBooking,
}) {
  const groupedByDate = bookings.reduce((acc, booking) => {
    const date = new Date(booking.startTime).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {});

  if (bookings.length === 0) {
    return <p className="owner-modal_empty">No available bookings.</p>;
  }

  return (
    <div className="owner-booking-list">
      {Object.entries(groupedByDate).map(([date, dateBookings]) => (
        <div className="owner-booking-date" key={date}>
          <button
            className="owner-booking-date-button"
            type="button"
            onClick={() => onSelectDate(selectedDate === date ? null : date)}
          >
            {date}
            <span>{dateBookings.length} slots</span>
          </button>

          {selectedDate === date && (
            <div className="owner-booking-slots">
              {dateBookings.map((booking) => (
                <BookingSlotCard
                  key={booking._id}
                  booking={booking}
                  isSelected={selectedBooking?._id === booking._id}
                  onSelect={onSelectBooking}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function OwnerModal({
  owner,
  onClose,
  onNotify,
  onBookingSuccess,
}) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchBookings = async () => {
      try {
        const ownerBookings = await getOwnerBookings(owner._id, user?.id);
        if (isMounted) {
          const now = new Date();
          const futureBookings = Array.isArray(ownerBookings)
            ? ownerBookings.filter((b) => new Date(b.startTime) > now)
            : [];
          setBookings(futureBookings);
        }
      } catch {
        if (isMounted) {
          setBookings([]);
        }
        onNotify?.("Failed to load available bookings.", "error");
      }
    };

    fetchBookings();
    return () => {
      isMounted = false;
    };
  }, [onNotify, owner._id, user?.id]);

  const handleBookAppointment = async () => {
    if (!selectedBooking || !user || isBooking) {
      return;
    }

    setIsBooking(true);

    try {
      const response = await acceptBooking(selectedBooking._id);
      onNotify?.(response.message || "Booking accepted successfully.", "success");
      setSelectedBooking(null);
      onBookingSuccess?.();
      onClose();
    } catch (error) {
      onNotify?.(
        error.response?.data?.message || "Failed to take booking.",
        "error",
      );
      setIsBooking(false);
    }
  };

  return (
    <div className="owner-modal-backdrop" onClick={onClose}>
      <section
        className="owner-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="owner-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="owner-modal_header">
          <button
            className="owner-modal_close-button"
            aria-label="Close owner details"
            onClick={onClose}
          >
            X
          </button>
        </div>
        <h2 id="owner-modal-title">{owner.name}</h2>
        <p>{owner.email}</p>

        <div className="owner-modal_content">
          <h3>Available bookings</h3>
          <DateBookings
            bookings={bookings}
            selectedDate={selectedDate}
            selectedBooking={selectedBooking}
            onSelectDate={setSelectedDate}
            onSelectBooking={setSelectedBooking}
          />
        </div>

        <button
          className="owner-modal_book-button"
          type="button"
          onClick={handleBookAppointment}
          disabled={!selectedBooking || !user || isBooking}
        >
          {isBooking ? "Booking..." : "Book Selected Appointment"}
        </button>
      </section>
    </div>
  );
}
