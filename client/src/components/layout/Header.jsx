import { Link, NavLink } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="app-header">
      <NavLink className="app-header_brand" to="/">
        BERK
      </NavLink>

      <nav className="app-header_nav">
        <Link className="app-header_login" to="/auth?mode=login">
          Login
        </Link>
        <Link className="app-header_signup" to="/auth?mode=signup">
          Sign Up
        </Link>
      </nav>
    </header>
  );
}
