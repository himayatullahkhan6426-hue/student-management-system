import {
  SOFTWARE_ENGINEERING_SCHEME,
  CHEMICAL_ENGINEERING_SCHEME,
  CIVIL_ENGINEERING_SCHEME,
  createSemestersFromScheme,
} from "./departmentSchemes";

export const GRADE_POINTS = {
  "A": 4.00,
  "A-": 3.67,
  "B+": 3.33,
  "B": 3.00,
  "B-": 2.67,
  "C+": 2.33,
  "C": 2.00,
  "C-": 1.67,
  "D+": 1.33,
  "D": 1.00,
  "F": 0.00,
};

export const GRADE_OPTIONS = [
  { label: "A (4.00)", value: "A" },
  { label: "A- (3.67)", value: "A-" },
  { label: "B+ (3.33)", value: "B+" },
  { label: "B (3.00)", value: "B" },
  { label: "B- (2.67)", value: "B-" },
  { label: "C+ (2.33)", value: "C+" },
  { label: "C (2.00)", value: "C" },
  { label: "C- (1.67)", value: "C-" },
  { label: "D+ (1.33)", value: "D+" },
  { label: "D (1.00)", value: "D" },
  { label: "F (0.00)", value: "F" },
  { label: "Pending / In Progress", value: "" },
];

/**
 * Calculates semester credit hours (SCH), semester grade points (SGP), and SGPA
 * Only subjects with an assigned grade contribute to SCH and SGP.
 */
export function calculateSemesterStats(subjects = []) {
  let sch = 0;
  let sgp = 0;

  subjects.forEach((sub) => {
    const credits = parseFloat(sub.credits) || 0;
    const grade = (sub.grade || "").trim();

    if (grade && GRADE_POINTS[grade] !== undefined) {
      const gp = GRADE_POINTS[grade];
      sch += credits;
      sgp += credits * gp;
    }
  });

  const sgpa = sch > 0 ? sgp / sch : 0;

  return {
    sch: parseFloat(sch.toFixed(2)),
    sgp: parseFloat(sgp.toFixed(2)),
    sgpa: parseFloat(sgpa.toFixed(2)),
  };
}

/**
 * Calculates cumulative stats (CCH, CGP, CGPA) sequentially across all semesters.
 */
export function calculateAllSemesters(semesters = []) {
  let runningCCH = 0;
  let runningCGP = 0;

  return semesters.map((sem) => {
    const stats = calculateSemesterStats(sem.subjects);

    runningCCH += stats.sch;
    runningCGP += stats.sgp;

    const cgpa = runningCCH > 0 ? runningCGP / runningCCH : 0;

    return {
      ...sem,
      sch: stats.sch,
      sgp: stats.sgp,
      sgpa: stats.sgpa,
      cch: parseFloat(runningCCH.toFixed(2)),
      cgp: parseFloat(runningCGP.toFixed(2)),
      cgpa: parseFloat(cgpa.toFixed(2)),
    };
  });
}

/**
 * Returns overall academic standing / performance classification
 */
export function getPerformanceLevel(cgpa) {
  if (cgpa >= 3.7) return "First Class with Distinction / Excellent";
  if (cgpa >= 3.0) return "First Division / Very Good";
  if (cgpa >= 2.5) return "Second Division (Upper) / Good";
  if (cgpa >= 2.0) return "Second Division (Lower) / Satisfactory";
  if (cgpa >= 1.0) return "Pass / Probation";
  return "Unsatisfactory / Fail";
}

/**
 * HEC percentage equivalent formula approximation
 */
export function calculateEquivalentPercentage(cgpa) {
  if (!cgpa || cgpa <= 0) return 0;
  // HEC linear interpolation: 4.0 = 85%+, 3.0 = 70%, 2.0 = 60%, 1.0 = 50%
  if (cgpa >= 3.63) return Math.min(100, Math.round(85 + ((cgpa - 3.63) / (4.0 - 3.63)) * 15));
  if (cgpa >= 3.0) return Math.round(70 + ((cgpa - 3.0) / 0.63) * 14);
  if (cgpa >= 2.0) return Math.round(60 + ((cgpa - 2.0) / 1.0) * 10);
  return Math.round(50 * cgpa);
}

/**
 * Target CGPA Forecaster:
 * Given current CCH, current CGP, target CGPA, and remaining credit hours,
 * calculates the required future SGPA.
 */
export function calculateRequiredSGPA(currentCCH, currentCGP, targetCGPA, remainingCredits) {
  if (remainingCredits <= 0) return null;
  const totalDesiredCredits = currentCCH + remainingCredits;
  const targetTotalPoints = targetCGPA * totalDesiredCredits;
  const neededPoints = targetTotalPoints - currentCGP;
  const requiredSGPA = neededPoints / remainingCredits;
  return parseFloat(requiredSGPA.toFixed(2));
}

/**
 * Exact sample transcript data matching the user's provided official transcript document (Page 1)
 */
export const SAMPLE_TRANSCRIPT = {
  semesters: [
    {
      id: "sem-1",
      name: "Fall 2024",
      subjects: [
        { id: "s1", code: "SE 117", title: "Occupational Health and Safety", credits: 1.0, grade: "" },
        { id: "s2", code: "BSI 101", title: "Islamic Studies", credits: 2.0, grade: "" },
        { id: "s3", code: "SE 101", title: "Information &Comm Technologies", credits: 2.0, grade: "" },
        { id: "s4", code: "SE 101L", title: "Information &Comm Technologies", credits: 1.0, grade: "" },
        { id: "s5", code: "SE 102", title: "Computer Programming", credits: 3.0, grade: "" },
        { id: "s6", code: "BSI 110", title: "Pak Studies", credits: 2.0, grade: "" },
        { id: "s7", code: "BSI 133", title: "Functional English", credits: 3.0, grade: "" },
        { id: "s8", code: "BSI 173", title: "Calculus & Analytic Geometry", credits: 3.0, grade: "" },
        { id: "s9", code: "SE 102L", title: "Computer Programming", credits: 1.0, grade: "" },
      ],
    },
    {
      id: "sem-2",
      name: "Spring 25",
      subjects: [
        { id: "s10", code: "SE 103", title: "Discrete Structures", credits: 3.0, grade: "" },
        { id: "s11", code: "SE 106", title: "Computer Arch & Logic Design", credits: 3.0, grade: "" },
        { id: "s12", code: "SE 106L", title: "Computer Arch & Logic Design", credits: 1.0, grade: "" },
        { id: "s13", code: "SE 107", title: "Object Oriented Programming", credits: 2.0, grade: "" },
        { id: "s14", code: "SE 107L", title: "Object Oriented Programming", credits: 1.0, grade: "" },
        { id: "s15", code: "BSI 111", title: "Linear Algebra", credits: 3.0, grade: "" },
        { id: "s16", code: "BSI 123", title: "Basic Physics", credits: 3.0, grade: "" },
        { id: "s17", code: "BSI 141", title: "Comm & Presentation Skills", credits: 2.0, grade: "" },
      ],
    },
    {
      id: "sem-3",
      name: "Fall 25",
      subjects: [
        { id: "s18", code: "SE 202", title: "Data Structures and Algorithms", credits: 3.0, grade: "" },
        { id: "s19", code: "SE 202L", title: "Data Structures and Algorithms", credits: 1.0, grade: "" },
        { id: "s20", code: "SE 204", title: "Intro to Software Engineering", credits: 3.0, grade: "" },
        { id: "s21", code: "BSI 362", title: "Complex Variables & FT", credits: 3.0, grade: "" },
        { id: "s22", code: "SE 304", title: "Operating Systems", credits: 3.0, grade: "" },
        { id: "s23", code: "SE 304L", title: "Operating Systems", credits: 1.0, grade: "" },
        { id: "s24", code: "BSI 351", title: "Probability & Statistics", credits: 3.0, grade: "" },
      ],
    },
    {
      id: "sem-4",
      name: "Spring 26",
      subjects: [
        { id: "s25", code: "SE 305", title: "Computer Comm: and Networks", credits: 3.0, grade: "" },
        { id: "s26", code: "SE 305L", title: "Computer Comm: and Networks", credits: 1.0, grade: "" },
        { id: "s27", code: "SE 209", title: "Intro. to Database System", credits: 3.0, grade: "" },
        { id: "s28", code: "SE 209L", title: "Intro. to Database System", credits: 1.0, grade: "" },
        { id: "s29", code: "BSI 242", title: "Numerical Analysis", credits: 3.0, grade: "" },
        { id: "s30", code: "SE 302L", title: "Software Design & Architecture", credits: 1.0, grade: "" },
        { id: "s31", code: "SE 302", title: "Software Design & Architecture", credits: 3.0, grade: "" },
        { id: "s32", code: "SE 118", title: "Civics & Community Engagement", credits: 2.0, grade: "" },
        { id: "s33", code: "BSI 402", title: "Sociology for Engineers", credits: 2.0, grade: "" },
      ],
    },
  ],
};

/**
 * Complete 8-Semester Software Engineering dataset
 * Integrating the user's completed semesters 1-4 with upcoming semesters 5-8 from Scheme of Studies!
 */
export const FULL_8_SEMESTER_SE_TRANSCRIPT = {
  ...SAMPLE_TRANSCRIPT,
  semesters: [
    ...SAMPLE_TRANSCRIPT.semesters,
    {
      id: "sem-5",
      name: "Fall 26",
      subjects: SOFTWARE_ENGINEERING_SCHEME[4].courses.map((c, i) => ({
        id: `s-se5-${i}`,
        code: c.code,
        title: c.title,
        credits: c.credits,
        grade: "",
      })),
    },
    {
      id: "sem-6",
      name: "Spring 27",
      subjects: SOFTWARE_ENGINEERING_SCHEME[5].courses.map((c, i) => ({
        id: `s-se6-${i}`,
        code: c.code,
        title: c.title,
        credits: c.credits,
        grade: "",
      })),
    },
    {
      id: "sem-7",
      name: "Fall 27",
      subjects: SOFTWARE_ENGINEERING_SCHEME[6].courses.map((c, i) => ({
        id: `s-se7-${i}`,
        code: c.code,
        title: c.title,
        credits: c.credits,
        grade: "",
      })),
    },
    {
      id: "sem-8",
      name: "Spring 28",
      subjects: SOFTWARE_ENGINEERING_SCHEME[7].courses.map((c, i) => ({
        id: `s-se8-${i}`,
        code: c.code,
        title: c.title,
        credits: c.credits,
        grade: "",
      })),
    },
  ],
};

/**
 * Complete 8-Semester Chemical Engineering dataset (131 CH)
 */
export const FULL_8_SEMESTER_CHE_TRANSCRIPT = {
  semesters: createSemestersFromScheme(CHEMICAL_ENGINEERING_SCHEME, "che"),
};

/**
 * Complete 8-Semester Civil Engineering dataset (136 CH)
 */
export const FULL_8_SEMESTER_CE_TRANSCRIPT = {
  semesters: createSemestersFromScheme(CIVIL_ENGINEERING_SCHEME, "ce"),
};

/**
 * Helper to get the official 8-semester transcript dataset for supported departments
 */
export function getOfficialTranscriptForDepartment(deptId) {
  if (deptId === "se") return FULL_8_SEMESTER_SE_TRANSCRIPT;
  if (deptId === "che") return FULL_8_SEMESTER_CHE_TRANSCRIPT;
  if (deptId === "ce") return FULL_8_SEMESTER_CE_TRANSCRIPT;
  return null;
}
