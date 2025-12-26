const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const expenseController = require("../controllers/expenseController");

router.post("/", auth, expenseController.addExpense);
router.get("/", auth, expenseController.getExpenses);

module.exports = router;
