import BookingSlotCreation from "../../features/booking/components/BookingSlotCreation";

export default function GroupMeetingSetupPage() {
  return (
    <section className="page-stack">
      <h1>Group Meeting Setup</h1>
      <p>
        Select Group poll in the form below, invite users, and choose candidate
        times. Invitees vote from their dashboard and you finalize the best time.
      </p>
      <BookingSlotCreation />
    </section>
  );
}
