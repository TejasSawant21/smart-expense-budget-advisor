const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../db");

/* =========================
   🔐 ADMIN LOGIN
========================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // TEMP ADMIN (you already hashed admin21 correctly)
  const admin = {
    email: "admin@gmail.com",
    password: "$2a$10$m5bnuy3S0eR8r0xLhap53.l/5LQbAshuw82AEoP28kuO1dfVkyAA2"
  };

  if (email !== admin.email) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  req.session.admin = {
    email: admin.email,
    role: "admin"
  };

  res.json({ success: true });
});

/* =========================
   🔐 ADMIN AUTH CHECK
========================= */
router.get("/check", (req, res) => {
  if (req.session.admin) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

/* =========================
   🚪 ADMIN LOGOUT
========================= */
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("smart-expense-session");
    res.json({ success: true });
  });
});

/* =========================
   📊 REAL ADMIN STATS (DB)
========================= */
router.get("/stats", (req, res) => {
  if (!req.session.admin) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const stats = {};

  db.query("SELECT COUNT(*) AS totalUsers FROM users", (e1, r1) => {
    stats.totalUsers = r1[0].totalUsers;

    db.query("SELECT COUNT(*) AS totalTransactions FROM expenses", (e2, r2) => {
      stats.totalTransactions = r2[0].totalTransactions;

      db.query(
        "SELECT SUM(amount) AS totalIncome FROM expenses WHERE amount > 0",
        (e3, r3) => {
          stats.totalIncome = r3[0].totalIncome || 0;

          db.query(
            "SELECT SUM(ABS(amount)) AS totalExpense FROM expenses WHERE amount < 0",
            (e4, r4) => {
              stats.totalExpense = r4[0].totalExpense || 0;
              res.json(stats);
            }
          );
        }
      );
    });
  });
});

/* =========================
   🧾 ALL TRANSACTIONS (ADMIN)
========================= */
router.get("/transactions", (req, res) => {
  if (!req.session.admin) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  db.query(
    `SELECT e.id, u.name, e.title, e.amount, e.category
     FROM expenses e
     JOIN users u ON e.user_id = u.id
     ORDER BY e.id DESC`,
    (err, rows) => {
      res.json(rows);
    }
  );
});

/* =========================
   ❌ ADMIN DELETE TRANSACTION
========================= */
router.delete("/transaction/:id", (req, res) => {
  if (!req.session.admin) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  db.query(
    "DELETE FROM expenses WHERE id = ?",
    [req.params.id],
    () => res.json({ message: "Transaction deleted by admin" })
  );
});

/* =========================
   📈 ADMIN CHART DATA
========================= */
router.get("/charts", (req, res) => {
  if (!req.session.admin) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  db.query(
    `SELECT category, SUM(ABS(amount)) AS total
     FROM expenses
     WHERE amount < 0
     GROUP BY category`,
    (err, pieData) => {

      db.query(
        `SELECT DATE(created_at) AS day, SUM(ABS(amount)) AS total
         FROM expenses
         WHERE amount < 0
         GROUP BY DATE(created_at)
         ORDER BY day`,
        (err2, lineData) => {

          res.json({ pieData, lineData });
        }
      );
    }
  );
});

module.exports = router;

