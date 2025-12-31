const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/* ---------- AUTH ROUTES ---------- */

// Register new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Logout user (POST is safer than GET)
router.post("/logout", authController.logout);

// Check login session
router.get("/check", authController.check);

module.exports = router;
