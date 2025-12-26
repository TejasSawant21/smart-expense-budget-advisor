const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const budgetController = require("../controllers/budgetController");

router.post("/", auth, budgetController.setBudget);
router.get("/", auth, budgetController.getBudgets);

module.exports = router;
