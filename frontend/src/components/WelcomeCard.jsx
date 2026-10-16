import React from "react";

function WelcomeCard({ studentInfo, latestCGPA, totalCredits, totalSemesters, onQuickPrint }) {
  return (
    <section className="welcome-card no-print">
      <div className="welcome-content">
        <span className="welcome-label">STUDENT MANAGEMENT SYSTEM</span>

        <h1>
          Welcome, {studentInfo.studentName || "Student"}! 🎓
        </h1>

        <p className="welcome-subtitle">
          {studentInfo.program || "Engineering And Computer Science"} • Reg: {studentInfo.registrationNo || ""}
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

      <div className="welcome-avatar-side">
        <div className="user-avatar">
          {(studentInfo.studentName || "S").charAt(0).toUpperCase()}
        </div>
        <button
          type="button"
          className="welcome-print-btn"
          onClick={onQuickPrint}
        >
          📄 Print Transcript
        </button>
      </div>
    </section>
  );
}

export default WelcomeCard;
