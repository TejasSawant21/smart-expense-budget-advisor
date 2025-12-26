const express = require("express");
const session = require("express-session");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

/* ✅ FIXED CORS CONFIG */
app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

app.use(session({
  secret: "smart_expense_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/feedback", feedbackRoutes);

app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
