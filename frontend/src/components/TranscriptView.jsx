import React, { useRef, useState } from "react";

function TranscriptView({ studentInfo, semesters, onPrint }) {
  const [layoutMode, setLayoutMode] = useState("exact"); // "exact" (460px left aligned as in photo) or "full"
  const transcriptRef = useRef(null);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="transcript-wrapper">
      {/* Action Bar (Hidden during print) */}
      <div className="transcript-toolbar no-print">
        <div className="toolbar-info">
          <span className="badge-official">100% Verified UET Format</span>
          <span className="toolbar-sub">Identical to Official Examination Transcript</span>
        </div>
        <div className="toolbar-actions">
          <div className="layout-toggle-group">
            <span className="toggle-lbl">Format:</span>
            <button
              type="button"
              className={`layout-pill-btn ${layoutMode === "exact" ? "active" : ""}`}
              onClick={() => setLayoutMode("exact")}
              title="Exact match to your uploaded transcript document (left-column table format)"
            >
              Exact Original Match
            </button>
            <button
              type="button"
              className={`layout-pill-btn ${layoutMode === "full" ? "active" : ""}`}
              onClick={() => setLayoutMode("full")}
              title="Full page width table format"
            >
              Full Page Width
            </button>
          </div>

          <button
            type="button"
            className="action-btn print-btn"
            onClick={handlePrint}
            title="Open print dialog to print or save as PDF"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* The Printable Official Transcript Document */}
      <div className="transcript-paper-container">
        <div
          className={`transcript-sheet ${layoutMode === "exact" ? "exact-photo-layout" : "full-layout"}`}
          ref={transcriptRef}
          id="printable-transcript"
        >
          {/* Top Institution Header */}
          <header className="uet-official-header">
            <h1 className="uet-title">University of Engineering & Technology</h1>
            <h2 className="uet-location">Peshawar, Pakistan</h2>

            <div className="uet-reg-no-line">
              <span className="uet-reg-label">Registration No:</span>
              <span className="uet-reg-val">{studentInfo.registrationNo || "24PWSWE0006"}</span>
            </div>
          </header>

          {/* Horizontal Line */}
          <div className="uet-divider-line"></div>

          {/* TRANSCRIPT Title */}
          <div className="uet-transcript-banner">
            <h3 className="uet-transcript-heading">TRANSCRIPT</h3>
          </div>

          {/* Horizontal Line */}
          <div className="uet-divider-line"></div>

          {/* Student Information Section */}
          <div className="uet-student-details-block">
            <div className="uet-meta-line row-1">
              <div className="meta-col-left">
                <span className="lbl">Student's Name:</span>
                <span className="val">{studentInfo.studentName || "Himayat Ullah Khan"}</span>
              </div>
              <div className="meta-col-right">
                <span className="lbl">Father's Name:</span>
                <span className="val">{studentInfo.fatherName || "Yar Muhammad Khan"}</span>
              </div>
            </div>

            <div className="uet-meta-line row-2">
              <div className="meta-col-left">
                <span className="lbl">Program:</span>
                <span className="val">{studentInfo.program || "BS Software Engineering"}</span>
              </div>
            </div>

            <div className="uet-meta-line row-3">
              <div className="meta-col-left">
                <span className="lbl">Plan:</span>
                <span className="val">{studentInfo.plan || "BS Software Engineering Major"}</span>
              </div>
            </div>
          </div>

          {/* Horizontal Line */}
          <div className="uet-divider-line"></div>

          {/* Main Courses Area */}
          <div className="uet-courses-wrapper">
            {/* Column Headers */}
            <div className="uet-col-headers-row">
              <span className="th-col th-code">Code</span>
              <span className="th-col th-title">Title</span>
              <span className="th-col th-ch">CH</span>
              <span className="th-col th-grade">Grade</span>
            </div>

            {/* Semester Table Blocks */}
            <div className="uet-semesters-list">
              {semesters.map((sem, sIdx) => (
                <div key={sem.id || sIdx} className="uet-semester-box">
                  {/* Semester Term Name */}
                  <div className="uet-semester-title-banner">
                    {sem.name || `Semester ${sIdx + 1}`}
                  </div>

                  {/* Course Lines with Vertical Dividing Lines */}
                  <table className="uet-courses-table">
                    <tbody>
                      {(sem.subjects || []).map((sub, subIdx) => (
                        <tr key={sub.id || subIdx} className="uet-course-row">
                          <td className="uet-td uet-td-code">{sub.code || ""}</td>
                          <td className="uet-td uet-td-title">{sub.title || ""}</td>
                          <td className="uet-td uet-td-ch">
                            {sub.credits !== undefined && sub.credits !== null && sub.credits !== ""
                              ? parseFloat(sub.credits).toFixed(2)
                              : "0.00"}
                          </td>
                          <td className="uet-td uet-td-grade">{sub.grade || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Semester Calculations Summary Box */}
                  <div className="uet-semester-summary-table">
                    <div className="summary-stat-row">
                      <div className="stat-cell">
                        <span className="sum-tag">SCH:</span>
                        <span className="sum-num">{(sem.sch || 0).toFixed(2)}</span>
                      </div>
                      <div className="stat-cell">
                        <span className="sum-tag">SGP:</span>
                        <span className="sum-num">{(sem.sgp || 0).toFixed(2)}</span>
                      </div>
                      <div className="stat-cell">
                        <span className="sum-tag">SGPA:</span>
                        <span className="sum-num">{(sem.sgpa || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="summary-stat-row">
                      <div className="stat-cell">
                        <span className="sum-tag">CCH:</span>
                        <span className="sum-num">{(sem.cch || 0).toFixed(2)}</span>
                      </div>
                      <div className="stat-cell">
                        <span className="sum-tag">CGP:</span>
                        <span className="sum-num">{(sem.cgp || 0).toFixed(2)}</span>
                      </div>
                      <div className="stat-cell">
                        <span className="sum-tag">CGPA:</span>
                        <span className="sum-num">{(sem.cgpa || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Verification & Signatures Footer */}
          <footer className="uet-transcript-footer">
            <p className="uet-embossed-stamp-line">
              "The Official Transcript carries the embossed stamp of the University"
            </p>

            <div className="uet-signatures-container">
              <div className="uet-sig-left">
                <div className="sig-item">
                  <span className="sig-label">Transcript Prepared By:</span>
                  <span className="sig-line">
                    {studentInfo.preparedBy || "___________________________"}
                  </span>
                </div>

                <div className="sig-item">
                  <span className="sig-label">Transcript Checked By:</span>
                  <span className="sig-line">
                    {studentInfo.checkedBy || "___________________________"}
                  </span>
                </div>

                <div className="sig-item date-line">
                  <span className="sig-label">Date of issue:</span>
                  <span className="sig-date-val">{studentInfo.issueDate || "09/22/2026"}</span>
                </div>

                <p className="uet-rectification-note">
                  "Errors and Omissions are subject to subsequent rectification"
                </p>
              </div>

              <div className="uet-sig-right">
                <h4 className="uet-controller-heading">
                  {studentInfo.controllerTitle || "Controller of Examinations"}
                </h4>
                <div className="uet-decl-date-box">
                  <span className="decl-txt">Result Declaration Date :</span>
                  <span className="decl-val">{studentInfo.resultDeclarationDate || ""}</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default TranscriptView;
