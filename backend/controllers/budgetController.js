const db = require("../db");

/* SET MONTHLY BUDGET */
exports.setBudget = (req, res) => {
  const { category, monthly_limit, month } = req.body;
  const user_id = req.session.user.id;

  const sql = `
    INSERT INTO budgets (user_id, category, monthly_limit, month)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, category, monthly_limit, month], (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json({ message: "Budget set successfully" });
  });
};

/* GET USER BUDGETS */
exports.getBudgets = (req, res) => {
  const user_id = req.session.user.id;

  db.query(
    "SELECT * FROM budgets WHERE user_id = ?",
    [user_id],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.json(data);
    }
  );
};

