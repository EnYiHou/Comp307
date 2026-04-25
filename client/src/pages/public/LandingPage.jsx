import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <main className="landing-page">
    <section className="landing-hero">
        <div className="hero-copy">
          <p className="landing-eyebrow">McGill University</p>

          <h1>
            A better way to book office hours.
          </h1>

          <p className="landing-description">
            SOCS Booking helps students, professors, and teaching assistants
            coordinate appointments, office hours, and group meetings without
            long email threads.
          </p>

          <div className="action-row">
            <Link className="button button-primary" to="/auth?mode=signup">
              Get started
            </Link>

            <Link className="button button-secondary" to="/owners">
              Browse availability
            </Link>
          </div>

          <div className="trust-row">
            <span>McGill email access</span>
            <span>Owner-managed slots</span>
            <span>Student booking dashboard</span>
          </div>
        </div>

        <aside className="hero-visual">
          <div className="visual-glow" />

          <div className="schedule-card main-card">
            <div className="card-top">
              <div>
                <p className="card-kicker">Today</p>
                <h2>Available Office Hours</h2>
              </div>
            </div>

            <div className="owner-card">
              <div className="owner-avatar">MC</div>
              <div>
                <strong>Prof. Vybihal</strong>
                <p>Comp 307 · Web development</p>
              </div>
            </div>

            <div className="slot-list">
              <div className="slot-card active">
                <div>
                  <strong>10:00 AM</strong>
                  <span>30 minute appointment</span>
                </div>
                <p>Available</p>
              </div>

              <div className="slot-card active">
                <div>
                  <strong>1:30 PM</strong>
                  <span>30 minute appointment</span>
                </div>
                <p>Available</p>
              </div>

              <div className="slot-card booked">
                <div>
                  <strong>3:00 PM</strong>
                  <span>Reserved by student</span>
                </div>
                <p>Booked</p>
              </div>
            </div>
          </div>

          
        </aside>
      </section>

      <section className="landing-features">
        <article className="feature-card">
          <span className="feature-icon">01</span>
          <h3>Book faster</h3>
          <p>
            Students can browse available office-hour slots and reserve a time
            without sending extra emails.
          </p>
        </article>

        <article className="feature-card featured">
          <span className="feature-icon">02</span>
          <h3>Manage availability</h3>
          <p>
            Professors and TAs can create private slots, activate public
            availability, and track who booked each appointment.
          </p>
        </article>

        <article className="feature-card">
          <span className="feature-icon">03</span>
          <h3>Stay organized</h3>
          <p>
            Dashboards keep upcoming bookings, cancellations, and appointment
            actions in one clear place.
          </p>
        </article>
      </section>
    </main>
  );
}
