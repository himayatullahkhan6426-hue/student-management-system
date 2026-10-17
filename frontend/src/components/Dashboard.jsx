import React, { useState, useEffect } from "react";
import Contents from "./Contents";
import WelcomeCard from "./WelcomeCard";
import TranscriptView from "./TranscriptView";
import SemesterManager from "./SemesterManager";
import StudentInfoEditor from "./StudentInfoEditor";
import CGPAAnalytics from "./CGPAAnalytics";
import GPAPlanner from "./GPAPlanner";
import DepartmentSelector from "./DepartmentSelector";
import {
  SAMPLE_TRANSCRIPT,
  FULL_8_SEMESTER_SE_TRANSCRIPT,
  calculateAllSemesters,
} from "../utils/gradeCalculations";
import { DEPARTMENTS, createSemestersFromScheme, SOFTWARE_ENGINEERING_SCHEME } from "../utils/departmentSchemes";

const API_URL = "https://student-management-system-d4cj.onrender.com";

function extractRegNo(email) {
  if (!email) return "";
  const prefix = email.split("@")[0].toUpperCase();
  if (/^[0-9]{2}[A-Z]{3,5}[0-9]{2,5}$/i.test(prefix)) {
    return prefix;
  }
  return "";
}

function Dashboard({ user, handleLogout }) {
  const [activeTab, setActiveTab] = useState("semesters");
  const [cloudStatus, setCloudStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // User-isolated storage keys
  const userId = user?.id || "guest";
  const STORAGE_KEY_SEMESTERS = `uet_transcript_semesters_${userId}`;
  const STORAGE_KEY_STUDENT = `uet_transcript_student_${userId}`;
  const STORAGE_KEY_DEPT = `uet_transcript_dept_${userId}`;

  // Ask student for department first if not already saved
  const [showDeptModal, setShowDeptModal] = useState(() => {
    const savedDept = localStorage.getItem(STORAGE_KEY_DEPT);
    return !savedDept;
  });

  // Department State
  const [currentDepartment, setCurrentDepartment] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DEPT);
    if (saved) {
      const match = DEPARTMENTS.find((d) => d.id === saved);
      if (match) return match;
    }
    return DEPARTMENTS[0]; // Software Engineering
  });

  // Student Info State - Personalized for this user
  const [studentInfo, setStudentInfo] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENT);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved student info", e);
      }
    }
    const savedDeptId = localStorage.getItem(STORAGE_KEY_DEPT) || "se";
    const initialDept = DEPARTMENTS.find((d) => d.id === savedDeptId) || DEPARTMENTS[0];
    return {
      studentName: user?.name || "",
      fatherName: "",
      registrationNo: extractRegNo(user?.email) || "",
      program: initialDept.program,
      plan: initialDept.plan,
      universityName: "University of Engineering & Technology",
      universityLocation: "Peshawar, Pakistan",
      department: initialDept.id,
      departmentName: initialDept.name,
      issueDate: "__/__/202__",
      resultDeclarationDate: "__/__/202__",
      preparedBy: "",
      checkedBy: "",
      controllerTitle: "Controller of Examinations",
    };
  });

  // Semesters Data State - Personalized for this user
  // If Software Engineering: automatically loads full 8-semester scheme.
  // If other department: clears all semesters to start fresh with manual additions.
  const [rawSemesters, setRawSemesters] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SEMESTERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved semesters", e);
      }
    }
    const savedDept = localStorage.getItem(STORAGE_KEY_DEPT);
    if (savedDept && savedDept !== "se") {
      return [];
    }
    return FULL_8_SEMESTER_SE_TRANSCRIPT.semesters;
  });

  // Load from MySQL database for this student on login
  useEffect(() => {
    if (!user?.id || user.id === "demo-user") return;
    let isMounted = true;
    setCloudStatus("Syncing with DB...");

    fetch(`${API_URL}/transcript/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.exists) {
          if (data.studentInfo) setStudentInfo(data.studentInfo);
          if (data.semesters) setRawSemesters(data.semesters);
          setCloudStatus("DB Synced ✓");
        } else {
          setCloudStatus("Personal Record Ready");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch remote transcript", err);
        if (isMounted) setCloudStatus("Local Only");
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Dynamically calculate SCH, SGP, SGPA, CCH, CGP, CGPA
  const calculatedSemesters = calculateAllSemesters(rawSemesters);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SEMESTERS, JSON.stringify(rawSemesters));
    } catch (e) {
      console.error("Error saving semesters to localStorage", e);
    }
  }, [rawSemesters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENT, JSON.stringify(studentInfo));
    } catch (e) {
      console.error("Error saving studentInfo to localStorage", e);
    }
  }, [studentInfo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEPT, currentDepartment.id);
  }, [currentDepartment]);

  // Handle department change
  const handleSelectDepartment = (dept) => {
    setCurrentDepartment(dept);
    localStorage.setItem(STORAGE_KEY_DEPT, dept.id);

    const updatedInfo = {
      ...studentInfo,
      department: dept.id,
      departmentName: dept.name,
      program: dept.program,
      plan: dept.plan,
    };
    setStudentInfo(updatedInfo);
    try {
      localStorage.setItem(STORAGE_KEY_STUDENT, JSON.stringify(updatedInfo));
    } catch (e) { }

    if (dept.id === "se") {
      // If Software Engineering: automatically loads full 8-semester scheme
      setRawSemesters(FULL_8_SEMESTER_SE_TRANSCRIPT.semesters);
    } else {
      // If NOT Software Engineering: clear all semester sections and prompt manual addition
      setRawSemesters([]);
    }

    setShowDeptModal(false);
  };

  // Reset all semesters (clears all semesters for fresh manual entry)
  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all semesters? You can add your semesters manually."
      )
    ) {
      setRawSemesters([]);
      setActiveTab("semesters");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Get current cumulative stats
  const lastSem = calculatedSemesters[calculatedSemesters.length - 1] || {};
  const currentCGPA = lastSem.cgpa !== undefined ? lastSem.cgpa : 0;
  const currentCCH = lastSem.cch !== undefined ? lastSem.cch : 0;
  const currentCGP = lastSem.cgp !== undefined ? lastSem.cgp : 0;

  // Save student's transcript to MySQL database
  const handleSaveToCloud = async () => {
    setIsSaving(true);
    setCloudStatus("Saving to DB...");
    try {
      const res = await fetch(`${API_URL}/transcript/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          studentInfo,
          semesters: rawSemesters,
          cgpa: currentCGPA,
          totalCredits: currentCCH,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setCloudStatus("Saved to DB ✓");
        alert("Success! Your personal academic transcript has been saved to database.");
      } else {
        setCloudStatus("Save Failed");
        alert("Error saving: " + (result.message || "Failed to save"));
      }
    } catch (err) {
      console.error("Save error:", err);
      setCloudStatus("Network Error");
      alert("Could not connect to database server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="dashboard-page">
      {/* Welcome Banner Card */}
      <WelcomeCard
        studentInfo={studentInfo}
        latestCGPA={currentCGPA}
        totalCredits={currentCCH}
        totalSemesters={calculatedSemesters.length}
        onQuickPrint={handlePrint}
        handleLogout={handleLogout}
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentDepartment={currentDepartment}
      />


      {/* Contents with Navigation and Department Changer */}
      <Contents
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPrint={handlePrint}
        currentDepartment={currentDepartment}
        onOpenDeptModal={() => setShowDeptModal(true)}
        user={user}
        onSaveToCloud={handleSaveToCloud}
        cloudStatus={cloudStatus}
        isSaving={isSaving}
      />

      {/* Department Selector Modal */}
      {showDeptModal && (
        <DepartmentSelector
          currentDepartmentId={currentDepartment.id}
          onSelectDepartment={handleSelectDepartment}
          onClose={() => setShowDeptModal(false)}
        />
      )}


      {/* Main Content Area Based on Active Tab */}
      <div className="tab-view-container">
        {/* 1. Official Transcript View */}
        {activeTab === "transcript" && (
          <div className="transcript-tab-content">
            {/* Direct Big Print / Save as PDF Button covering the full area */}
            <button
              type="button"
              className="big-print-btn no-print"
              onClick={handlePrint}
              title="Open print dialog to print or save as PDF"
            >
              Print / Save as PDF
            </button>
            <TranscriptView
              studentInfo={studentInfo}
              semesters={calculatedSemesters}
              onPrint={handlePrint}
            />
          </div>
        )}

        {/* 2. Interactive Semester & Course Manager */}
        {activeTab === "semesters" && (
          <SemesterManager
            semesters={calculatedSemesters}
            setSemesters={setRawSemesters}
            onReset={handleReset}
            currentDepartment={currentDepartment}
            onOpenDeptModal={() => setShowDeptModal(true)}
            onSaveToCloud={handleSaveToCloud}
            isSaving={isSaving}
            onViewTranscript={() => setActiveTab("transcript")}
          />
        )}

        {/* 4. Target CGPA Forecaster / What-If Tool */}
        {activeTab === "planner" && (
          <GPAPlanner
            semesters={calculatedSemesters}
            currentCGPA={currentCGPA}
            currentCCH={currentCCH}
            currentCGP={currentCGP}
            totalDegreeCredits={currentDepartment.totalDegreeCredits || 135}
          />
        )}

        {/* 5. Student & University Profile */}
        {activeTab === "profile" && (
          <StudentInfoEditor
            studentInfo={studentInfo}
            setStudentInfo={setStudentInfo}
          />
        )}

        {/* 6. CGPA Analytics & Trajectory */}
        {activeTab === "analytics" && (
          <CGPAAnalytics
            semesters={calculatedSemesters}
            studentInfo={studentInfo}
          />
        )}
      </div>
    </main>
  );
}

export default Dashboard;
