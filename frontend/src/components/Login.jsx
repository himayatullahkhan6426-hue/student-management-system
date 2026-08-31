import { useState } from "react";
import AuthTabs from "./AuthTabs";

const API_URL =
  "https://student-management-system-production-4448.up.railway.app";

function Login({ setPage, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        API_URL + "/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

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
        setMessage(data.message);
      }

    } catch (error) {
      console.log(error);
      setMessage("Could not connect to server.");
    }
  };

  return (
    <>
      <div className="auth-intro">
        <div className="logo">
          <span>G</span>
        </div>

        <span className="intro-label">
          STUDENT MANAGEMENT SYSTEM
        </span>

        <h1>
          Manage Your
          <span> Academic Performance.</span>
        </h1>

        <p>
          Log in securely and calculate your GPA
          using your personal dashboard.
        </p>

        <div className="intro-features">
          <div>
            <span>✓</span>
            Secure Authentication
          </div>

          <div>
            <span>✓</span>
            GPA Calculation
          </div>

          <div>
            <span>✓</span>
            Student Dashboard
          </div>
        </div>
      </div>

      <div className="auth-card">
        <AuthTabs
          page="login"
          setPage={setPage}
          setMessage={setMessage}
        />

        <form onSubmit={handleLogin}>
          <div className="form-heading">
            <h2>Welcome Back</h2>

            <p>
              Enter your details to access your dashboard.
            </p>
          </div>

          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            className="auth-button"
            type="submit"
          >
            Login to Dashboard →
          </button>
        </form>

        {message && (
          <div className="message">
            {message}
          </div>
        )}
      </div>
    </>
  );
}

export default Login;