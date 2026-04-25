export default function InstructionsPage() {
  return (
    <section className="page-stack">
      <h1>How BERK Works</h1>
      <p>
        BERK is a McGill-only booking application for students, professors, and
        teaching assistants.
      </p>

      <h2>Registration</h2>
      <p>
        Register with a McGill email address. Accounts ending in @mcgill.ca are
        owners who can create availability. Accounts ending in @mail.mcgill.ca
        are student users who can reserve appointments.
      </p>

      <h2>For Students</h2>
      <p>
        Use Book Appointments to browse owners with active public slots, reserve
        a time, email the owner, or delete your appointment from My
        Appointments. Use Request Meeting when you need a custom time.
      </p>

      <h2>For Owners</h2>
      <p>
        Create Availability to add private or public slots. Manage Slots lets
        you activate, edit, delete, and inspect who booked each slot. Invite
        Links generates direct URLs for slides or emails.
      </p>

      <h2>Group Meetings</h2>
      <p>
        Owners create group polls with candidate times. Invited users vote from
        their dashboard, and owners finalize the best time from the Owner
        Dashboard.
      </p>
    </section>
  );
}
