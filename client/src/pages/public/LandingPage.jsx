import { Link } from "react-router-dom";
import bookingDeskImage from "../../assets/landing/booking-desk.jpg";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-intro">
          <p className="landing-kicker">McGill booking</p>
          <h1>BERK</h1>
          <p className="landing-description">
            BERK helps students and staff arrange office hours, appointments,
            and group meetings without passing long email threads back and
            forth.
          </p>

          <div className="landing-actions">
            <Link
              className="landing-link landing-link-primary"
              to="/auth?mode=signup"
            >
              Create account
            </Link>
            <Link className="landing-link" to="/auth?mode=login">
              Sign in
            </Link>
          </div>
        </div>

        <img
          className="landing-image"
          src={bookingDeskImage}
          alt="A desk with a laptop calendar open for appointment planning"
        />
      </section>

      <section className="landing-notes" aria-label="What BERK does">
        <article>
          <h2>For students</h2>
          <p>Browse staff, book an available time, or request a custom meeting.</p>
        </article>
        <article>
          <h2>For staff</h2>
          <p>Create appointment slots, manage bookings, and share invite links.</p>
        </article>
        <article>
          <h2>For groups</h2>
          <p>Send a poll, collect availability, and choose the best meeting time.</p>
        </article>
      </section>
    </main>
  );
}
