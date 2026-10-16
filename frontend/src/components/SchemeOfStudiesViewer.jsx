import React, { useState } from "react";
import { SOFTWARE_ENGINEERING_SCHEME } from "../utils/departmentSchemes";

function SchemeOfStudiesViewer({ onApplyFullScheme, onAddCourseToSemester, currentSemesters = [] }) {
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const currentSchemeSemester =
    SOFTWARE_ENGINEERING_SCHEME.find((s) => s.semesterIndex === selectedSemesterIndex) ||
    SOFTWARE_ENGINEERING_SCHEME[0];

  const filteredCourses = (currentSchemeSemester.courses || []).filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="scheme-viewer-container">
      {/* Top Banner Card */}
      <div className="scheme-header-card Box">
        <div className="scheme-banner-top">
          <div>
            <span className="section-label">OFFICIAL CURRICULUM</span>
            <h2 className="heading">Engineering Program (Software Engineering)</h2>
            <h3 className="scheme-subtitle">Scheme of Studies — UET Peshawar</h3>
          </div>
          <div className="scheme-total-badge">
            <span className="total-lbl">Total Degree Credits:</span>
            <span className="total-val">135 Credit Hours</span>
          </div>
        </div>

        <p className="sub-desc" style={{ marginTop: "12px" }}>
          View the complete 8-semester course roadmap with credit hours and contact hours. You can apply the full 8-semester scheme directly to your transcript or add specific courses.
        </p>

        <div className="scheme-actions-bar">
          <button
            type="button"
            className="action-btn primary-btn"
            onClick={onApplyFullScheme}
          >
            🚀 Load Full 8-Semester Scheme into Transcript
          </button>
          <div className="search-wrap">
            <input
              type="text"
              placeholder="🔍 Search course code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="scheme-search-input"
            />
          </div>
        </div>
      </div>

      {/* Semester Selection Tabs (1 to 8) */}
      <div className="scheme-tabs-bar">
        {SOFTWARE_ENGINEERING_SCHEME.map((sem) => (
          <button
            type="button"
            key={sem.semesterIndex}
            className={`scheme-tab-item ${
              sem.semesterIndex === selectedSemesterIndex ? "active" : ""
            }`}
            onClick={() => {
              setSelectedSemesterIndex(sem.semesterIndex);
              setSearchTerm("");
            }}
          >
            <span className="scheme-tab-num">Sem {sem.semesterIndex}</span>
            <span className="scheme-tab-ch">{sem.totalCredits} CH</span>
          </button>
        ))}
      </div>

      {/* Scheme Semester Table */}
      <div className="scheme-table-card Box">
        <div className="scheme-table-header-info">
          <div>
            <h3 className="scheme-sem-title">
              {currentSchemeSemester.name} ({currentSchemeSemester.term} Term)
            </h3>
            <span className="scheme-meta-hint">
              Total Contact Hours: <strong>{currentSchemeSemester.totalContactHours}</strong> | Total Credit Hours: <strong>{currentSchemeSemester.totalCredits}</strong>
            </span>
          </div>
        </div>

        <div className="scheme-courses-table">
          <div className="scheme-th-row">
            <div className="col-sc-num">#</div>
            <div className="col-sc-code">Course Code</div>
            <div className="col-sc-title">Course Title</div>
            <div className="col-sc-ch">Credit Hours</div>
            <div className="col-sc-contact">Contact Hours</div>
            <div className="col-sc-action">Action</div>
          </div>

          <div className="scheme-tbody">
            {filteredCourses.map((c, i) => (
              <div key={c.code + i} className="scheme-tr-row">
                <div className="col-sc-num">{i + 1}</div>
                <div className="col-sc-code">
                  <span className="code-badge">{c.code}</span>
                </div>
                <div className="col-sc-title">{c.title}</div>
                <div className="col-sc-ch">
                  <strong>{c.credits.toFixed(1)}</strong>
                </div>
                <div className="col-sc-contact">{c.contactHours} hrs/wk</div>
                <div className="col-sc-action">
                  <button
                    type="button"
                    className="action-btn secondary-btn small"
                    onClick={() => onAddCourseToSemester(c, currentSchemeSemester.name)}
                    title={`Add ${c.code} to current active semester`}
                  >
                    + Add to Term
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Notes from Official Document */}
        <div className="scheme-official-notes">
          <p>
            * <em>Codes *** will be assigned based on the elective course offered.</em>
          </p>
          <p>
            * <em>Total Degree Credit Hours = 135 (PEC / HEC accredited Software Engineering Curriculum).</em>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SchemeOfStudiesViewer;
