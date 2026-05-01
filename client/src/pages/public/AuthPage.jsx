// EnYi Hou (261165635)

import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../features/auth/useAuth.js";
import "./AuthPage.css";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, loading, user } = useAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const isSignup = mode === "signup";
  const [error, setError] = useState(null);

  if (loading) {
    return <p>Checking your session...</p>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      if (isSignup) {
        const username = formData.get("username");
        const confirmPassword = formData.get("confirm-password");

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        await register({ username, email, password });
      } else {
        await login({ email, password });
      }

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Authentication failed.",
      );
    }
  }

  return (
    <section className="auth-page">
      <Link className="auth-page_home" to="/">
        Home
      </Link>

      <form className="auth-page_form" onSubmit={handleSubmit}>
        <h2>
          {isSignup ? "Sign up for a new account" : "Login to your account"}
        </h2>
        {isSignup && (
          <>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              maxLength={50}
              required
            />
          </>
        )}
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" maxLength={255} required />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          maxLength={128}
          required
        />
        {isSignup && (
          <>
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              maxLength={128}
              required
            />
          </>
        )}

        {error && (
          <div className="auth-page_error">
            <p>{error}</p>
          </div>
        )}

        <button className="button" type="submit">
          {isSignup ? "Sign Up" : "Login"}
        </button>
      </form>

      <div className="auth-page_switch">
        <span>
          {isSignup ? "Already have an account?  " : "Need an account?  "}
        </span>
        <Link to={`/auth?mode=${isSignup ? "login" : "signup"}`}>
          {isSignup ? "Login" : "Sign up"}
        </Link>
      </div>
    </section>
  );
}
