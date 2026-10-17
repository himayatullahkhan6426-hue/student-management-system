import React from "react";
import { DEPARTMENTS } from "../utils/departmentSchemes";

function StudentInfoEditor({ studentInfo, setStudentInfo }) {
  const handleChange = (field, value) => {
    setStudentInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDepartmentChange = (deptId) => {
    const dept = DEPARTMENTS.find((d) => d.id === deptId);
    if (dept) {
      setStudentInfo((prev) => ({
        ...prev,
        department: dept.id,
        departmentName: dept.name,
        program: dept.program,
        plan: dept.plan,
      }));
    }
  };

  return (
    <div className="student-editor-card Box">
      <div className="section-title">
        <div>
          <span className="section-label">STUDENT & UNIVERSITY CREDENTIALS</span>
          <h2 className="heading">Transcript Header & Personal Info</h2>
        </div>
        <span className="subject-count">Academic Details</span>
      </div>

      <p className="sub-desc" style={{ marginBottom: "25px" }}>
        These details appear directly on the official transcript banner and signatures section.
      </p>

      <div className="editor-grid">
        {/* Student Details */}
        <div className="form-column">
          <h3 className="column-subheading">👤 Student Details</h3>

          <div className="input-field-group">
            <label>Student's Full Name</label>
            <input
              type="text"
              className="text-input"
              value={studentInfo.studentName || ""}
              onChange={(e) => handleChange("studentName", e.target.value)}
            />
          </div>

          <div className="input-field-group">
            <label>Father's Name</label>
            <input
              type="text"
              className="text-input"
              value={studentInfo.fatherName || ""}
              onChange={(e) => handleChange("fatherName", e.target.value)}
            />
          </div>

          <div className="input-field-group">
            <label>Registration Number</label>
            <input
              type="text"
              className="text-input"
              value={studentInfo.registrationNo || ""}
              onChange={(e) => handleChange("registrationNo", e.target.value)}
            />
          </div>

          <div className="input-field-group">
            <label>Academic Department</label>
            <select
              className="text-input"
              value={studentInfo.department || "se"}
              onChange={(e) => handleDepartmentChange(e.target.value)}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          <div className="input-field-group">
            <label>Program</label>
            <input
              type="text"
              className="text-input"
              value={studentInfo.program || ""}
              onChange={(e) => handleChange("program", e.target.value)}
            />
          </div>

          <div className="input-field-group">
            <label>Plan / Major</label>
            <input
              type="text"
              className="text-input"
              value={studentInfo.plan || ""}
              onChange={(e) => handleChange("plan", e.target.value)}
            />
          </div>
        </div>

        {/* University & Official Details */}
        <div className="form-column">
          <h3 className="column-subheading">🏛️ Institution & Issuance</h3>

          <div className="input-field-group">
            <label>University / Institution Name</label>
            <input
              type="text"
              className="text-input"
              value={studentInfo.universityName || ""}
              onChange={(e) => handleChange("universityName", e.target.value)}
            />
          </div>

          <div className="input-field-group">
            <label>Campus / City, Country</label>
            <input
              type="text"
              className="text-input"
              value={studentInfo.universityLocation || ""}
              onChange={(e) => handleChange("universityLocation", e.target.value)}
            />
          </div>

          <div className="input-field-group">
            <label>Date of Issue</label>
            <input
              type="text"
              className="text-input"
              value={studentInfo.issueDate || ""}
              onChange={(e) => handleChange("issueDate", e.target.value)}
            />
          </div>

          <div className="input-field-group">
            <label>Result Declaration Date</label>
            <input
              type="text"
              className="text-input"
              value={studentInfo.resultDeclarationDate || ""}
              onChange={(e) => handleChange("resultDeclarationDate", e.target.value)}
            />
          </div>

          <div className="input-field-group">
            <label>Controller Title</label>
            <input
              type="text"
              className="text-input"
              value={studentInfo.controllerTitle || ""}
              onChange={(e) => handleChange("controllerTitle", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentInfoEditor;
