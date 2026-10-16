import React from "react";
import { getPerformanceLevel } from "../utils/gradeCalculations";

function CGPAAnalytics({ semesters, studentInfo }) {
  // Get latest cumulative stats from last semester
  const lastSem = semesters[semesters.length - 1] || {};
  const overallCGPA = lastSem.cgpa !== undefined ? lastSem.cgpa : 0;
  const totalCredits = lastSem.cch !== undefined ? lastSem.cch : 0;
  const totalPoints = lastSem.cgp !== undefined ? lastSem.cgp : 0;
  const performance = getPerformanceLevel(overallCGPA);

  // Calculate grade distribution
  const gradeCounts = {};
  let totalCourses = 0;
  semesters.forEach((sem) => {
    (sem.subjects || []).forEach((sub) => {
      totalCourses++;
      const g = (sub.grade || "Pending").trim();
      gradeCounts[g] = (gradeCounts[g] || 0) + 1;
    });
  });

  return (
    <div className="analytics-container">
      {/* Top 4 Metrics Cards */}
      <div className="analytics-metrics-grid">
        <div className="metric-stat-card primary-gradient">
          <div className="card-top-row">
            <span className="card-badge">CUMULATIVE GPA</span>
            <span className="card-icon">🎯</span>
          </div>
          <div className="big-stat-number">{overallCGPA.toFixed(2)}</div>
          <div className="stat-sub-text">Scale of 4.00</div>
          <div className="performance-pill-tag">{performance}</div>
        </div>

        <div className="metric-stat-card white-card">
          <div className="card-top-row">
            <span className="card-badge">COMPLETED CREDITS</span>
            <span className="card-icon">📚</span>
          </div>
          <div className="big-stat-number">{totalCredits.toFixed(2)}</div>
          <div className="stat-sub-text">Cumulative Credit Hours (CCH)</div>
          <div className="card-trend-badge">{totalCourses} Registered Courses</div>
        </div>

        <div className="metric-stat-card white-card">
          <div className="card-top-row">
            <span className="card-badge">TOTAL GRADE POINTS</span>
            <span className="card-icon">⭐</span>
          </div>
          <div className="big-stat-number">{totalPoints.toFixed(2)}</div>
          <div className="stat-sub-text">Cumulative Grade Points (CGP)</div>
          <div className="card-trend-badge">{semesters.length} Semesters Recorded</div>
        </div>

        <div className="metric-stat-card white-card">
          <div className="card-top-row">
            <span className="card-badge">DEGREE PROGRESS</span>
            <span className="card-icon">🎓</span>
          </div>
          <div className="big-stat-number">
            {Math.min(100, Math.round((totalCredits / 136) * 100))}%
          </div>
          <div className="stat-sub-text">Based on standard ~136 CH degree</div>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, (totalCredits / 136) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Semester by Semester Progression Table & Bars */}
      <div className="Box semester-progression-card">
        <div className="section-title">
          <div>
            <span className="section-label">PROGRESSION TRAJECTORY</span>
            <h3 className="heading">Semester-by-Semester GPA & CGPA Trend</h3>
          </div>
          <span className="subject-count">{semesters.length} Terms</span>
        </div>

        <div className="progression-bars-container">
          {semesters.map((sem, idx) => {
            const sgpa = sem.sgpa !== undefined ? sem.sgpa : 0;
            const cgpa = sem.cgpa !== undefined ? sem.cgpa : 0;
            const sgpaPct = (sgpa / 4.0) * 100;
            const cgpaPct = (cgpa / 4.0) * 100;

            return (
              <div key={sem.id || idx} className="term-progress-row">
                <div className="term-info-col">
                  <strong>{sem.name}</strong>
                  <small>
                    {sem.sch?.toFixed(1) || "0.0"} CH | {sem.subjects?.length || 0} courses
                  </small>
                </div>

                <div className="term-bar-col">
                  {/* SGPA Bar */}
                  <div className="bar-track">
                    <div
                      className="bar-fill sgpa-bar-fill"
                      style={{ width: `${sgpaPct}%` }}
                    >
                      <span className="bar-inner-label">SGPA: {sgpa.toFixed(2)}</span>
                    </div>
                  </div>
                  {/* CGPA Line / Indicator */}
                  <div className="bar-track cumulative-track">
                    <div
                      className="bar-fill cgpa-bar-fill"
                      style={{ width: `${cgpaPct}%` }}
                    >
                      <span className="bar-inner-label">CGPA: {cgpa.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="term-badges-col">
                  <span className="badge-sgpa-num">{sgpa.toFixed(2)}</span>
                  <span className="badge-cgpa-num">{cgpa.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="Box grade-dist-card">
        <div className="section-title">
          <div>
            <span className="section-label">GRADE COMPOSITION</span>
            <h3 className="heading">Course Grades Breakdown</h3>
          </div>
        </div>

        <div className="grades-chips-grid">
          {["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F", "Pending"].map(
            (g) => {
              const count = gradeCounts[g] || 0;
              return (
                <div key={g} className={`grade-chip-item ${count > 0 ? "active-chip" : ""}`}>
                  <span className="chip-grade-name">{g}</span>
                  <span className="chip-grade-count">{count}</span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export default CGPAAnalytics;
