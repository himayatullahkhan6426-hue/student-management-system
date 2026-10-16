import React from "react";
import { DEPARTMENTS } from "../utils/departmentSchemes";

function DepartmentSelector({ currentDepartmentId, onSelectDepartment, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content dept-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Select Academic Department</h3>
            <p className="sub-desc" style={{ margin: "4px 0 0 0" }}>
              Choose your engineering or computing discipline to update your program, degree plan, and study scheme.
            </p>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="dept-grid-options">
          {DEPARTMENTS.map((dept) => {
            const isSelected = dept.id === currentDepartmentId;
            return (
              <div
                key={dept.id}
                className={`dept-card-item ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  onSelectDepartment(dept);
                  onClose();
                }}
              >
                <div className="dept-card-top">
                  <span className="dept-code-pill">{dept.code}</span>
                  {isSelected && <span className="active-check">✓ Active</span>}
                </div>
                <h4 className="dept-name">{dept.name}</h4>
                <p className="dept-program-title">{dept.program}</p>
                <div className="dept-credits-pill">
                  {dept.totalDegreeCredits} Total Degree Credits
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer" style={{ marginTop: "20px" }}>
          <button type="button" className="action-btn text-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DepartmentSelector;
