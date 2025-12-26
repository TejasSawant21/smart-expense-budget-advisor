const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "tejas",        
  database: "smart_expense_db"
});

db.connect((err) => {
  if (err) {
    console.log("❌ MySQL Connection Error:", err);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});

module.exports = db;
