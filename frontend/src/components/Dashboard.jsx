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
  const [activeTab, setActiveTab] = useState("transcript");
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // User-isolated storage keys
  const userId = user?.id || "guest";
  const STORAGE_KEY_SEMESTERS = `uet_transcript_semesters_${userId}`;
  const STORAGE_KEY_STUDENT = `uet_transcript_student_${userId}`;
  const STORAGE_KEY_DEPT = `uet_transcript_dept_${userId}`;

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
    // If user is Himayat, use sample transcript
    if (user?.email === "24PWSWE0006@gmail.com" || user?.id === 2) {
      return {
        ...SAMPLE_TRANSCRIPT.studentInfo,
        studentName: user?.name || SAMPLE_TRANSCRIPT.studentInfo.studentName,
      };
    }
    // For every other student, initialize their own clean record
    return {
      studentName: user?.name || "",
      fatherName: "",
      registrationNo: extractRegNo(user?.email) || "",
      program: "BS Software Engineering",
      plan: "BS Software Engineering Major",
      universityName: "University of Engineering & Technology",
      universityLocation: "Peshawar, Pakistan",
      department: "se",
      issueDate: "09/22/2026",
      resultDeclarationDate: "09/15/2026",
      preparedBy: "",
      checkedBy: "",
      controllerTitle: "Controller of Examinations",
    };
  });

  // Semesters Data State - Personalized for this user
  const [rawSemesters, setRawSemesters] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SEMESTERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved semesters", e);
      }
    }
    if (user?.email === "24PWSWE0006@gmail.com" || user?.id === 2) {
      return SAMPLE_TRANSCRIPT.semesters;
    }
    return [
      {
        id: "sem-1",
        name: "Semester 1",
        subjects: [
          { id: "sub-1", code: "SE 101", title: "Information & Comm Technologies", credits: 2.0, grade: "A" },
          { id: "sub-2", code: "SE 101L", title: "ICT Lab", credits: 1.0, grade: "A" },
          { id: "sub-3", code: "SE 102", title: "Computer Programming", credits: 3.0, grade: "A" },
          { id: "sub-4", code: "BSI 101", title: "Islamic Studies", credits: 2.0, grade: "A" },
          { id: "sub-5", code: "BSI 173", title: "Calculus & Analytic Geometry", credits: 3.0, grade: "A" },
        ],
      },
    ];
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

  // Save student's transcript to MySQL database
  const handleSaveToCloud = async () => {
    if (!user?.id || user.id === "demo-user") {
      alert("In demo mode, your data is saved locally on this browser.");
      return;
    }
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
        alert("Success! Your personal academic transcript has been saved to the MySQL database.");
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
      {/* Header with Navigation and Department Changer */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
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
                  className="action-btn success-btn small"
                  onClick={handleSaveToCloud}
                  disabled={isSaving}
                  title="Save this transcript to MySQL database for your user account"
                  style={{ background: "#10b981", color: "#fff", fontWeight: "700" }}
                >
                  {isSaving ? "⏳ Saving..." : "💾 Save to Database"}
                </button>
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
                  📋 Load Himayat's 4-Sem Sample
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
            onSaveToCloud={handleSaveToCloud}
            isSaving={isSaving}
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
