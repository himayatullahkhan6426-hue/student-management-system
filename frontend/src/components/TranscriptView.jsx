import React, { useMemo, useRef } from "react";
import "./TranscriptView.css";

const FIRST_PAGE_HEIGHT = 660;
const OTHER_PAGE_HEIGHT = 900;
const MAX_TABLES_PER_COLUMN = 4;

const ROW_HEIGHT = 22;
const SEMESTER_HEADER_HEIGHT = 30;
const SUMMARY_HEIGHT = 55;
const SEMESTER_GAP = 16;

function TranscriptView({ studentInfo = {}, semesters = [], onPrint }) {
  const transcriptRef = useRef(null);

  const formatNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : "0.00";
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  // Calculate approximate height of each semester
  const getSemesterHeight = (semester) => {
    const subjects = semester.subjects || [];

    return (
      SEMESTER_HEADER_HEIGHT +
      subjects.length * ROW_HEIGHT +
      SUMMARY_HEIGHT +
      SEMESTER_GAP
    );
  };

  // Automatically distribute semesters between left and right columns
const pages = useMemo(() => {
  const result = [];

  for (let i = 0; i < semesters.length; i += 8) {
    const pageSemesters = semesters.slice(i, i + 8);

    result.push({
      left: pageSemesters.slice(0, 4),
      right: pageSemesters.slice(4, 8),
    });
  }

  return result.length
    ? result
    : [{ left: [], right: [] }];
}, [semesters]);

  const SemesterTable = ({ semester, index }) => (
    <div className="uet-semester-box">
      <div className="uet-semester-title-banner">
        {semester.name || `Semester ${index + 1}`}
      </div>

      <table className="uet-courses-table">
        <colgroup>
          <col style={{ width: "17%" }} />
          <col style={{ width: "58%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "13%" }} />
        </colgroup>

        <tbody>
          {(semester.subjects || []).map((subject, subjectIndex) => (
            <tr key={subject.id || subjectIndex}>
              <td className="uet-td-code">
                {subject.code || ""}
              </td>

              <td className="uet-td-title">
                {subject.title || ""}
              </td>

              <td className="uet-td-ch">
                {formatNumber(subject.credits)}
              </td>

              <td className="uet-td-grade">
                {subject.grade || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="uet-semester-summary-table">
        <div className="summary-stat-row">
          <span>SCH: {formatNumber(semester.sch)}</span>
          <span>SGP: {formatNumber(semester.sgp)}</span>
          <span>SGPA: {formatNumber(semester.sgpa)}</span>
        </div>

        <div className="summary-stat-row">
          <span>CCH: {formatNumber(semester.cch)}</span>
          <span>CGP: {formatNumber(semester.cgp)}</span>
          <span>CGPA: {formatNumber(semester.cgpa)}</span>
        </div>
      </div>
    </div>
  );

  const ColumnHeaders = () => (
    <div className="uet-col-headers-row">
      <span>Code</span>
      <span>Title</span>
      <span>CH</span>
      <span>Grade</span>
    </div>
  );

  return (
    <div className="transcript-wrapper" ref={transcriptRef}>
      <div className="transcript-paper-container">

        {pages.map((page, pageIndex) => (
          <div
            key={pageIndex}
            className="transcript-sheet"
            id={
              pageIndex === 0
                ? "printable-transcript"
                : undefined
            }
          >

            {/* Header only on first page */}
            {pageIndex === 0 && (
              <>
                <header className="uet-official-header">
                  <h1 className="uet-title">
                    University of Engineering & Technology
                  </h1>

                  <h2 className="uet-location">
                    Peshawar, Pakistan
                  </h2>

                  <div className="uet-reg-no-line">
                    <strong>Registration No: </strong>
                    {studentInfo.registrationNo || "No Data"}
                  </div>
                </header>

                <div className="uet-transcript-banner">
                  TRANSCRIPT
                </div>

                <div className="uet-student-details-block">
                  <div className="uet-meta-line">
                    <div>
                      <strong>Student's Name: </strong>
                      {studentInfo.studentName || "No Data"}
                    </div>

                    <div>
                      <strong>Father's Name: </strong>
                      {studentInfo.fatherName || "No Data"}
                    </div>
                  </div>

                  <div>
                    <strong>Program: </strong>
                    {studentInfo.program || "No Data"}
                  </div>

                  <div>
                    <strong>Plan: </strong>
                    {studentInfo.plan || "No Data"}
                  </div>
                </div>
              </>
            )}

            {/* TWO COLUMN TRANSCRIPT */}
            <div className="uet-two-column-layout">

              {/* LEFT SIDE */}
              <div className="uet-transcript-column">
                <ColumnHeaders />

                {page.left.map((semester, index) => (
                  <SemesterTable
                    key={semester.id || index}
                    semester={semester}
                    index={index}
                  />
                ))}
              </div>

              {/* RIGHT SIDE */}
              <div className="uet-transcript-column">
                <ColumnHeaders />

                {page.right.map((semester, index) => (
                  <SemesterTable
                    key={semester.id || index}
                    semester={semester}
                    index={page.left.length + index}
                  />
                ))}
              </div>

            </div>

            {/* Footer on last page */}
            {pageIndex === pages.length - 1 && (
              <footer className="uet-transcript-footer">

                <p className="uet-embossed-stamp-line">
                  "The Official Transcript carries the embossed
                  stamp of the University"
                </p>

                <div className="uet-signatures-container">

                  <div className="uet-sig-left">
                    <div className="sig-item">
                      <strong>Transcript Prepared By: </strong>
                      {studentInfo.preparedBy || "________________"}
                    </div>

                    <div className="sig-item">
                      <strong>Transcript Checked By: </strong>
                      {studentInfo.checkedBy || "________________"}
                    </div>

                    <div className="sig-item">
                      <strong>Date of issue: </strong>
                      {studentInfo.issueDate || "__/__/202__"}
                    </div>

                    <p className="uet-rectification-note">
                      "Errors and Omissions are subject to
                      subsequent rectification"
                    </p>
                  </div>

                  <div className="uet-sig-right">
                    <h4>
                      {studentInfo.controllerTitle ||
                        "Controller of Examinations"}
                    </h4>

                    <div>
                      Result Declaration Date:{" "}
                      {studentInfo.resultDeclarationDate || ""}
                    </div>
                  </div>

                </div>
              </footer>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}

export default TranscriptView;