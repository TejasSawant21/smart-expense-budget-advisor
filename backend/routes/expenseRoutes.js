const express = require("express");
const db = require("../db");
const router = express.Router();

/* ================= AUTH MIDDLEWARE ================= */
router.use((req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
});

/* ================= ADD EXPENSE ================= */
router.post("/", (req, res) => {
  const { title, amount, category } = req.body;

  if (!title || amount === undefined) {
    return res.status(400).json({ message: "Invalid data" });
  }

  db.query(
    "INSERT INTO expenses (user_id, title, amount, category) VALUES (?, ?, ?, ?)",
    [
      req.session.user.id,
      title,
      amount,
      category || "General"
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Expense added" });
    }
  );
});

/* ================= GET EXPENSES ================= */
router.get("/", (req, res) => {
  db.query(
    "SELECT id, title, amount, category FROM expenses WHERE user_id = ? ORDER BY id ASC",
    [req.session.user.id],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json(rows);
    }
  );
});

/* ================= DELETE EXPENSE ================= */
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM expenses WHERE id = ? AND user_id = ?",
    [req.params.id, req.session.user.id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Expense deleted" });
    }
  );
});

/* ================= UPDATE EXPENSE ================= */
router.put("/:id", (req, res) => {
  const { title, amount, category } = req.body;

  db.query(
    "UPDATE expenses SET title=?, amount=?, category=? WHERE id=? AND user_id=?",
    [title, amount, category, req.params.id, req.session.user.id],
    err => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ message: "Updated" });
    }
  );
});

module.exports = router;
