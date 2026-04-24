import { Link, useSearchParams } from "react-router-dom";
import "./AuthPage.css";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const isSignup = mode === "signup";

  function handleLoginSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    console.log("Login submitted:", { email, password });
  }

  function handleSignupSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm-password");

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    console.log("Sign up submitted:", { email, password });
  }

  let loginForm = (
    <form className="auth-page_form" onSubmit={handleLoginSubmit}>
      <div>
        <h2> Login to your account</h2>
      </div>
      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" required />

      <label htmlFor="password">Password</label>
      <input type="password" id="password" name="password" required />
      <button className="button" type="submit">
        Login
      </button>
    </form>
  );

  let signupForm = (
    <form className="auth-page_form" onSubmit={handleSignupSubmit}>
      <div>
        <h2> Sign up for a new account</h2>
      </div>
      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" required />

      <label htmlFor="password">Password</label>
      <input type="password" id="password" name="password" required />

      <label htmlFor="confirm-password">Confirm Password</label>
      <input
        type="password"
        id="confirm-password"
        name="confirm-password"
        required
      />
      <button className="button" type="submit">
        Sign Up
      </button>
    </form>
  );

  return (
    <section className="auth-page">
      <Link className="auth-page_home" to="/">
        Home
      </Link>

      {isSignup ? signupForm : loginForm}

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
