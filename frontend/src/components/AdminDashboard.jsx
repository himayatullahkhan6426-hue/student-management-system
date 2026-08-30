import { useEffect, useState } from "react";

function AdminDashboard({ setPage, setUser }) {
const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [userResults, setUserResults] = useState([]);
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
"http://localhost:5000/admin/users"
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
"http://localhost:5000/admin/user/" + userId
);

  const data = await response.json();

  if (response.ok) {
    setSelectedUser(data.user);
    setUserResults(data.results);
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
"http://localhost:5000/admin/result/" +
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
    "http://localhost:5000/admin/user/" + userId,
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

return ( <div className="admin-dashboard">

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

      <h2>User Profile</h2>

      <div className="profile-info">

        <p>
          <strong>Name:</strong>
          {" "}
          {selectedUser.name}
        </p>

        <p>
          <strong>Email:</strong>
          {" "}
          {selectedUser.email}
        </p>

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
