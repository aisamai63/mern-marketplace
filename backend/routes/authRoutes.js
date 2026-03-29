const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validationMiddleware");

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", protect, getMe);

// Logout endpoint
router.post("/logout", (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
