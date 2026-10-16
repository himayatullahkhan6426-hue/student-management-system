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
  if (err) throw err;
  db.query("SELECT id, name, email, is_admin FROM users;", (e, u) => {
    console.log("Users in DB:", u);
    db.query("SELECT * FROM results LIMIT 10;", (e2, r) => {
      console.log("Results in DB:", r);
      db.query("SELECT * FROM subject_grades LIMIT 10;", (e3, sg) => {
        console.log("Subject grades sample:", sg);
        db.end();
      });
    });
  });
});
