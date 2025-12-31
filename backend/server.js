const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

/* =========================
   APP INIT (FIRST)
========================= */
const app = express();

/* =========================
   IMPORT ROUTES (AFTER app)
========================= */
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");

/* =========================
   MIDDLEWARE
========================= */

// CORS (safe for local + deployment)
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  name: "smart-expense-session",
  secret: "smart_expense_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,   // true only for HTTPS
    httpOnly: true,
    sameSite: "lax"
  }
}));

/* =========================
   SERVE FRONTEND
========================= */
app.use(express.static(path.join(__dirname, "../frontend")));

/* =========================
   API ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);

/* =========================
   AUTH CHECK (USER)
========================= */
app.get("/api/check-auth", (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

/* =========================
   DEFAULT ROUTE
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
