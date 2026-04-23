import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="page-stack">
      <h2>Book office hours and appointments without email chaos.</h2>
      <p>
        This starter includes public browsing, student dashboards, owner tools,
        and backend placeholders for booking flows.
      </p>
      <div className="action-row">
        <Link className="button" to="/register">
          Register
        </Link>
        <Link className="button button-secondary" to="/login">
          Login
        </Link>
      </div>
    </section>
  );
}
