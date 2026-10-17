import { useState } from "react";
import AuthTabs from "./AuthTabs";
import "./Login.css";

const API_URL =
  "https://student-management-system-d4cj.onrender.com";

function Login({ setPage, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);

        if (
          data.user.is_admin === 1 ||
          data.user.is_admin === true
        ) {
          setPage("admin");
        } else {
          setPage("software");
        }
      } else {
        setMessage(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modern-layout">

      {/* LEFT SECTION */}
      <section className="login-modern-intro">

        <div className="login-modern-orb login-orb-one"></div>
        <div className="login-modern-orb login-orb-two"></div>

        <div className="login-modern-intro-content">

          <div className="login-modern-brand">
            <div className="login-modern-brand-icon">
              <span>G</span>
            </div>

            <div className="login-modern-brand-text">
              <strong>Student Management</strong>
              <span>Academic Excellence Platform</span>
            </div>
          </div>

          <div className="login-modern-hero">

            <div className="login-modern-badge">
              <span className="login-modern-badge-dot"></span>
              YOUR ACADEMIC COMPANION
            </div>

            <h1>
              Your Academic
              <br />
              Journey,
              <br />
              <span>Beautifully Organized.</span>
            </h1>

            <p>
              Everything you need to manage your academic
              progress, calculate your GPA, and track your
              achievements — all in one powerful dashboard.
            </p>

            <div className="login-modern-features">

              <div className="login-modern-feature">
                <div className="login-feature-icon">✓</div>
                <span>Smart GPA & CGPA Tracking</span>
              </div>

              <div className="login-modern-feature">
                <div className="login-feature-icon">✓</div>
                <span>Academic Transcript Management</span>
              </div>

              <div className="login-modern-feature">
                <div className="login-feature-icon">✓</div>
                <span>Secure Student Dashboard</span>
              </div>

            </div>

          </div>

          <div className="login-modern-intro-footer">
            <span>✦</span>
            Designed for ambitious students
          </div>

        </div>
      </section>

      {/* RIGHT SECTION */}
      <section className="login-modern-form-section">

        <div className="login-modern-form-container">

          <div className="login-modern-form-top">
            <div className="login-modern-welcome-icon">
              <span>✦</span>
            </div>

            <span className="login-modern-form-eyebrow">
              WELCOME BACK
            </span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your credentials to continue your
              academic journey.
            </p>
          </div>

          <div className="login-modern-tabs">
            <AuthTabs
              page="login"
              setPage={setPage}
              setMessage={setMessage}
            />
          </div>

          <form
            className="login-modern-form"
            onSubmit={handleLogin}
          >

            {/* EMAIL */}
            <div className="login-modern-field">

              <label htmlFor="login-email">
                Email Address
              </label>

              <div className="login-modern-input-wrapper">

                <span className="login-modern-input-icon">
                  ✉
                </span>

                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMessage("");
                  }}
                  autoComplete="email"
                  required
                />

              </div>
            </div>

            {/* PASSWORD */}
            <div className="login-modern-field">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="login-modern-input-wrapper">

                <span className="login-modern-input-icon">
                  🔒
                </span>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setMessage("");
                  }}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-modern-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>
            </div>

            {/* ERROR */}
            {message && (
              <div
                className="login-modern-error"
                role="alert"
              >
                <span>⚠</span>
                <p>{message}</p>
              </div>
            )}

            {/* SUBMIT */}
            <button
              className="login-modern-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-modern-spinner"></span>
                  Signing you in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="login-modern-arrow">→</span>
                </>
              )}
            </button>

          </form>

          <div className="login-modern-form-footer">
            <div className="login-modern-security">
              <span>🔐</span>
              Secure authentication
            </div>

            <p>
              Your academic journey starts here.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;