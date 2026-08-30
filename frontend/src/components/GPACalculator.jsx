import { useState } from "react";
import SubjectRow from "./SubjectRow";
import ResultCard from "./ResultCard";

function GPACalculator({ user }) {
const [grades, setGrades] = useState({
sda: "A",
idbms: "A",
networking: "A",
numericalAnalysis: "A",
sociology: "A",
civics: "A",
sdaLab: "A",
idbmsLab: "A",
networkingLab: "A",
});

const [gpa, setGpa] = useState(null);
const [letterGrade, setLetterGrade] = useState("");

const subjects = [
{ key: "sda", name: "SDA", credits: 2 },
{ key: "idbms", name: "IDBMS", credits: 3 },
{ key: "networking", name: "Networking", credits: 3 },
{
key: "numericalAnalysis",
name: "Numerical Analysis",
credits: 3,
},
{ key: "sociology", name: "Sociology", credits: 2 },
{ key: "civics", name: "Civics", credits: 2 },
{ key: "sdaLab", name: "SDA Lab", credits: 1 },
{ key: "idbmsLab", name: "IDBMS Lab", credits: 1 },
{
key: "networkingLab",
name: "Networking Lab",
credits: 1,
},
];

const gradePoints = {
A: 4.0,
"A-": 3.67,
"B+": 3.33,
B: 3.0,
"B-": 2.67,
"C+": 2.33,
C: 2.0,
"C-": 1.67,
"D+": 1.33,
D: 1.0,
F: 0,
};

const handleGradeChange = (subject, value) => {
setGrades({
...grades,
[subject]: value,
});
};

const calculateGPA = async () => {
let totalPoints = 0;
let totalCredits = 0;


// Calculate GPA
subjects.forEach((subject) => {
  totalPoints +=
    gradePoints[grades[subject.key]] *
    subject.credits;

  totalCredits += subject.credits;
});

const calculatedGPA =
  totalPoints / totalCredits;

const formattedGPA =
  calculatedGPA.toFixed(2);

// Determine performance level
let resultGrade = "";

if (calculatedGPA >= 3.7) {
  resultGrade = "Excellent";
} else if (calculatedGPA >= 3.0) {
  resultGrade = "Very Good";
} else if (calculatedGPA >= 2.0) {
  resultGrade = "Good";
} else if (calculatedGPA >= 1.0) {
  resultGrade = "Pass";
} else {
  resultGrade = "Fail";
}

// Show GPA on screen
setGpa(formattedGPA);
setLetterGrade(resultGrade);

// Prepare all 9 subjects and their grades
const subjectsData = subjects.map((subject) => ({
  subjectName: subject.name,
  grade: grades[subject.key],
  creditHours: subject.credits,
}));

// Send GPA and subject grades to backend
try {
  const response = await fetch(
    "http://localhost:5000/save-result",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userId: user.id,
        totalGPA: formattedGPA,
        performanceLevel: resultGrade,
        subjects: subjectsData,
      }),
    }
  );

  const data = await response.json();

  if (response.ok) {
    console.log(data.message);
  } else {
    console.error(data.message);
  }
} catch (error) {
  console.error(
    "Could not save result:",
    error
  );
}


};

return ( <section className="calculator-layout"> <div className="Box">

    <div className="section-title">
      <div>
        <span className="section-label">
          ACADEMIC PERFORMANCE
        </span>

        <h2 className="heading">
          Select Your Grades
        </h2>
      </div>

      <span className="subject-count">
        {subjects.length} Subjects
      </span>
    </div>

    <div className="subjects-list">
      {subjects.map((subject, index) => (
        <SubjectRow
          key={subject.key}
          subject={subject}
          index={index}
          grade={grades[subject.key]}
          gradePoints={gradePoints}
          handleGradeChange={handleGradeChange}
        />
      ))}
    </div>

    <button
      className="Button"
      onClick={calculateGPA}
    >
      Calculate My GPA →
    </button>

  </div>

  <ResultCard
    user={user}
    gpa={gpa}
    letterGrade={letterGrade}
  />
</section>

);
}

export default GPACalculator;
