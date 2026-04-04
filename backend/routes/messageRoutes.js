const express = require("express");
const {
  getInboxMessages,
  getUnreadCount,
  markMessageAsRead,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getInboxMessages);
router.get("/unread-count", protect, getUnreadCount);
router.patch("/:id/read", protect, markMessageAsRead);

module.exports = router;
