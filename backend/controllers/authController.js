const db = require("../db");
const bcrypt = require("bcryptjs");

/* ---------- REGISTER ---------- */
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const hash = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hash],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Database error" });
      }

      res.json({ message: "Registered successfully" });
    }
  );
};

/* ---------- LOGIN ---------- */
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  db.query(
    "SELECT id, name, email, password FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = result[0];
      const match = bcrypt.compareSync(password, user.password);

      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // 🔥 STORE FULL USER IN SESSION
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email
      };

      res.json({
        message: "Login successful",
        user: req.session.user
      });
    }
  );
};

/* ---------- LOGOUT ---------- */
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("smart-expense-session");
    res.json({ message: "Logged out" });
  });
};

/* ---------- CHECK SESSION ---------- */
exports.check = (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(401).json({ loggedIn: false });
  }
};

