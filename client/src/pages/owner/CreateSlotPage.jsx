// Bogdan Timercan

import BookingSlotCreation from "../../features/booking/components/BookingSlotCreation";

export default function CreateSlotPage() {
  return (
    <section className="page-stack">
      <h2>Create Availability</h2>
      <p>
        Publish bookable appointment times or collect group availability with a
        guided setup.
      </p>
      <BookingSlotCreation />
    </section>
  );
}
