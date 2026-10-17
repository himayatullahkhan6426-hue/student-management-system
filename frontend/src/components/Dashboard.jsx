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
  getOfficialTranscriptForDepartment,
} from "../utils/gradeCalculations";
import { DEPARTMENTS, createSemestersFromScheme, getDepartmentScheme } from "../utils/departmentSchemes";
import html2pdf from "html2pdf.js";

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
  const [isDownloading, setIsDownloading] = useState(false);

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
  // If department has an official scheme (SE, Chemical, Civil), automatically loads their full 8-semester scheme.
  const [rawSemesters, setRawSemesters] = useState(() => {
    const savedDept = localStorage.getItem(STORAGE_KEY_DEPT) || "se";
    const deptStorageKey = `${STORAGE_KEY_SEMESTERS}_${savedDept}`;
    const saved = localStorage.getItem(deptStorageKey) || localStorage.getItem(STORAGE_KEY_SEMESTERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved semesters", e);
      }
    }
    const officialTranscript = getOfficialTranscriptForDepartment(savedDept);
    if (officialTranscript) {
      return officialTranscript.semesters;
    }
    return [];
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
      if (currentDepartment?.id) {
        localStorage.setItem(`${STORAGE_KEY_SEMESTERS}_${currentDepartment.id}`, JSON.stringify(rawSemesters));
      }
    } catch (e) {
      console.error("Error saving semesters to localStorage", e);
    }
  }, [rawSemesters, currentDepartment?.id]);

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

    // Check if user previously saved semesters for this department
    const deptStorageKey = `${STORAGE_KEY_SEMESTERS}_${dept.id}`;
    const savedForDept = localStorage.getItem(deptStorageKey);
    if (savedForDept) {
      try {
        const parsed = JSON.parse(savedForDept);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRawSemesters(parsed);
          setShowDeptModal(false);
          return;
        }
      } catch (e) {}
    }

    const officialTranscript = getOfficialTranscriptForDepartment(dept.id);
    if (officialTranscript) {
      setRawSemesters(officialTranscript.semesters);
    } else {
      setRawSemesters([]);
    }

    setShowDeptModal(false);
  };

  // Reset all semesters (resets to official scheme if available, or clears all)
  const handleReset = () => {
    const officialTranscript = getOfficialTranscriptForDepartment(currentDepartment?.id);
    const confirmMsg = officialTranscript
      ? `Are you sure you want to reset all semesters to the official ${currentDepartment.name} curriculum? All courses and grades will be reset.`
      : "Are you sure you want to clear all semesters? You can add your semesters manually.";

    if (window.confirm(confirmMsg)) {
      if (officialTranscript) {
        setRawSemesters(officialTranscript.semesters);
      } else {
        setRawSemesters([]);
      }
      setActiveTab("semesters");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTranscript = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const container = document.querySelector(".transcript-paper-container");
      if (!container) {
        alert("Transcript element not found.");
        setIsDownloading(false);
        return;
      }

      // Safe registration number and name for filename
      const rawReg = studentInfo?.registrationNo || user?.email || "Student";
      const cleanReg = rawReg.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
      const cleanName = (studentInfo?.studentName || user?.name || "Student").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${cleanName}_Transcript_${cleanReg}.pdf`;

      // Configure html2pdf options
      const opt = {
        margin: 0,
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2, // 2x high resolution
          useCORS: true,
          logging: false,
          letterRendering: true,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 1200,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
          after: ".transcript-sheet",
        },
      };

      // To ensure mobile responsive scaling does not affect PDF layout,
      // clone the transcript container into an isolated off-screen node at full A4 desktop width:
      const clone = container.cloneNode(true);
      clone.style.width = "794px";
      clone.style.maxWidth = "794px";
      clone.style.margin = "0";
      clone.style.padding = "0";
      clone.style.gap = "0";
      clone.style.background = "#ffffff";

      const sheets = clone.querySelectorAll(".transcript-sheet");
      sheets.forEach((sheet, idx) => {
        sheet.style.transform = "none";
        sheet.style.boxShadow = "none";
        sheet.style.margin = "0";
        sheet.style.width = "210mm";
        sheet.style.minHeight = "297mm";
        sheet.style.height = "297mm";
        sheet.style.boxSizing = "border-box";
        if (idx < sheets.length - 1) {
          sheet.style.pageBreakAfter = "always";
          sheet.style.breakAfter = "page";
        } else {
          sheet.style.pageBreakAfter = "auto";
          sheet.style.breakAfter = "auto";
        }
      });

      const offscreen = document.createElement("div");
      offscreen.style.position = "fixed";
      offscreen.style.left = "-99999px";
      offscreen.style.top = "0";
      offscreen.style.width = "794px";
      offscreen.style.background = "#ffffff";
      offscreen.style.zIndex = "-99999";
      offscreen.appendChild(clone);
      document.body.appendChild(offscreen);

      try {
        await html2pdf().set(opt).from(clone).save();
      } finally {
        if (document.body.contains(offscreen)) {
          document.body.removeChild(offscreen);
        }
      }
    } catch (err) {
      console.error("Error generating PDF:", err);
      // Fallback: window.print()
      window.print();
    } finally {
      setIsDownloading(false);
    }
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
            {/* Dual Action Banner: Download Transcript & Print Transcript */}
            <div className="transcript-actions-banner no-print">
              <button
                type="button"
                className="transcript-action-btn download-btn"
                onClick={handleDownloadTranscript}
                disabled={isDownloading}
                title="Automatically download official transcript as PDF"
              >
                {isDownloading ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    <span>Downloading Transcript...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="btn-action-icon"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download Transcript</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="transcript-action-btn print-btn-blue"
                onClick={handlePrint}
                title="Open print dialog to print transcript"
              >
                <svg
                  className="btn-action-icon"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Print Transcript</span>
              </button>
            </div>
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
