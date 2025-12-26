const db = require("../db");

/* ADD EXPENSE */
exports.addExpense = (req, res) => {
  const { title, amount, type, category, expense_date } = req.body;
  const user_id = req.session.user.id;

  const sql = `
    INSERT INTO expenses (user_id, title, amount, type, category, expense_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [user_id, title, amount, type, category, expense_date], (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json({ message: "Expense added successfully" });
  });
};

/* GET EXPENSES */
exports.getExpenses = (req, res) => {
  const user_id = req.session.user.id;

  db.query(
    "SELECT * FROM expenses WHERE user_id = ?",
    [user_id],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.json(data);
    }
  );
};
