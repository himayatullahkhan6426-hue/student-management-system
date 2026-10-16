const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

// CORS - Allow Vercel frontend
app.use(cors({
origin: [
  "https://student-management-system-rose-theta.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
],
methods: ["GET", "POST", "DELETE", "PUT"],
allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Aiven MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,

  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
if (err) {
console.log("MySQL connection failed:");
console.log(err.message);
return;
}

console.log("MySQL connected successfully!");
});

app.get("/", (req, res) => {
res.send("Server is running!");
});

// REGISTER USER
app.post("/register", async (req, res) => {
const { name, email, password } = req.body;

try {
db.query(
"SELECT * FROM users WHERE email = ?",
[email],
async (err, results) => {
if (err) {
return res.status(500).json({
message: "Database error"
});
}


    if (results.length > 0) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Could not register user"
          });
        }

        res.status(201).json({
          message: "User registered successfully!"
        });
      }
    );
  }
);


} catch (error) {
console.log(error);


res.status(500).json({
  message: "Server error"
});


}
});

// LOGIN USER
app.post("/login", (req, res) => {
const { email, password } = req.body;

db.query(
"SELECT * FROM users WHERE email = ?",
[email],
async (err, results) => {
if (err) {
return res.status(500).json({
message: "Database error"
});
}


  if (results.length === 0) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  const user = results[0];

  const passwordMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatch) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  res.json({
    message: "Login successful!",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin
    }
  });
}


);
});

// SAVE GPA AND ALL SUBJECT GRADES
app.post("/save-result", (req, res) => {
const {
userId,
totalGPA,
performanceLevel,
subjects
} = req.body;

if (
!userId ||
!totalGPA ||
!performanceLevel ||
!subjects ||
!Array.isArray(subjects) ||
subjects.length === 0
) {
return res.status(400).json({
message: "Invalid result data"
});
}

const resultSql =
"INSERT INTO results (user_id, total_gpa, performance_level) VALUES (?, ?, ?)";

db.query(
resultSql,
[
userId,
totalGPA,
performanceLevel
],
(error, result) => {
if (error) {
console.log("Error saving GPA:");
console.log(error);


    return res.status(500).json({
      message: "Failed to save GPA result"
    });
  }

  const resultId = result.insertId;

  const subjectValues = subjects.map((subject) => [
    resultId,
    subject.subjectName,
    subject.grade,
    subject.creditHours
  ]);

  const subjectSql =
    "INSERT INTO subject_grades (result_id, subject_name, grade, credit_hours) VALUES ?";

  db.query(
    subjectSql,
    [subjectValues],
    (error) => {
      if (error) {
        console.log("Error saving subject grades:");
        console.log(error);

        return res.status(500).json({
          message: "Subject grades could not be saved"
        });
      }

      res.status(201).json({
        message: "GPA and all 9 subject grades saved successfully!"
      });
    }
  );
}


);
});

// GET INDIVIDUAL STUDENT TRANSCRIPT
app.get("/transcript/:userId", (req, res) => {
  const userId = req.params.userId;
  const sql = "SELECT * FROM student_transcripts WHERE user_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching student transcript:", err);
      return res.status(500).json({ message: "Database error fetching transcript" });
    }
    if (results.length === 0) {
      return res.json({ exists: false });
    }
    const row = results[0];
    let studentInfo = row.student_info;
    let semestersData = row.semesters_data;
    if (typeof studentInfo === "string") {
      try { studentInfo = JSON.parse(studentInfo); } catch (e) {}
    }
    if (typeof semestersData === "string") {
      try { semestersData = JSON.parse(semestersData); } catch (e) {}
    }
    return res.json({
      exists: true,
      studentInfo,
      semesters: semestersData,
      cgpa: row.cgpa,
      totalCredits: row.total_credits,
      updatedAt: row.updated_at,
    });
  });
});

// SAVE / UPDATE INDIVIDUAL STUDENT TRANSCRIPT
app.post("/transcript/save", (req, res) => {
  const { userId, studentInfo, semesters, cgpa, totalCredits } = req.body;
  if (!userId || !semesters) {
    return res.status(400).json({ message: "User ID and semester data are required" });
  }

  const studentInfoJson = JSON.stringify(studentInfo || {});
  const semestersJson = JSON.stringify(semesters);

  const sql = `
    INSERT INTO student_transcripts (user_id, student_info, semesters_data, cgpa, total_credits)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      student_info = VALUES(student_info),
      semesters_data = VALUES(semesters_data),
      cgpa = VALUES(cgpa),
      total_credits = VALUES(total_credits),
      updated_at = CURRENT_TIMESTAMP
  `;

  db.query(
    sql,
    [userId, studentInfoJson, semestersJson, cgpa || 0.0, totalCredits || 0.0],
    (err, result) => {
      if (err) {
        console.error("Error saving transcript:", err);
        return res.status(500).json({ message: "Failed to save transcript to database" });
      }
      return res.json({ message: "Transcript saved successfully!" });
    }
  );
});

// ADMIN: GET ALL USERS
app.get("/admin/users", (req, res) => {
const sql =
"SELECT id, name, email, created_at, is_admin FROM users WHERE is_admin = 0";

db.query(sql, (error, users) => {
if (error) {
console.log(error);


  return res.status(500).json({
    message: "Could not get users"
  });
}

res.json(users);

});
});

// ADMIN: GET USER DETAILS
app.get("/admin/user/:id", (req, res) => {
const userId = req.params.id;

const userSql =
"SELECT id, name, email, created_at FROM users WHERE id = ?";

db.query(userSql, [userId], (error, users) => {
if (error) {
return res.status(500).json({
message: "Database error"
});
}

if (users.length === 0) {
  return res.status(404).json({
    message: "User not found"
  });
}

const resultSql =
  "SELECT id, total_gpa, performance_level, created_at FROM results WHERE user_id = ?";

db.query(resultSql, [userId], (error, results) => {
  if (error) {
    return res.status(500).json({
      message: "Could not get GPA results"
    });
  }

  const transcriptSql = "SELECT * FROM student_transcripts WHERE user_id = ?";
  db.query(transcriptSql, [userId], (error, transcriptRows) => {
    let transcript = null;
    if (transcriptRows && transcriptRows.length > 0) {
      const t = transcriptRows[0];
      let sInfo = t.student_info;
      let sData = t.semesters_data;
      try { if (typeof sInfo === "string") sInfo = JSON.parse(sInfo); } catch (e) {}
      try { if (typeof sData === "string") sData = JSON.parse(sData); } catch (e) {}
      transcript = {
        studentInfo: sInfo,
        semesters: sData,
        cgpa: t.cgpa,
        totalCredits: t.total_credits,
        updatedAt: t.updated_at
      };
    }

    res.json({
      user: users[0],
      results: results,
      transcript: transcript
    });
  });
});

});
});

// ADMIN: GET SUBJECT GRADES
app.get("/admin/result/:resultId/grades", (req, res) => {
const resultId = req.params.resultId;

const sql =
"SELECT subject_name, grade, credit_hours FROM subject_grades WHERE result_id = ?";

db.query(sql, [resultId], (error, grades) => {
if (error) {
return res.status(500).json({
message: "Could not get subject grades"
});
}


res.json(grades);

});
});

// ADMIN: DELETE USER
app.delete("/admin/user/:id", (req, res) => {
const userId = req.params.id;

const sql =
"DELETE FROM users WHERE id = ?";

db.query(sql, [userId], (error, result) => {
if (error) {
console.log(error);

  return res.status(500).json({
    message: "Could not delete user"
  });
}

if (result.affectedRows === 0) {
  return res.status(404).json({
    message: "User not found"
  });
}

res.json({
  message: "User and all academic data deleted successfully"
});


});
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
