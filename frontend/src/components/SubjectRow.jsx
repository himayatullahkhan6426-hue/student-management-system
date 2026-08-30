function SubjectRow({
subject,
index,
grade,
gradePoints,
handleGradeChange,
}) {
return ( <div className="subject-row"> <div className="subject-info"> <span className="subject-number">
{String(index + 1).padStart(2, "0")} </span>

    <div>
      <h3>{subject.name}</h3>

      <span>
        {subject.credits} Credit Hours
      </span>
    </div>
  </div>

  <select
    className="dropdown"
    value={grade}
    onChange={(e) =>
      handleGradeChange(
        subject.key,
        e.target.value
      )
    }
  >
    {Object.keys(gradePoints).map((grade) => (
      <option
        key={grade}
        value={grade}
      >
        {grade}
      </option>
    ))}
  </select>
</div>

);
}

export default SubjectRow;
