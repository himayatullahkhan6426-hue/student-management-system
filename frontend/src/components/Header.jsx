function Header({ handleLogout }) {
return ( <header className="dashboard-header"> <div className="brand"> <div className="brand-icon">
G </div>

    <div>
      <h2>GPA Calculator</h2>

      <p>
        Student Academic Dashboard
      </p>
    </div>
  </div>

  <button
    className="logout-btn"
    onClick={handleLogout}
  >
    Logout
  </button>
</header>

);
}

export default Header;
