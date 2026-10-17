import React from "react";

function Contents({
  activeTab,
  setActiveTab,
  currentDepartment,
  onOpenDeptModal,
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
          <h2>Academic & Transcript Portal</h2>
          <div className="brand-dept-tag" onClick={onOpenDeptModal} title="Click to change academic department">
            <span>{currentDepartment?.name}</span>
            <small>▼</small>
          </div>
        </div>
      </div>

      <nav className="header-nav-tabs">

        <button
          type="button"
          className={`nav-tab-item ${activeTab === "semesters" ? "active" : ""}`}
          onClick={() => setActiveTab("semesters")}
        >
          📝 Semesters & Subjects
        </button>

        <button
          type="button"
          className={`nav-tab-item ${activeTab === "transcript" ? "active" : ""}`}
          onClick={() => setActiveTab("transcript")}
        >
          📄 Transcript Preview
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
            className="print-nav-btn"
            onClick={onSaveToCloud}
            disabled={isSaving}
            title="Save your personal transcript to MySQL Database"
          >
            {isSaving ? "⏳ Saving..." : "💾 Save to Cloud"}
          </button>
        )}
        
      </div>
    </header>
  );
}

export default Contents;
