const express = require("express");
const router = express.Router();
const {
  getListings,
  getMyListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  sendInquiry,
} = require("../controllers/listingController");
const {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  listPendingReviews,
} = require("../controllers/reviewController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createListingValidation,
} = require("../middleware/validationMiddleware");

const upload = require("../middleware/uploadMiddleware");

// Contact/inquiry endpoint
router.post("/:id/contact", protect, sendInquiry);

// Authenticated user listings
router.get("/me", protect, getMyListings);

router.route("/").get(getListings).post(
  protect,
  upload.array("media", 10), // up to 10 files
  createListingValidation,
  createListing,
);
router
  .route("/:id")
  .get(getListing)
  .put(
    protect,
    upload.array("media", 10), // up to 10 files
    updateListing,
  )
  .delete(protect, deleteListing);

// Reviews for a listing
router.route("/:id/reviews").get(getReviews).post(protect, addReview);

router
  .route("/:id/reviews/:reviewId")
  .put(protect, updateReview)
  .delete(protect, deleteReview);

// Admin moderation endpoints
router.get("/reviews/pending", protect, adminOnly, listPendingReviews);
router.post(
  "/:id/reviews/:reviewId/approve",
  protect,
  adminOnly,
  approveReview,
);
router.post("/:id/reviews/:reviewId/reject", protect, adminOnly, rejectReview);

module.exports = router;
