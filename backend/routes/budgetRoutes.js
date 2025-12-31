const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");

/* AUTH CHECK */
router.use((req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
});

/* ROUTES */
router.post("/", budgetController.setBudget);
router.get("/", budgetController.getBudgets);

module.exports = router;
