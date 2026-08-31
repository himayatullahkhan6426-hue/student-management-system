import { useState } from "react";
import AuthTabs from "./AuthTabs";

const API_URL =
  "https://student-management-system-production-4448.up.railway.app";

function Register({ setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        API_URL + "/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (response.ok) {
        setName("");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          setPage("login");
        }, 1000);
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
          Build Your
          <span> Academic Journey.</span>
        </h1>

        <p>
          Create your account and start managing
          your academic performance.
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
          page="register"
          setPage={setPage}
          setMessage={setMessage}
        />

        <form onSubmit={handleRegister}>
          <div className="form-heading">
            <h2>Create Account</h2>

            <p>
              Start managing your academic performance.
            </p>
          </div>

          <div className="input-group">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />
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
              placeholder="Create a password"
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
            Create Account →
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

export default Register;