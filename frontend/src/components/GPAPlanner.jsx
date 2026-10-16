import React, { useState } from "react";
import {
  calculateRequiredSGPA,
  calculateEquivalentPercentage,
  getPerformanceLevel,
} from "../utils/gradeCalculations";

function GPAPlanner({ semesters, currentCGPA, currentCCH, currentCGP, totalDegreeCredits = 135 }) {
  const [targetCGPA, setTargetCGPA] = useState(3.5);
  const [plannedRemainingCredits, setPlannedRemainingCredits] = useState(() => {
    const remaining = totalDegreeCredits - currentCCH;
    return remaining > 0 ? remaining : 18;
  });

  const requiredSGPA = calculateRequiredSGPA(
    currentCCH,
    currentCGP,
    targetCGPA,
    plannedRemainingCredits
  );

  const equivPercentage = calculateEquivalentPercentage(currentCGPA);
  const standing = getPerformanceLevel(currentCGPA);

  // Determine feasibility status
  let feasibilityClass = "feasibility-good";
  let feasibilityMsg = "";

  if (requiredSGPA === null) {
    feasibilityMsg = "You have already completed all degree credit hours.";
  } else if (requiredSGPA > 4.0) {
    feasibilityClass = "feasibility-impossible";
    feasibilityMsg = `Target requires SGPA ${requiredSGPA.toFixed(2)}, which exceeds the maximum possible 4.00.`;
  } else if (requiredSGPA >= 3.7) {
    feasibilityClass = "feasibility-hard";
    feasibilityMsg = `Challenging: Requires near-perfect grades (SGPA ${requiredSGPA.toFixed(2)}) across remaining credits.`;
  } else if (requiredSGPA >= 3.0) {
    feasibilityClass = "feasibility-moderate";
    feasibilityMsg = `Achievable with consistent B+/A grades (SGPA ${requiredSGPA.toFixed(2)}).`;
  } else {
    feasibilityClass = "feasibility-easy";
    feasibilityMsg = `Very achievable: Requires modest SGPA of ${requiredSGPA.toFixed(2)}.`;
  }

  return (
    <div className="planner-container">
      {/* Top Academic Standing Summary */}
      <div className="academic-snapshot-card Box">
        <div className="section-title">
          <div>
            <span className="section-label">STUDENT ACADEMIC STATUS</span>
            <h3 className="heading">Performance & Degree Completion</h3>
          </div>
          <span className="subject-count">{currentCCH.toFixed(1)} / {totalDegreeCredits} CH</span>
        </div>

        <div className="snapshot-metrics-row">
          <div className="snapshot-item">
            <span className="snap-lbl">Current CGPA</span>
            <strong className="snap-val highlight">{currentCGPA.toFixed(2)}</strong>
            <small>Scale of 4.00</small>
          </div>
          <div className="snapshot-item">
            <span className="snap-lbl">Equivalent Percentage</span>
            <strong className="snap-val">{equivPercentage}%</strong>
            <small>HEC Standard Formula</small>
          </div>
          <div className="snapshot-item">
            <span className="snap-lbl">Earned Grade Points</span>
            <strong className="snap-val">{currentCGP.toFixed(2)}</strong>
            <small>Total SGP accumulated</small>
          </div>
          <div className="snapshot-item">
            <span className="snap-lbl">Official Standing</span>
            <strong className="snap-val standing-tag">{standing}</strong>
            <small>Degree Classification</small>
          </div>
        </div>
      </div>

      {/* Target CGPA Forecaster / What-If Tool */}
      <div className="forecaster-card Box">
        <div className="section-title">
          <div>
            <span className="section-label">STUDENT WHAT-IF FORECASTER</span>
            <h3 className="heading">Target CGPA Calculator</h3>
          </div>
          <span className="subject-count">Future Planning</span>
        </div>

        <p className="sub-desc" style={{ marginBottom: "25px" }}>
          Calculate exactly what average GPA you need in future semesters to graduate with your desired CGPA.
        </p>

        <div className="forecaster-grid">
          <div className="forecaster-controls">
            <div className="input-field-group">
              <label>
                Target CGPA: <strong>{targetCGPA.toFixed(2)}</strong>
              </label>
              <input
                type="range"
                min="2.0"
                max="4.0"
                step="0.05"
                value={targetCGPA}
                onChange={(e) => setTargetCGPA(parseFloat(e.target.value))}
                className="cgpa-slider"
              />
              <div className="slider-ticks">
                <span>2.0 (Pass)</span>
                <span>2.5 (Good)</span>
                <span>3.0 (First Div)</span>
                <span>3.5 (Honours)</span>
                <span>4.0 (Distinction)</span>
              </div>
            </div>

            <div className="input-field-group" style={{ marginTop: "20px" }}>
              <label>Remaining Credit Hours to Plan</label>
              <input
                type="number"
                min="1"
                max="140"
                step="1"
                value={plannedRemainingCredits}
                onChange={(e) => setPlannedRemainingCredits(parseFloat(e.target.value) || 1)}
                className="text-input"
              />
              <div className="quick-suggestions">
                <span className="suggestion-label">Quick Set:</span>
                {[
                  { label: "1 Semester (~18 CH)", ch: 18 },
                  { label: "2 Semesters (~35 CH)", ch: 35 },
                  { label: "4 Semesters (~70 CH)", ch: 70 },
                  {
                    label: `Full Degree Remaining (${Math.max(0, totalDegreeCredits - currentCCH)} CH)`,
                    ch: Math.max(1, totalDegreeCredits - currentCCH),
                  },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    className="suggestion-pill"
                    onClick={() => setPlannedRemainingCredits(item.ch)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`forecaster-result-card ${feasibilityClass}`}>
            <span className="result-card-badge">REQUIRED FUTURE SGPA</span>
            <div className="big-required-number">
              {requiredSGPA !== null ? (
                requiredSGPA > 4.0 ? (
                  "> 4.00"
                ) : (
                  requiredSGPA.toFixed(2)
                )
              ) : (
                "--"
              )}
            </div>
            <div className="result-target-echo">
              To reach <strong>{targetCGPA.toFixed(2)} CGPA</strong> over{" "}
              <strong>{plannedRemainingCredits} credit hours</strong>
            </div>
            <p className="feasibility-text">{feasibilityMsg}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GPAPlanner;
