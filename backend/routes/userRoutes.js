const express = require("express");
const router = express.Router();
const {
  getMe,
  updateMe,
  addFavorite,
  removeFavorite,
  getFavorites,
  getHistory,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

// Favorites (Wishlist)
router.post("/favorites/:listingId", protect, addFavorite);
router.delete("/favorites/:listingId", protect, removeFavorite);
router.get("/favorites", protect, getFavorites);
router.get("/history", protect, getHistory);

module.exports = router;
