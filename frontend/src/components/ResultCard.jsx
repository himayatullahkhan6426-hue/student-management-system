function ResultCard({
user,
gpa,
letterGrade,
}) {
return ( <aside className="result"> <span className="result-label">
YOUR RESULT </span>

  <div className="gpa-circle">
    <span>
      {gpa || "--"}
    </span>

    <small>/ 4.00</small>
  </div>

  <h2>
    {gpa
      ? "Your Semester GPA"
      : "Ready to Calculate"}
  </h2>

  <p>
    {gpa
      ? `Performance Level: ${letterGrade}`
      : "Choose your grades and calculate your result."}
  </p>

  <div className="result-details">
    <div>
      <span>Student</span>

      <strong>
        {user?.name}
      </strong>
    </div>

    <div>
      <span>Email</span>

      <strong>
        {user?.email}
      </strong>
    </div>
  </div>
</aside>

);
}

export default ResultCard;
