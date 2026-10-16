import React from "react";

function Header({
  activeTab,
  setActiveTab,
  handleLogout,
  onPrint,
  currentDepartment,
  onOpenDeptModal,
  user,
  onSaveToCloud,
  cloudStatus,
  isSaving,
}) {
  return (
    <header className="dashboard-header no-print">
      <div className="brand">
        <div className="brand-icon">
          <span>🎓</span>
        </div>
        <div>
          <h2>UET Academic & Transcript Portal</h2>
          <div className="brand-dept-tag" onClick={onOpenDeptModal} title="Click to change academic department">
            <span>{currentDepartment?.name || "Software Engineering"}</span>
            <small>▼</small>
          </div>
        </div>
      </div>

      <nav className="header-nav-tabs">
        <button
          type="button"
          className={`nav-tab-item ${activeTab === "transcript" ? "active" : ""}`}
          onClick={() => setActiveTab("transcript")}
        >
          📄 Transcript Preview
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === "semesters" ? "active" : ""}`}
          onClick={() => setActiveTab("semesters")}
        >
          📝 Semesters & Subjects
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === "scheme" ? "active" : ""}`}
          onClick={() => setActiveTab("scheme")}
        >
          📚 Scheme of Studies (8 Sem)
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === "planner" ? "active" : ""}`}
          onClick={() => setActiveTab("planner")}
        >
          🎯 Target CGPA Forecaster
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          👤 Student Profile
        </button>
        <button
          type="button"
          className={`nav-tab-item ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          📊 Analytics
        </button>
      </nav>

      <div className="header-right-actions">
        {cloudStatus && (
          <span className="cloud-status-indicator" title="Database Sync Status">
            {cloudStatus}
          </span>
        )}
        {onSaveToCloud && (
          <button
            type="button"
            className="save-cloud-nav-btn"
            onClick={onSaveToCloud}
            disabled={isSaving}
            title="Save your personal transcript to MySQL Database"
          >
            {isSaving ? "⏳ Saving..." : "💾 Save to Cloud"}
          </button>
        )}
        <button
          type="button"
          className="print-nav-btn"
          onClick={onPrint}
          title="Print or Save official PDF"
        >
          🖨️ Print PDF
        </button>
        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout ({user?.name ? user.name.split(" ")[0] : "Student"})
        </button>
      </div>
    </header>
  );
}

export default Header;
