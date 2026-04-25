import BookingSlotCreation from "../../features/booking/components/BookingSlotCreation";

export default function RecurringOfficeHoursPage() {
  return (
    <section className="page-stack">
      <h1>Recurring Office Hours</h1>
      <p>
        Choose bookable slots and set the weekly occurrence count. Each
        occurrence becomes a public or private slot students can reserve.
      </p>
      <BookingSlotCreation />
    </section>
  );
}
