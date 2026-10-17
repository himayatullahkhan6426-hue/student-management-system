import { useState, useEffect, useRef } from "react";
import AuthTabs from "./AuthTabs";
import "./Login.css";
import "./Register.css";

const API_URL =
  "https://student-management-system-d4cj.onrender.com";

function Register({ setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(false);
  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  // Calculate password strength
  const getPasswordStrength = (value) => {
    if (!value) return 0;

    let strength = 0;

    if (value.length >= 8) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[^A-Za-z0-9]/.test(value)) strength++;

    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  const strengthLabels = [
    "",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];

  const handleRegister = async (event) => {
    event.preventDefault();

    if (loading) return;

    setMessage("");
    setMessageType("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          data.message ||
            "Account created successfully! Redirecting to login..."
        );

        setMessageType("success");

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        redirectTimer.current = setTimeout(() => {
          setPage("login");
        }, 1500);
      } else {
        setMessage(
          data.message || "Registration failed. Please try again."
        );
        setMessageType("error");
      }
    } catch (error) {
      console.error("Registration error:", error);

      setMessage("Unable to connect to server. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modern-layout register-modern-layout">

      {/* LEFT INTRO SECTION */}

      <section className="login-modern-intro register-modern-intro">

        <div className="login-modern-orb login-orb-one"></div>
        <div className="login-modern-orb login-orb-two"></div>

        <div className="login-modern-intro-content">

          {/* BRAND */}

          <div className="login-modern-brand">

            <div className="login-modern-brand-icon">
              <span>G</span>
            </div>

            <div className="login-modern-brand-text">
              <strong>Student Management</strong>
              <span>Academic Excellence Platform</span>
            </div>

          </div>

          {/* HERO */}

          <div className="login-modern-hero">

            <div className="login-modern-badge">
              <span className="login-modern-badge-dot"></span>
              START YOUR ACADEMIC JOURNEY
            </div>

            <h1>
              Your Future
              <br />
              Starts
              <br />
              <span>Right Here.</span>
            </h1>

            <p>
              Create your personal student account and take
              complete control of your academic performance.
              Track your grades, calculate your GPA, and
              manage your academic journey effortlessly.
            </p>

            <div className="login-modern-features">

              <div className="login-modern-feature">
                <div className="login-feature-icon">✓</div>
                <span>Smart GPA & CGPA Calculator</span>
              </div>

              <div className="login-modern-feature">
                <div className="login-feature-icon">✓</div>
                <span>Professional Academic Transcripts</span>
              </div>

              <div className="login-modern-feature">
                <div className="login-feature-icon">✓</div>
                <span>Personalized Student Dashboard</span>
              </div>

            </div>

          </div>

          <div className="login-modern-intro-footer">
            <span>✦</span>
            Your success begins with one step
          </div>

        </div>
      </section>

      {/* RIGHT REGISTER SECTION */}

      <section className="login-modern-form-section register-modern-form-section">

        <div className="login-modern-form-container">

          {/* HEADING */}

          <div className="login-modern-form-top">

            <div className="login-modern-welcome-icon">
              <span>✦</span>
            </div>

            <span className="login-modern-form-eyebrow">
              GET STARTED
            </span>

            <h2>Create your account</h2>

            <p>
              Join the platform and start managing your
              academic performance.
            </p>

          </div>

          {/* LOGIN / REGISTER TABS */}

          <div className="login-modern-tabs">
            <AuthTabs
              page="register"
              setPage={setPage}
              setMessage={setMessage}
            />
          </div>

          {/* REGISTER FORM */}

          <form
            className="login-modern-form register-modern-form"
            onSubmit={handleRegister}
          >

            {/* FULL NAME */}

            <div className="login-modern-field">

              <label htmlFor="register-name">
                Full Name
              </label>

              <div className="login-modern-input-wrapper">

                <span className="login-modern-input-icon">
                  ♙
                </span>

                <input
                  id="register-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  maxLength={100}
                  required
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="login-modern-field">

              <label htmlFor="register-email">
                Email Address
              </label>

              <div className="login-modern-input-wrapper">

                <span className="login-modern-input-icon">
                  ✉
                </span>

                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="login-modern-field">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="login-modern-input-wrapper">

                <span className="login-modern-input-icon">
                  🔒
                </span>

                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="login-modern-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
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

              {/* PASSWORD STRENGTH */}

              {password && (
                <div className="register-password-strength">

                  <div className="register-strength-bars">
                    {[1, 2, 3, 4].map((level) => (
                      <span
                        key={level}
                        className={`register-strength-bar ${
                          passwordStrength >= level
                            ? `strength-${passwordStrength}`
                            : ""
                        }`}
                      />
                    ))}
                  </div>

                  <div className="register-strength-text">
                    <span>Password strength</span>

                    <strong
                      className={`strength-text-${passwordStrength}`}
                    >
                      {strengthLabels[passwordStrength]}
                    </strong>
                  </div>

                </div>
              )}

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="login-modern-field">

              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>

              <div className="login-modern-input-wrapper">

                <span className="login-modern-input-icon">
                  🔐
                </span>

                <input
                  id="register-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="login-modern-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>

              </div>

              {confirmPassword && (
                <span
                  className={`register-password-match ${
                    password === confirmPassword
                      ? "matched"
                      : "not-matched"
                  }`}
                >
                  {password === confirmPassword
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </span>
              )}

            </div>

            {/* SUCCESS / ERROR MESSAGE */}

            {message && (
              <div
                className={
                  messageType === "success"
                    ? "register-success-message"
                    : "login-modern-error"
                }
                role={messageType === "error" ? "alert" : "status"}
              >
                <span>
                  {messageType === "success" ? "✓" : "⚠"}
                </span>

                <p>{message}</p>
              </div>
            )}

            {/* REGISTER BUTTON */}

            <button
              className="login-modern-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-modern-spinner"></span>
                  Creating your account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="login-modern-arrow">→</span>
                </>
              )}
            </button>

          </form>

          {/* FOOTER */}

          <div className="login-modern-form-footer">

            <div className="login-modern-security">
              <span>🔐</span>
              Secure account registration
            </div>

            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="register-login-link"
                onClick={() => setPage("login")}
              >
                Sign in
              </button>
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Register;