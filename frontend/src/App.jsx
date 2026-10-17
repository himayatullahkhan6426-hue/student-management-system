import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("sms_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState(() => {
    try {
      const savedUser = localStorage.getItem("sms_user");
      const savedPage = localStorage.getItem("sms_page");
      if (savedUser && (savedPage === "software" || savedPage === "admin")) {
        return savedPage;
      }
    } catch {}
    return "login";
  });

  const handleSetUser = (newUser) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem("sms_user", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("sms_user");
      }
    } catch {}
  };

  const handleSetPage = (newPage) => {
    setPage(newPage);
    try {
      localStorage.setItem("sms_page", newPage);
    } catch {}
  };

  const handleLogout = () => {
    setUser(null);
    setPage("login");
    try {
      localStorage.removeItem("sms_user");
      localStorage.removeItem("sms_page");
    } catch {}
  };

  if (page === "admin") {
    if (!user || user.is_admin !== 1) {
      handleSetPage("login");
      return null;
    }

    return (
      <AdminDashboard
        setPage={handleSetPage}
        setUser={handleSetUser}
      />
    );
  }

  if (page === "software") {
    return (
      <Dashboard
        user={user}
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-container">
        {page === "login" ? (
          <Login
            setPage={handleSetPage}
            setUser={handleSetUser}
          />
        ) : (
          <Register setPage={handleSetPage} />
        )}
      </section>
    </main>
  );
}

export default App;
