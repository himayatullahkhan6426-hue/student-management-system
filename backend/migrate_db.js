const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect((err) => {
  if (err) {
    console.error("Connection error:", err.message);
    process.exit(1);
  }
  console.log("Connected to MySQL!");

  // 1. Create student_transcripts table
  const createTranscriptsTable = `
    CREATE TABLE IF NOT EXISTS student_transcripts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      student_info JSON,
      semesters_data JSON NOT NULL,
      cgpa DECIMAL(3,2) DEFAULT 0.00,
      total_credits DECIMAL(5,2) DEFAULT 0.00,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_student (user_id)
    );
  `;

  db.query(createTranscriptsTable, (err) => {
    if (err) {
      console.error("Error creating student_transcripts table:", err);
    } else {
      console.log("student_transcripts table verified / created successfully!");
    }

    // Check table
    db.query("DESCRIBE student_transcripts;", (err, desc) => {
      console.log("student_transcripts schema:");
      console.table(desc);
      db.end();
    });
  });
});
