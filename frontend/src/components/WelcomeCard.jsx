import React, { useState, useRef, useEffect } from "react";

function WelcomeCard({
  studentInfo,
  latestCGPA,
  totalCredits,
  totalSemesters,
  user,
  handleLogout,
  activeTab,
  setActiveTab,
  currentDepartment,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const studentInitial = (studentInfo?.studentName || user?.name || "S").charAt(0).toUpperCase();
  const displayName = studentInfo?.studentName || user?.name || "Student";
  const displayReg = studentInfo?.registrationNo || user?.email || "";
  const displayProgram = studentInfo?.program || currentDepartment?.name || "Engineering & Computer Science";
  const isProfileActive = activeTab === "profile";

  return (
    <section className="welcome-card no-print">
      <div className="welcome-content">
        <span className="welcome-label">STUDENT MANAGEMENT SYSTEM</span>

        <h1>
          Welcome, {displayName}! 🎓
        </h1>

        <p className="welcome-subtitle">
          {displayProgram} • Reg: {displayReg}
        </p>

        <div className="welcome-stats-row">
          <div className="welcome-stat-badge">
            <span className="ws-lbl">Cumulative GPA:</span>
            <span className="ws-val highlight-val">{latestCGPA.toFixed(2)} / 4.00</span>
          </div>
          <div className="welcome-stat-badge">
            <span className="ws-lbl">Total Credits:</span>
            <span className="ws-val">{totalCredits.toFixed(2)} CH</span>
          </div>
          <div className="welcome-stat-badge">
            <span className="ws-lbl">Semesters:</span>
            <span className="ws-val">{totalSemesters}</span>
          </div>
        </div>
      </div>

      <div className="welcome-avatar-side" ref={menuRef}>
          <button
            type="button"
            className={`profile-avatar-btn ${isProfileActive ? "profile-active-tab" : ""} ${isMenuOpen ? "menu-open" : ""}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            title="Click to view Student Profile & Account options"
          >
            <div className="user-avatar">
              👤
              {isProfileActive && (
                <span className="avatar-online-dot" title="Student Profile Active" />
              )}

            </div>
          </button>

        {/* Professional Profile Dropdown Popover */}
        {isMenuOpen && (
          <div className="profile-dropdown-menu" role="menu">
            {/* Header / User Card */}
            <div className="profile-dropdown-header">
              <div className="profile-dropdown-avatar">
                {studentInitial}
              </div>
              <div className="profile-dropdown-user-info">
                <div className="profile-dropdown-name" title={displayName}>
                  {displayName}
                </div>
                {displayReg && (
                  <div className="profile-dropdown-reg" title={displayReg}>
                    {displayReg}
                  </div>
                )}
                <span className="profile-dropdown-dept-badge">
                  {currentDepartment?.name}
                </span>
              </div>
            </div>

            {/* Academic Snapshot inside Profile Popover */}
            <div className="profile-academic-summary">
              <div className="profile-academic-stat">
                <span className="stat-label">CGPA</span>
                <span className="stat-value highlight">{latestCGPA.toFixed(2)}</span>
              </div>
              <div className="stat-divider" />
              <div className="profile-academic-stat">
                <span className="stat-label">Credits</span>
                <span className="stat-value">{totalCredits.toFixed(1)} CH</span>
              </div>
              <div className="stat-divider" />
              <div className="profile-academic-stat">
                <span className="stat-label">Semesters</span>
                <span className="stat-value">{totalSemesters}</span>
              </div>
            </div>

            <div className="profile-dropdown-divider" />

            {/* Navigation item: Student Profile */}
          
              <button
                type="button"
                className={`profile-action-btn ${isProfileActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("profile");
                  setIsMenuOpen(false);
                }}
              >
                <div className="profile-action-icon">👤</div>
                <div className="profile-action-text">
                  <span className="profile-action-title">Student Profile</span>
                  <span className="profile-action-desc">
                    Personal records, institution & transcript credentials
                  </span>
                </div>
                {isProfileActive ? (
                  <span className="profile-active-tag">Current View</span>
                ) : (
                  <span className="profile-action-arrow">→</span>
                )}
              </button>

            <div className="profile-dropdown-divider" />

            {/* Logout Action */}
            <button
              type="button"
              className="profile-logout-action-btn"
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
            >
              <div className="profile-logout-icon">🚪</div>
              <div className="profile-logout-text">
                <span className="profile-logout-title">
                  Log Out ({user?.name ? user.name.split(" ")[0] : "Account"})
                </span>
                <span className="profile-logout-desc">Safely end your session</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default WelcomeCard;
