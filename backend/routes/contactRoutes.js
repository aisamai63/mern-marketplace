const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { sendInquiry } = require("../controllers/listingController");

// ...existing routes...

// Contact form endpoint
router.post("/contact/:id", protect, sendInquiry);

module.exports = router;
