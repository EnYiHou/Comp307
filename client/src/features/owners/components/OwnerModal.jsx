import { acceptBooking, getOwnerBookings } from "../../booking/bookingService.js";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth.js";
import "./owner.css";

function BookingTime({ booking, onSelect }) {
  const formattedTime = new Date(booking.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button type="button" onClick={() => onSelect(booking)}>
      {formattedTime}
    </button>
  );
}
function DateBookings({ bookings, selectedDate, onSelectDate, onSelectBooking }) {
  const groupedByDate = bookings.reduce((acc, booking) => {
    const date = new Date(booking.startTime).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(groupedByDate).map(([date, dateBookings]) => (
        <div key={date}>
          <button
            type="button"
            onClick={() => onSelectDate(selectedDate === date ? null : date)}
          >
            {date}
          </button>

          {selectedDate === date && (
            <ul>
              {dateBookings.map((booking) => (
                <BookingTime
                  key={booking._id}
                  booking={booking}
                  onSelect={onSelectBooking}
                />
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function OwnerModal({ owner, onClose }) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const ownerBookings = await getOwnerBookings(owner._id, user?.id);
      setBookings(ownerBookings);
    };

    fetchBookings();
  }, [owner._id, user?.id]);

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
            onSelectDate={setSelectedDate}
            onSelectBooking={setSelectedBooking}
          />
        </div>

        <button
          type="button"
          onClick={async () => {
            if (selectedBooking && user) {
              await acceptBooking(selectedBooking._id, user.id);
              setSelectedBooking(null);
            }
          }}
          disabled={!selectedBooking || !user}
        >
          Book Appointment
        </button>
      </section>
    </div>
  );
}
