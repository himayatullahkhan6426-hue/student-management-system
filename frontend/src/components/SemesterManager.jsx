import React, { useState } from "react";
import { GRADE_OPTIONS, GRADE_POINTS } from "../utils/gradeCalculations";
import { SOFTWARE_ENGINEERING_SCHEME } from "../utils/departmentSchemes";

function SemesterManager({
  semesters,
  setSemesters,
  onLoadSample,
  onLoadFull8Semesters,
  onReset,
  currentDepartment,
  onOpenDeptModal,
  onSaveToCloud,
  isSaving,
}) {
  const [newSemesterName, setNewSemesterName] = useState("");
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [activeTabId, setActiveTabId] = useState(semesters[0]?.id || "");
  const [showQuickAddSchemeModal, setShowQuickAddSchemeModal] = useState(false);

  // Fallback to first semester if active tab is invalid
  const currentSemester = semesters.find((s) => s.id === activeTabId) || semesters[0];

  const handleAddSemester = (e) => {
    e.preventDefault();
    const name = newSemesterName.trim() || `Semester ${semesters.length + 1}`;
    const newSem = {
      id: "sem-" + Date.now(),
      name,
      subjects: [
        {
          id: "sub-" + Date.now(),
          code: "",
          title: "",
          credits: 3.0,
          grade: "A",
        },
      ],
    };
    setSemesters([...semesters, newSem]);
    setActiveTabId(newSem.id);
    setNewSemesterName("");
    setShowAddSemesterModal(false);
  };

  const handleDeleteSemester = (semId, e) => {
    e.stopPropagation();
    if (semesters.length <= 1) {
      alert("You must keep at least one semester.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this semester?")) {
      const updated = semesters.filter((s) => s.id !== semId);
      setSemesters(updated);
      if (activeTabId === semId) {
        setActiveTabId(updated[0]?.id || "");
      }
    }
  };

  const handleSemesterNameChange = (semId, newName) => {
    setSemesters(
      semesters.map((s) => (s.id === semId ? { ...s, name: newName } : s))
    );
  };

  const handleAddSubject = (semId) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          const newSub = {
            id: "sub-" + Date.now(),
            code: "",
            title: "",
            credits: 3.0,
            grade: "A",
          };
          return { ...sem, subjects: [...sem.subjects, newSub] };
        }
        return sem;
      })
    );
  };

  const handleSubjectChange = (semId, subId, field, value) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          const updatedSubs = sem.subjects.map((sub) => {
            if (sub.id === subId) {
              return { ...sub, [field]: value };
            }
            return sub;
          });
          return { ...sem, subjects: updatedSubs };
        }
        return sem;
      })
    );
  };

  const handleDeleteSubject = (semId, subId) => {
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === semId) {
          return {
            ...sem,
            subjects: sem.subjects.filter((sub) => sub.id !== subId),
          };
        }
        return sem;
      })
    );
  };

  // Quick import a course from scheme into current semester
  const handleQuickAddCourseFromScheme = (course) => {
    if (!currentSemester) return;
    const newSub = {
      id: "sub-" + Date.now() + Math.random(),
      code: course.code,
      title: course.title,
      credits: course.credits,
      grade: "A",
    };
    setSemesters(
      semesters.map((sem) => {
        if (sem.id === currentSemester.id) {
          return { ...sem, subjects: [...sem.subjects, newSub] };
        }
        return sem;
      })
    );
    setShowQuickAddSchemeModal(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = "Semester,Code,Title,Credit Hours,Grade,Points\n";
    semesters.forEach((sem) => {
      (sem.subjects || []).forEach((sub) => {
        const gp = GRADE_POINTS[sub.grade] !== undefined ? GRADE_POINTS[sub.grade] : 0;
        const pts = (parseFloat(sub.credits) || 0) * gp;
        csv += `"${sem.name}","${sub.code}","${sub.title}","${sub.credits}","${sub.grade || ""}","${pts.toFixed(2)}"\n`;
      });
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `academic_transcript_courses.csv`;
    a.click();
  };

  return (
    <div className="semester-manager-container">
      {/* Top Controls Toolbar */}
      <div className="manager-header-card Box">
        <div className="manager-title-box">
          <div className="dept-tag-row">
            <span className="section-label">CURRICULUM & GRADE MANAGER</span>
            <span className="current-dept-badge">
              Department: <strong>{currentDepartment?.name || "Software Engineering"}</strong>
            </span>
            <button
              type="button"
              className="change-dept-btn"
              onClick={onOpenDeptModal}
            >
              🔄 Switch Department
            </button>
          </div>
          <h2 className="heading">Semester & Course Administration</h2>
          <p className="sub-desc">
            Manually enter subjects, course codes, credit hours, and grades. All GPAs and overall CGPA update in real-time.
          </p>
        </div>

        <div className="manager-action-buttons">
          <button
            type="button"
            className="action-btn secondary-btn"
            onClick={onLoadSample}
            title="Load Fall 2024 to Spring 2026 actual transcript"
          >
            📋 Load Himayat's 4-Sem Sample
          </button>
          <button
            type="button"
            className="action-btn primary-btn"
            onClick={onLoadFull8Semesters}
            title="Load full 8-semester Software Engineering curriculum (135 Credits)"
          >
            🎓 Load Full 8-Sem Scheme
          </button>
          {onSaveToCloud && (
            <button
              type="button"
              className="action-btn success-btn"
              onClick={onSaveToCloud}
              disabled={isSaving}
              style={{ background: "#10b981", color: "#fff", fontWeight: "700" }}
              title="Save your semesters and subjects to the database"
            >
              {isSaving ? "⏳ Saving..." : "💾 Save to Database"}
            </button>
          )}
          <button
            type="button"
            className="action-btn secondary-btn"
            onClick={() => setShowAddSemesterModal(true)}
          >
            ➕ Add Semester
          </button>
          <button
            type="button"
            className="action-btn secondary-btn"
            onClick={handleExportCSV}
            title="Export courses data to CSV"
          >
            📥 Export CSV
          </button>
          <button
            type="button"
            className="action-btn danger-outline-btn"
            onClick={onReset}
            title="Clear all courses and start fresh"
          >
            🔄 Reset All
          </button>
        </div>
      </div>

      {/* Add Semester Modal */}
      {showAddSemesterModal && (
        <div className="modal-overlay" onClick={() => setShowAddSemesterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Semester</h3>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowAddSemesterModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSemester}>
              <div className="modal-body">
                <label className="input-label">Semester Title / Term</label>
                <input
                  type="text"
                  placeholder="e.g. Fall 2024, Spring 2025, Semester 5"
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                  className="text-input"
                  autoFocus
                />
                <div className="quick-suggestions">
                  <span className="suggestion-label">Quick Suggestions:</span>
                  {["Fall 2024", "Spring 25", "Fall 25", "Spring 26", "Fall 26", "Spring 27"].map(
                    (term) => (
                      <button
                        type="button"
                        key={term}
                        className="suggestion-pill"
                        onClick={() => setNewSemesterName(term)}
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="action-btn text-btn"
                  onClick={() => setShowAddSemesterModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn primary-btn">
                  Create Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add From Scheme Modal */}
      {showQuickAddSchemeModal && (
        <div className="modal-overlay" onClick={() => setShowQuickAddSchemeModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Select Course from Official Scheme of Studies</h3>
                <p className="sub-desc" style={{ margin: "4px 0 0 0" }}>
                  Click any course below to add it directly to {currentSemester?.name}.
                </p>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowQuickAddSchemeModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body scheme-course-picker-list">
              {SOFTWARE_ENGINEERING_SCHEME.map((sem) => (
                <div key={sem.name} className="picker-sem-group">
                  <h4 className="picker-sem-title">{sem.name} ({sem.term})</h4>
                  <div className="picker-courses-grid">
                    {sem.courses.map((c) => (
                      <div
                        key={c.code}
                        className="picker-course-badge"
                        onClick={() => handleQuickAddCourseFromScheme(c)}
                      >
                        <strong>{c.code}</strong>
                        <span>{c.title}</span>
                        <small>{c.credits} CH</small>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="action-btn text-btn"
                onClick={() => setShowQuickAddSchemeModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Semester Tabs Navigation */}
      <div className="semester-tabs-container">
        <div className="semester-tabs-scroll">
          {semesters.map((sem, idx) => {
            const isActive = sem.id === currentSemester?.id;
            return (
              <div
                key={sem.id}
                className={`sem-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTabId(sem.id)}
              >
                <div className="tab-title-line">
                  <span className="sem-number-pill">{idx + 1}</span>
                  <span className="tab-name">{sem.name}</span>
                </div>
                <div className="tab-metrics-mini">
                  <span className="sgpa-badge">
                    SGPA: {(sem.sgpa !== undefined ? sem.sgpa : 0).toFixed(2)}
                  </span>
                  <span className="cgpa-badge">
                    CGPA: {(sem.cgpa !== undefined ? sem.cgpa : 0).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            className="add-sem-tab-quick"
            onClick={() => setShowAddSemesterModal(true)}
            title="Add a new semester"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Active Semester Editor Card */}
      {currentSemester && (
        <div className="active-semester-editor Box">
          {/* Semester Header with Editable Name and Stats */}
          <div className="semester-editor-header">
            <div className="sem-name-edit-wrap">
              <span className="sem-badge-order">
                Semester {semesters.findIndex((s) => s.id === currentSemester.id) + 1} of{" "}
                {semesters.length}
              </span>
              <input
                type="text"
                className="sem-title-input"
                value={currentSemester.name}
                onChange={(e) =>
                  handleSemesterNameChange(currentSemester.id, e.target.value)
                }
                placeholder="Semester Name"
                title="Click to rename this semester"
              />
            </div>

            {/* Semester Live GPA Metrics */}
            <div className="sem-header-stats">
              <div className="metric-pill">
                <span className="metric-title">SCH</span>
                <span className="metric-value">
                  {(currentSemester.sch !== undefined ? currentSemester.sch : 0).toFixed(2)}
                </span>
              </div>
              <div className="metric-pill">
                <span className="metric-title">SGP</span>
                <span className="metric-value">
                  {(currentSemester.sgp !== undefined ? currentSemester.sgp : 0).toFixed(2)}
                </span>
              </div>
              <div className="metric-pill highlight">
                <span className="metric-title">SGPA</span>
                <span className="metric-value">
                  {(currentSemester.sgpa !== undefined ? currentSemester.sgpa : 0).toFixed(2)}
                </span>
              </div>
              <div className="metric-pill cgpa-highlight-pill">
                <span className="metric-title">CGPA</span>
                <span className="metric-value">
                  {(currentSemester.cgpa !== undefined ? currentSemester.cgpa : 0).toFixed(2)}
                </span>
              </div>

              {/* Delete Semester */}
              <button
                type="button"
                className="delete-sem-btn"
                onClick={(e) => handleDeleteSemester(currentSemester.id, e)}
                title="Delete this semester"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Subjects Table List */}
          <div className="subjects-table-manager">
            <div className="table-header-row">
              <div className="th-num">#</div>
              <div className="th-code">Course Code</div>
              <div className="th-title">Course Title / Subject</div>
              <div className="th-credits">Credit Hours (CH)</div>
              <div className="th-grade">Grade</div>
              <div className="th-points">Points (CH × GP)</div>
              <div className="th-action">Action</div>
            </div>

            <div className="table-body-rows">
              {currentSemester.subjects.map((sub, idx) => {
                const credits = parseFloat(sub.credits) || 0;
                const gp =
                  sub.grade && GRADE_POINTS[sub.grade] !== undefined
                    ? GRADE_POINTS[sub.grade]
                    : null;
                const points = gp !== null ? (credits * gp).toFixed(2) : "--";

                return (
                  <div key={sub.id || idx} className="subject-edit-row">
                    <div className="td-num">
                      <span className="sub-idx-circle">{String(idx + 1).padStart(2, "0")}</span>
                    </div>

                    <div className="td-code">
                      <input
                        type="text"
                        className="sub-input code-input"
                        placeholder="e.g. SE 102"
                        value={sub.code}
                        onChange={(e) =>
                          handleSubjectChange(currentSemester.id, sub.id, "code", e.target.value)
                        }
                      />
                    </div>

                    <div className="td-title">
                      <input
                        type="text"
                        className="sub-input title-input"
                        placeholder="e.g. Computer Programming"
                        value={sub.title}
                        onChange={(e) =>
                          handleSubjectChange(currentSemester.id, sub.id, "title", e.target.value)
                        }
                      />
                    </div>

                    <div className="td-credits">
                      <input
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        className="sub-input credits-input"
                        placeholder="3.0"
                        value={sub.credits}
                        onChange={(e) =>
                          handleSubjectChange(
                            currentSemester.id,
                            sub.id,
                            "credits",
                            e.target.value === "" ? "" : parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div className="td-grade">
                      <select
                        className="sub-select grade-select"
                        value={sub.grade}
                        onChange={(e) =>
                          handleSubjectChange(currentSemester.id, sub.id, "grade", e.target.value)
                        }
                      >
                        {GRADE_OPTIONS.map((opt) => (
                          <option key={opt.label} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="td-points">
                      <span className="points-text">{points}</span>
                    </div>

                    <div className="td-action">
                      <button
                        type="button"
                        className="delete-sub-btn"
                        onClick={() => handleDeleteSubject(currentSemester.id, sub.id)}
                        title="Delete subject"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state if no subjects */}
            {currentSemester.subjects.length === 0 && (
              <div className="empty-subjects-placeholder">
                <p>No subjects in this semester yet.</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="action-btn primary-btn small"
                    onClick={() => handleAddSubject(currentSemester.id)}
                  >
                    ➕ Add Blank Subject
                  </button>
                  <button
                    type="button"
                    className="action-btn secondary-btn small"
                    onClick={() => setShowQuickAddSchemeModal(true)}
                  >
                    📖 Pick from Scheme of Studies
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Subject Button Bar */}
          <div className="add-subject-bar">
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                type="button"
                className="action-btn add-sub-btn"
                onClick={() => handleAddSubject(currentSemester.id)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Custom Course
              </button>

              <button
                type="button"
                className="action-btn secondary-btn"
                onClick={() => setShowQuickAddSchemeModal(true)}
              >
                📖 Add from Scheme of Studies
              </button>
            </div>

            <span className="total-subjects-count">
              {currentSemester.subjects.length} Course{currentSemester.subjects.length !== 1 ? "s" : ""} in {currentSemester.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SemesterManager;
