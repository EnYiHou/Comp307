// EnYi Hou (261165635)

import { Link } from "react-router-dom";
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
          src="/images/booking-desk.jpg"
        />
      </section>

      <section className="landing-notes">
        <article>
          <h2>For students</h2>
          <p>Browse staff, book an available time, or request a custom meeting.</p>
        </article>
        <article>
          <h2>For staff</h2>
          <p>Create appointment slots, manage bookings, and share your profile link.</p>
        </article>
        <article>
          <h2>For groups</h2>
          <p>Send a poll, collect availability, and choose the best meeting time.</p>
        </article>
      </section>
    </main>
  );
}
