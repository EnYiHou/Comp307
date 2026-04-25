import BookingSlotCreation from "../../features/booking/components/BookingSlotCreation";
import UserInvites from "../../features/booking/components/UserInvites";

export default function CreateSlotPage() {
  return (
    <section className="page-stack">
      <h2>Create Booking Slot</h2>
      <p>
        Build a one-on-one slot or a group availability poll directly from the
        owner dashboard.
      </p>
      <BookingSlotCreation />
      <UserInvites />
    </section>
  );
}
