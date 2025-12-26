const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const feedbackController = require("../controllers/feedbackController");

router.post("/", auth, feedbackController.addFeedback);
router.get("/", auth, feedbackController.getFeedback);

module.exports = router;
