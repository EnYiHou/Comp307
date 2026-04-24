import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <section className="landing-hero">
      <p>Booking application</p>
      <h1>COMP 307 Booking App</h1>
      <p>
        A simple place to discover availability, book appointments, and manage
        office-hour scheduling.
      </p>
      <div className="action-row">
        <Link className="button" to="/auth?mode=signup">
          Get started
        </Link>
        <Link className="button button-secondary" to="/auth?mode=login">
          Sign in
        </Link>
      </div>
    </section>
  );
}
