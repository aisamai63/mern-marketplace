const express = require("express");
const {
  listUsers,
  updateUserRole,
  deleteUserByAdmin,
  listListingsForAdmin,
  deleteListingByAdmin,
  listReviewsForAdmin,
  deleteReviewByAdmin,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUserByAdmin);

router.get("/listings", listListingsForAdmin);
router.delete("/listings/:id", deleteListingByAdmin);

router.get("/reviews", listReviewsForAdmin);
router.delete("/reviews/:id", deleteReviewByAdmin);

module.exports = router;
