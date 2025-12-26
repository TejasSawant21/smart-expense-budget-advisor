const db = require("../db");

/* ADD FEEDBACK */
exports.addFeedback = (req, res) => {
  const user_id = req.session.user.id;
  const { message } = req.body;

  const sql = `
    INSERT INTO feedback (user_id, message)
    VALUES (?, ?)
  `;

  db.query(sql, [user_id, message], (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json({ message: "Feedback submitted successfully" });
  });
};

/* GET USER FEEDBACK */
exports.getFeedback = (req, res) => {
  const user_id = req.session.user.id;

  db.query(
    "SELECT * FROM feedback WHERE user_id = ?",
    [user_id],
    (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.json(data);
    }
  );
};

