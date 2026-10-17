import { useEffect, useState, useMemo, useCallback } from "react";
import "./AdminDashboard.css";

const API_URL =
  "https://student-management-system-d4cj.onrender.com";

function AdminDashboard({ setPage, setUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [userTranscript, setUserTranscript] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const isAdmin = (user) =>
    user?.is_admin === 1 ||
    user?.is_admin === true ||
    user?.is_admin === "1";

  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleAdminLogout = () => {
    setUser(null);
    setPage("login");
  };

  // FETCH ALL USERS

  const getUsers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/users`);

      const data = await response.json();

      if (response.ok) {
        setUsers(Array.isArray(data) ? data : []);
      } else {
        showMessage(data.message || "Could not load users.");
      }
    } catch (error) {
      console.error(error);
      showMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // FILTER USERS

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        (user.name || "").toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "students" && !isAdmin(user)) ||
        (filter === "admins" && isAdmin(user));

      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  // STATISTICS

  const stats = useMemo(() => {
    const admins = users.filter(isAdmin).length;

    return {
      total: users.length,
      students: users.length - admins,
      admins,
    };
  }, [users]);

  // VIEW USER

  const viewUser = async (userId) => {
    setDetailsLoading(true);
    setSelectedUser(null);
    setUserResults([]);
    setUserTranscript(null);
    setGrades([]);
    setSelectedResultId(null);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/admin/user/${userId}`
      );

      const data = await response.json();

      if (response.ok) {
        setSelectedUser(data.user);
        setUserResults(data.results || []);
        setUserTranscript(data.transcript || null);

        // Scroll to details on mobile
        setTimeout(() => {
          document
            .getElementById("admin-student-details")
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }, 100);
      } else {
        showMessage(data.message || "Could not load user details.");
      }
    } catch (error) {
      console.error(error);
      showMessage("Unable to load student details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  // VIEW SUBJECT GRADES

  const viewGrades = async (resultId) => {
    if (selectedResultId === resultId) {
      setSelectedResultId(null);
      setGrades([]);
      return;
    }

    setGradesLoading(true);
    setSelectedResultId(resultId);
    setGrades([]);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/admin/result/${resultId}/grades`
      );

      const data = await response.json();

      if (response.ok) {
        setGrades(Array.isArray(data) ? data : []);
      } else {
        showMessage(data.message || "Could not load grades.");
      }
    } catch (error) {
      console.error(error);
      showMessage("Unable to load subject grades.");
    } finally {
      setGradesLoading(false);
    }
  };

  // DELETE USER

  const deleteUser = async (userId) => {
    const user = users.find((item) => item.id === userId);

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${
        user?.name || "this user"
      } and all their academic records?`
    );

    if (!confirmed) return;

    setDeletingId(userId);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/admin/user/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        showMessage(
          data.message || "User deleted successfully.",
          "success"
        );

        if (selectedUser?.id === userId) {
          setSelectedUser(null);
          setUserResults([]);
          setUserTranscript(null);
          setGrades([]);
          setSelectedResultId(null);
        }

        await getUsers();
      } else {
        showMessage(data.message || "Could not delete user.");
      }
    } catch (error) {
      console.error(error);
      showMessage("Unable to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  // AVATAR INITIALS

  const getInitials = (name = "") => {
    return (
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "U"
    );
  };

  return (
    <div className="adm-dashboard">

      {/* HEADER */}

      <header className="adm-header">
        <div className="adm-header-content">

          <div className="adm-brand">
            <div className="adm-brand-icon">✦</div>

            <div>
              <span className="adm-brand-label">
                STUDENT MANAGEMENT SYSTEM
              </span>

              <h1>Admin Dashboard</h1>

              <p>
                Manage students, academic records and performance.
              </p>
            </div>
          </div>

          <div className="adm-header-actions">
            <span className="adm-admin-status">
              <span className="adm-status-dot"></span>
              Administrator
            </span>

            <button
              className="adm-logout-btn"
              onClick={handleAdminLogout}
            >
              <span>↪</span>
              Logout
            </button>
          </div>

        </div>
      </header>

      <main className="adm-main">

        {/* WELCOME */}

        <div className="adm-welcome">
          <div>
            <span className="adm-eyebrow">
              OVERVIEW
            </span>

            <h2>Dashboard Overview</h2>

            <p>
              Monitor registered users and manage academic information.
            </p>
          </div>

          <button
            className="adm-refresh-btn"
            onClick={getUsers}
            disabled={loading}
          >
            <span>↻</span>
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* STATISTICS */}

        <div className="adm-stats-grid">

          <div className="adm-stat-card adm-stat-purple">
            <div className="adm-stat-top">
              <span className="adm-stat-icon">👥</span>
              <span className="adm-stat-trend">ALL</span>
            </div>

            <div className="adm-stat-number">
              {stats.total}
            </div>

            <div className="adm-stat-label">
              Total Registered Users
            </div>

            <div className="adm-stat-bottom">
              All platform accounts
            </div>
          </div>

          <div className="adm-stat-card adm-stat-blue">
            <div className="adm-stat-top">
              <span className="adm-stat-icon">🎓</span>
              <span className="adm-stat-trend">STUDENTS</span>
            </div>

            <div className="adm-stat-number">
              {stats.students}
            </div>

            <div className="adm-stat-label">
              Student Accounts
            </div>

            <div className="adm-stat-bottom">
              Registered students
            </div>
          </div>

          <div className="adm-stat-card adm-stat-cyan">
            <div className="adm-stat-top">
              <span className="adm-stat-icon">🛡</span>
              <span className="adm-stat-trend">ADMINS</span>
            </div>

            <div className="adm-stat-number">
              {stats.admins}
            </div>

            <div className="adm-stat-label">
              Administrators
            </div>

            <div className="adm-stat-bottom">
              Administrative accounts
            </div>
          </div>

        </div>

        {/* ALERT */}

        {message && (
          <div
            className={`adm-alert adm-alert-${messageType}`}
            role="alert"
          >
            <span>
              {messageType === "success" ? "✓" : "⚠"}
            </span>

            <p>{message}</p>

            <button
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* USERS SECTION */}

        <section className="adm-panel">

          <div className="adm-panel-heading">
            <div>
              <span className="adm-eyebrow">
                USER MANAGEMENT
              </span>

              <h2>Registered Users</h2>

              <p>
                View, search and manage platform accounts.
              </p>
            </div>

            <span className="adm-count-badge">
              {filteredUsers.length} Users
            </span>
          </div>

          {/* SEARCH AND FILTER */}

          <div className="adm-toolbar">

            <div className="adm-search-box">
              <span className="adm-search-icon">⌕</span>

              <input
                type="search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search users"
              />
            </div>

            <div className="adm-filter-tabs">
              <button
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All Users
              </button>

              <button
                className={filter === "students" ? "active" : ""}
                onClick={() => setFilter("students")}
              >
                Students
              </button>

              <button
                className={filter === "admins" ? "active" : ""}
                onClick={() => setFilter("admins")}
              >
                Admins
              </button>
            </div>

          </div>

          {/* USERS LIST */}

          {loading ? (
            <div className="adm-loading-state">
              <div className="adm-loader"></div>
              <p>Loading registered users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="adm-empty-state">
              <div className="adm-empty-icon">⌕</div>

              <h3>No users found</h3>

              <p>
                {search || filter !== "all"
                  ? "Try changing your search or filter."
                  : "No users are registered yet."}
              </p>
            </div>
          ) : (
            <div className="adm-users-list">

              {filteredUsers.map((user) => (
                <div
                  className={`adm-user-card ${
                    selectedUser?.id === user.id
                      ? "adm-user-selected"
                      : ""
                  }`}
                  key={user.id}
                >

                  <div className="adm-user-profile">

                    <div className="adm-avatar">
                      {getInitials(user.name)}
                    </div>

                    <div className="adm-user-text">
                      <div className="adm-user-name-row">
                        <h3>{user.name || "Unnamed User"}</h3>

                        <span
                          className={
                            isAdmin(user)
                              ? "adm-role-badge adm-role-admin"
                              : "adm-role-badge adm-role-student"
                          }
                        >
                          {isAdmin(user) ? "Admin" : "Student"}
                        </span>
                      </div>

                      <p>{user.email}</p>

                      <span className="adm-user-id">
                        User ID: #{user.id}
                      </span>
                    </div>

                  </div>

                  <div className="adm-user-actions">

                    <button
                      className="adm-view-btn"
                      onClick={() => viewUser(user.id)}
                      disabled={detailsLoading}
                    >
                      View Details
                      <span>→</span>
                    </button>

                    <button
                      className="adm-delete-btn"
                      onClick={() => deleteUser(user.id)}
                      disabled={deletingId === user.id}
                    >
                      {deletingId === user.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* DETAILS LOADING */}

        {detailsLoading && (
          <div className="adm-panel adm-details-loading">
            <div className="adm-loader"></div>
            <p>Loading student academic records...</p>
          </div>
        )}

        {/* STUDENT DETAILS */}

        {selectedUser && (
          <section
            className="adm-panel adm-details-panel"
            id="admin-student-details"
          >

            <div className="adm-panel-heading">

              <div>
                <span className="adm-eyebrow">
                  STUDENT INFORMATION
                </span>

                <h2>Student Profile & Academic Records</h2>

                <p>
                  Detailed student information and saved performance.
                </p>
              </div>

              <button
                className="adm-close-btn"
                onClick={() => {
                  setSelectedUser(null);
                  setUserResults([]);
                  setUserTranscript(null);
                  setGrades([]);
                  setSelectedResultId(null);
                }}
              >
                ✕ Close
              </button>

            </div>

            {/* PROFILE */}

            <div className="adm-profile-card">

              <div className="adm-profile-header">

                <div className="adm-avatar adm-avatar-large">
                  {getInitials(selectedUser.name)}
                </div>

                <div>
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>

                  <span className="adm-role-badge adm-role-student">
                    {isAdmin(selectedUser) ? "Admin" : "Student"}
                  </span>
                </div>

              </div>

              <div className="adm-profile-grid">

                <div className="adm-info-item">
                  <span>Registration Number</span>
                  <strong>
                    {userTranscript?.studentInfo?.registrationNo ||
                      "Not provided"}
                  </strong>
                </div>

                <div className="adm-info-item">
                  <span>Father's Name</span>
                  <strong>
                    {userTranscript?.studentInfo?.fatherName ||
                      "Not provided"}
                  </strong>
                </div>

                <div className="adm-info-item">
                  <span>Program</span>
                  <strong>
                    {userTranscript?.studentInfo?.program ||
                      "Not provided"}
                  </strong>
                </div>

                <div className="adm-info-item">
                  <span>User ID</span>
                  <strong>#{selectedUser.id}</strong>
                </div>

              </div>

            </div>

            {/* TRANSCRIPT */}

            <div className="adm-subsection">

              <div className="adm-subsection-heading">
                <div>
                  <h3>🎓 Academic Transcript</h3>
                  <p>
                    Saved multi-semester academic record.
                  </p>
                </div>
              </div>

              {userTranscript ? (
                <div className="adm-transcript-card">

                  <div className="adm-transcript-stats">

                    <div className="adm-transcript-stat">
                      <span>CGPA</span>
                      <strong>
                        {userTranscript.cgpa ?? "0.00"}
                      </strong>
                    </div>

                    <div className="adm-transcript-stat">
                      <span>Total Credits</span>
                      <strong>
                        {userTranscript.totalCredits ?? 0}
                      </strong>
                    </div>

                    <div className="adm-transcript-stat">
                      <span>Semesters</span>
                      <strong>
                        {userTranscript.semesters?.length || 0}
                      </strong>
                    </div>

                  </div>

                  <div className="adm-semesters-list">

                    {(userTranscript.semesters || []).map(
                      (semester, index) => (
                        <details
                          className="adm-semester-details"
                          key={semester.id || index}
                        >

                          <summary>
                            <span className="adm-semester-icon">
                              📚
                            </span>

                            <span className="adm-semester-name">
                              {semester.name ||
                                `Semester ${index + 1}`}
                            </span>

                            <span className="adm-semester-count">
                              {semester.subjects?.length || 0} Subjects
                            </span>

                            <span className="adm-chevron">⌄</span>
                          </summary>

                          <div className="adm-semester-content">

                            <div className="adm-table-scroll">

                              <table className="adm-subject-table">
                                <thead>
                                  <tr>
                                    <th>Code</th>
                                    <th>Subject</th>
                                    <th>Credits</th>
                                    <th>Grade</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {(semester.subjects || []).map(
                                    (subject, subjectIndex) => (
                                      <tr
                                        key={
                                          subject.id || subjectIndex
                                        }
                                      >
                                        <td>
                                          {subject.code || "—"}
                                        </td>

                                        <td>
                                          {subject.title || "—"}
                                        </td>

                                        <td>
                                          {subject.credits ?? 0}
                                        </td>

                                        <td>
                                          <span className="adm-grade-badge">
                                            {subject.grade || "Pending"}
                                          </span>
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>

                            </div>

                          </div>

                        </details>
                      )
                    )}

                  </div>

                </div>
              ) : (
                <div className="adm-empty-record">
                  <span>📄</span>
                  <p>
                    No saved multi-semester transcript found
                    for this student.
                  </p>
                </div>
              )}

            </div>

            {/* GPA RESULTS */}

            <div className="adm-subsection">

              <div className="adm-subsection-heading">
                <div>
                  <h3>📊 GPA Results</h3>
                  <p>
                    Student GPA calculation history.
                  </p>
                </div>

                <span className="adm-count-badge">
                  {userResults.length} Results
                </span>
              </div>

              {userResults.length === 0 ? (
                <div className="adm-empty-record">
                  <span>📈</span>
                  <p>
                    This student has not calculated GPA yet.
                  </p>
                </div>
              ) : (
                <div className="adm-results-list">

                  {userResults.map((result) => (
                    <div
                      className="adm-result-card"
                      key={result.id}
                    >

                      <div className="adm-result-main">

                        <div className="adm-result-icon">
                          📈
                        </div>

                        <div>
                          <span className="adm-result-label">
                            GPA RESULT
                          </span>

                          <h4>
                            GPA: {result.total_gpa}
                          </h4>

                          <p>
                            Performance:{" "}
                            <strong>
                              {result.performance_level ||
                                "Not available"}
                            </strong>
                          </p>
                        </div>

                      </div>

                      <button
                        className="adm-grades-btn"
                        onClick={() => viewGrades(result.id)}
                      >
                        {selectedResultId === result.id
                          ? "Hide Grades"
                          : "View Grades"}
                      </button>

                      {selectedResultId === result.id && (
                        <div className="adm-result-grades">

                          {gradesLoading ? (
                            <div className="adm-inline-loading">
                              Loading subject grades...
                            </div>
                          ) : grades.length === 0 ? (
                            <p className="adm-no-grades">
                              No subject grades found.
                            </p>
                          ) : (
                            <div className="adm-table-scroll">

                              <table className="adm-subject-table">
                                <thead>
                                  <tr>
                                    <th>Subject</th>
                                    <th>Grade</th>
                                    <th>Credits</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {grades.map((subject, index) => (
                                    <tr key={index}>
                                      <td>
                                        {subject.subject_name}
                                      </td>

                                      <td>
                                        <span className="adm-grade-badge">
                                          {subject.grade}
                                        </span>
                                      </td>

                                      <td>
                                        {subject.credit_hours}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  ))}

                </div>
              )}

            </div>

          </section>
        )}

        {/* FOOTER */}

        <footer className="adm-footer">
          <span>
            © {new Date().getFullYear()} Student Management System
          </span>

          <span>
            Administration Panel
          </span>
        </footer>

      </main>

    </div>
  );
}

export default AdminDashboard;