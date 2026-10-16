import React, { useState, useEffect } from "react";
import Header from "./Header";
import WelcomeCard from "./WelcomeCard";
import TranscriptView from "./TranscriptView";
import SemesterManager from "./SemesterManager";
import StudentInfoEditor from "./StudentInfoEditor";
import CGPAAnalytics from "./CGPAAnalytics";
import SchemeOfStudiesViewer from "./SchemeOfStudiesViewer";
import GPAPlanner from "./GPAPlanner";
import DepartmentSelector from "./DepartmentSelector";
import {
  SAMPLE_TRANSCRIPT,
  FULL_8_SEMESTER_SE_TRANSCRIPT,
  calculateAllSemesters,
} from "../utils/gradeCalculations";
import { DEPARTMENTS, createSemestersFromScheme, SOFTWARE_ENGINEERING_SCHEME } from "../utils/departmentSchemes";

const STORAGE_KEY_SEMESTERS = "uet_transcript_semesters_v2";
const STORAGE_KEY_STUDENT = "uet_transcript_student_v2";
const STORAGE_KEY_DEPT = "uet_transcript_dept_v2";

function Dashboard({ user, handleLogout }) {
  const [activeTab, setActiveTab] = useState("transcript");
  const [showDeptModal, setShowDeptModal] = useState(false);

  // Department State
  const [currentDepartment, setCurrentDepartment] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DEPT);
    if (saved) {
      const match = DEPARTMENTS.find((d) => d.id === saved);
      if (match) return match;
    }
    return DEPARTMENTS[0]; // Software Engineering
  });

  // Student Info State
  const [studentInfo, setStudentInfo] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENT);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved student info", e);
      }
    }
    return {
      ...SAMPLE_TRANSCRIPT.studentInfo,
      studentName: user?.name || SAMPLE_TRANSCRIPT.studentInfo.studentName,
    };
  });

  // Semesters Data State
  const [rawSemesters, setRawSemesters] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SEMESTERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved semesters", e);
      }
    }
    return SAMPLE_TRANSCRIPT.semesters;
  });

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
    setStudentInfo((prev) => ({
      ...prev,
      program: dept.program,
      plan: dept.plan,
      department: dept.id,
    }));

    if (
      dept.id !== "se" &&
      window.confirm(
        `Switched to ${dept.name}! Would you like to load the ${dept.name} starter scheme of studies?`
      )
    ) {
      // Create empty starter for that department
      const starter = [
        {
          id: `sem-starter-${dept.id}-1`,
          name: "Semester 1",
          subjects: [
            {
              id: "sub-init-1",
              code: `${dept.code}-101`,
              title: "Introduction to Engineering / Computing",
              credits: 3.0,
              grade: "A",
            },
          ],
        },
      ];
      setRawSemesters(starter);
    }
  };

  // Load 4-Semester Actual Transcript (from screenshot page 1)
  const handleLoadSample = () => {
    if (
      window.confirm(
        "Load Himayat Ullah Khan's actual 4-Semester Transcript record (Fall 2024 to Spring 2026)?"
      )
    ) {
      setRawSemesters(SAMPLE_TRANSCRIPT.semesters);
      setStudentInfo(SAMPLE_TRANSCRIPT.studentInfo);
      setActiveTab("transcript");
    }
  };

  // Load Full 8-Semester Software Engineering Scheme (from screenshots 1 & 2)
  const handleLoadFull8Semesters = () => {
    if (
      window.confirm(
        "Load the full 8-Semester Software Engineering Scheme of Studies (Semesters 1-8, 135 Credit Hours)?"
      )
    ) {
      setRawSemesters(FULL_8_SEMESTER_SE_TRANSCRIPT.semesters);
      setStudentInfo((prev) => ({
        ...prev,
        program: "BS Software Engineering",
        plan: "BS Software Engineering Major",
      }));
      setActiveTab("transcript");
    }
  };

  // Apply Full 8-Semester Scheme from Scheme viewer
  const handleApplyFullScheme = () => {
    if (
      window.confirm(
        "Apply the official 8-Semester Software Engineering curriculum to your transcript? All 135 credit hours from the Scheme of Studies will be loaded."
      )
    ) {
      const allSemesters = createSemestersFromScheme(SOFTWARE_ENGINEERING_SCHEME, "se");
      // Merge grades from existing semesters if names match
      const merged = allSemesters.map((newSem) => {
        const existing = rawSemesters.find((s) => s.name === newSem.name);
        if (existing) {
          return existing;
        }
        return newSem;
      });
      setRawSemesters(merged);
      setActiveTab("transcript");
    }
  };

  // Add individual course from scheme to current active semester
  const handleAddCourseToSemester = (course, semesterName) => {
    let targetSem = rawSemesters.find((s) => s.name === semesterName);
    if (!targetSem) {
      targetSem = rawSemesters[rawSemesters.length - 1] || rawSemesters[0];
    }
    const newCourseObj = {
      id: "course-" + Date.now() + Math.random(),
      code: course.code,
      title: course.title,
      credits: course.credits,
      grade: "A",
    };
    const updated = rawSemesters.map((s) => {
      if (s.id === targetSem.id) {
        return { ...s, subjects: [...s.subjects, newCourseObj] };
      }
      return s;
    });
    setRawSemesters(updated);
    alert(`Added "${course.code}: ${course.title}" (${course.credits} CH) to ${targetSem.name}!`);
  };

  // Reset all semesters
  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all semesters? You will start with a single empty semester."
      )
    ) {
      const emptyInitial = [
        {
          id: "sem-" + Date.now(),
          name: "Semester 1",
          subjects: [
            {
              id: "sub-" + Date.now(),
              code: "SE-101",
              title: "Introduction to Computing",
              credits: 3.0,
              grade: "A",
            },
          ],
        },
      ];
      setRawSemesters(emptyInitial);
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

  return (
    <main className="dashboard-page">
      {/* Header with Navigation and Department Changer */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        onPrint={handlePrint}
        currentDepartment={currentDepartment}
        onOpenDeptModal={() => setShowDeptModal(true)}
      />

      {/* Department Selector Modal */}
      {showDeptModal && (
        <DepartmentSelector
          currentDepartmentId={currentDepartment.id}
          onSelectDepartment={handleSelectDepartment}
          onClose={() => setShowDeptModal(false)}
        />
      )}

      {/* Welcome Banner Card */}
      <WelcomeCard
        studentInfo={studentInfo}
        latestCGPA={currentCGPA}
        totalCredits={currentCCH}
        totalSemesters={calculatedSemesters.length}
        onQuickPrint={handlePrint}
      />

      {/* Main Content Area Based on Active Tab */}
      <div className="tab-view-container">
        {/* 1. Official Transcript View (100% Match to Photo) */}
        {activeTab === "transcript" && (
          <div className="transcript-tab-content">
            {/* Quick Actions Helper */}
            <div className="helper-banner Box no-print">
              <div className="helper-text">
                <strong>📄 Official UET Peshawar Transcript:</strong> 100% formatted to the examination branch transcript. Click <em>"Print / Save as PDF"</em> to generate an authentic laser-crisp paper copy.
              </div>
              <div className="helper-actions">
                <button
                  type="button"
                  className="action-btn secondary-btn small"
                  onClick={handleLoadFull8Semesters}
                  title="Load full 8-semester Software Engineering scheme from screenshots"
                >
                  🎓 Load Full 8-Sem Scheme
                </button>
                <button
                  type="button"
                  className="action-btn secondary-btn small"
                  onClick={handleLoadSample}
                  title="Load actual 4-semester transcript from photo"
                >
                  📋 Load 4-Sem Actual Record
                </button>
                <button
                  type="button"
                  className="action-btn primary-btn small"
                  onClick={handlePrint}
                >
                  🖨️ Print / Save PDF
                </button>
              </div>
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
            onLoadSample={handleLoadSample}
            onLoadFull8Semesters={handleLoadFull8Semesters}
            onReset={handleReset}
            currentDepartment={currentDepartment}
            onOpenDeptModal={() => setShowDeptModal(true)}
          />
        )}

        {/* 3. Official Scheme of Studies Viewer (8 Semesters from Screenshot) */}
        {activeTab === "scheme" && (
          <SchemeOfStudiesViewer
            onApplyFullScheme={handleApplyFullScheme}
            onAddCourseToSemester={handleAddCourseToSemester}
            currentSemesters={calculatedSemesters}
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
