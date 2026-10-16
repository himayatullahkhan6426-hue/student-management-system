import { useEffect, useState } from "react";

const API_URL =
  "https://student-management-system-d4cj.onrender.com";

function AdminDashboard({ setPage, setUser }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [userTranscript, setUserTranscript] = useState(null);
  const [grades, setGrades] = useState([]);
  const [message, setMessage] = useState("");

  const handleAdminLogout = () => {
    setUser(null);
    setPage("login");
  };

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const response = await fetch(
        API_URL + "/admin/users"
      );

      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not load users");
    }
  };

  const viewUser = async (userId) => {
    try {
      const response = await fetch(
        API_URL + "/admin/user/" + userId
      );

      const data = await response.json();

      if (response.ok) {
        setSelectedUser(data.user);
        setUserResults(data.results || []);
        setUserTranscript(data.transcript || null);
        setGrades([]);
        setMessage("");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not load user details");
    }
  };

  const viewGrades = async (resultId) => {
    try {
      const response = await fetch(
        API_URL +
          "/admin/result/" +
          resultId +
          "/grades"
      );

      const data = await response.json();

      if (response.ok) {
        setGrades(data);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not load subject grades");
    }
  };

  const deleteUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user and all their data?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        API_URL + "/admin/user/" + userId,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);

        setSelectedUser(null);
        setUserResults([]);
        setGrades([]);

        getUsers();
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not delete user");
    }
  };

  return (
    <div className="admin-dashboard">

      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage users and academic records</p>
        </div>

        <button
          className="admin-logout-button"
          onClick={handleAdminLogout}
        >
          Logout
        </button>
      </div>

      {message && (
        <p className="admin-message">
          {message}
        </p>
      )}

      <div className="admin-users-section">

        <h2>All Registered Users</h2>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (

          <div className="users-list">

            {users.map((user) => (

              <div
                className="admin-user-card"
                key={user.id}
              >

                <div className="admin-user-info">

                  <h3>
                    {user.name}
                  </h3>

                  <p>
                    {user.email}
                  </p>

                  {user.is_admin === 1 && (
                    <span className="admin-badge">
                      Admin
                    </span>
                  )}

                </div>

                <div className="admin-actions">

                  <button
                    className="view-button"
                    onClick={() => viewUser(user.id)}
                  >
                    View Details
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete User
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {selectedUser && (

        <div className="user-details">

          <h2>Student Profile & Academic Transcript</h2>

          <div className="profile-info">
            <p>
              <strong>Name:</strong> {selectedUser.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            {userTranscript?.studentInfo?.registrationNo && (
              <p>
                <strong>Registration No:</strong> {userTranscript.studentInfo.registrationNo}
              </p>
            )}
            {userTranscript?.studentInfo?.fatherName && (
              <p>
                <strong>Father's Name:</strong> {userTranscript.studentInfo.fatherName}
              </p>
            )}
            {userTranscript?.studentInfo?.program && (
              <p>
                <strong>Program:</strong> {userTranscript.studentInfo.program}
              </p>
            )}

            {userTranscript ? (
              <div style={{ marginTop: "14px", padding: "14px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#166534" }}>🎓 Saved Transcript Record (MySQL)</h4>
                <div style={{ display: "flex", gap: "20px", fontSize: "0.95rem" }}>
                  <span>CGPA: <strong style={{ color: "#15803d" }}>{userTranscript.cgpa}</strong></span>
                  <span>Total Credits: <strong>{userTranscript.totalCredits}</strong></span>
                  <span>Semesters: <strong>{userTranscript.semesters?.length || 0}</strong></span>
                </div>

                {userTranscript.semesters && (
                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {userTranscript.semesters.map((sem, sIdx) => (
                      <details key={sIdx} style={{ background: "#fff", padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                        <summary style={{ cursor: "pointer", fontWeight: "600", color: "#1e293b" }}>
                          {sem.name} ({sem.subjects?.length || 0} subjects)
                        </summary>
                        <div style={{ marginTop: "8px", fontSize: "0.85rem" }}>
                          {(sem.subjects || []).map((sub, subIdx) => (
                            <div key={subIdx} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed #f1f5f9" }}>
                              <span>{sub.code ? `${sub.code} - ` : ""}{sub.title}</span>
                              <span><strong>{sub.grade || "In Progress"}</strong> ({sub.credits} CH)</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ marginTop: "10px", color: "#64748b", fontStyle: "italic" }}>
                No multi-semester transcript saved to MySQL for this student yet.
              </p>
            )}
          </div>

          <h2>GPA Results</h2>

          {userResults.length === 0 ? (

            <p>This user has not calculated GPA yet.</p>

          ) : (

            userResults.map((result) => (

              <div
                className="admin-result-card"
                key={result.id}
              >

                <div>

                  <h3>
                    GPA: {result.total_gpa}
                  </h3>

                  <p>
                    Performance: {result.performance_level}
                  </p>

                </div>

                <button
                  className="grades-button"
                  onClick={() => viewGrades(result.id)}
                >
                  View Subject Grades
                </button>

              </div>

            ))

          )}

          {grades.length > 0 && (

            <div className="grades-section">

              <h2>Subject Grades</h2>

              <div className="grades-list">

                {grades.map((subject, index) => (

                  <div
                    className="admin-grade-row"
                    key={index}
                  >

                    <span className="subject-name">
                      {subject.subject_name}
                    </span>

                    <span className="subject-grade">
                      Grade: {subject.grade}
                    </span>

                    <span className="subject-credit">
                      Credits: {subject.credit_hours}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;