const db = require("../db");
const bcrypt = require("bcryptjs");

/* REGISTER */
exports.register = (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, hashedPassword], (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json({ message: "User registered successfully" });
  });
};

/* LOGIN */
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err || result.length === 0) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const user = result[0];
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    req.session.user = user;
    res.json({ message: "Login successful", user });
  });
};

/* LOGOUT */
exports.logout = (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out successfully" });
};
