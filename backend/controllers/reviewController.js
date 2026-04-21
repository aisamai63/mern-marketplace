const mongoose = require("mongoose");
const Review = require("../models/Review");
const Listing = require("../models/Listing");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const ensureObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
};

const recalcListingStats = async (listingId) => {
  const stats = await Review.aggregate([
    { $match: { listing: new mongoose.Types.ObjectId(listingId) } },
    {
      $group: {
        _id: "$listing",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    const { avgRating, count } = stats[0];
    await Listing.findByIdAndUpdate(listingId, {
      averageRating: Math.round(avgRating * 10) / 10,
      reviewsCount: count,
    });
  } else {
    await Listing.findByIdAndUpdate(listingId, {
      averageRating: 0,
      reviewsCount: 0,
    });
  }
};

const recalcListingStatsSafe = async (listingId) => {
  try {
    await recalcListingStats(listingId);
  } catch (error) {
    // Do not fail review mutations if aggregate stats recalculation has an issue.
    console.error(`Failed to recalculate listing stats for ${listingId}:`, error.message);
  }
};

// POST /api/listings/:id/reviews
const addReview = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "listing id");
  const listingId = req.params.id;
  const userId = req.user?._id || req.user?.id;
  if (!userId) throw new ApiError(401, "Not authorized");

  const { rating, comment } = req.body;
  const numericRating = Number(rating);
  if (
    !Number.isFinite(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw new ApiError(400, "rating must be a number between 1 and 5");
  }

  // Upsert behavior: if user already reviewed, update it
  const existing = await Review.findOne({ listing: listingId, user: userId });
  if (existing) {
    existing.rating = numericRating;
    existing.comment = comment || "";
    await existing.save();
    await recalcListingStatsSafe(listingId);
    return sendSuccess(res, 200, existing);
  }

  const review = await Review.create({
    listing: listingId,
    user: userId,
    rating: numericRating,
    comment: comment || "",
    status: "approved", // Auto-approve on submission
  });

  await recalcListingStatsSafe(listingId);

  return sendSuccess(res, 201, review);
});

// GET /api/listings/:id/reviews
const getReviews = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "listing id");
  const listingId = req.params.id;

  // Pagination
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [items, count] = await Promise.all([
    Review.find({ listing: listingId, status: "approved" })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ listing: listingId, status: "approved" }),
  ]);

  return sendSuccess(res, 200, { count, items });
});

// PUT /api/listings/:id/reviews/:reviewId
const updateReview = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "listing id");
  ensureObjectId(req.params.reviewId, "review id");
  const userId = req.user?._id || req.user?.id;
  if (!userId) throw new ApiError(401, "Not authorized");

  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.user.toString() !== userId && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to update this review");
  }

  if (req.body.rating !== undefined) {
    const numericRating = Number(req.body.rating);
    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      throw new ApiError(400, "rating must be a number between 1 and 5");
    }
    review.rating = numericRating;
  }
  if (req.body.comment !== undefined) review.comment = req.body.comment;

  await review.save();
  await recalcListingStatsSafe(req.params.id);

  return sendSuccess(res, 200, review);
});

// DELETE /api/listings/:id/reviews/:reviewId
const deleteReview = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "listing id");
  ensureObjectId(req.params.reviewId, "review id");
  const userId = req.user?._id || req.user?.id;
  if (!userId) throw new ApiError(401, "Not authorized");

  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.user.toString() !== userId && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to delete this review");
  }

  await Review.findByIdAndDelete(req.params.reviewId);
  await recalcListingStatsSafe(req.params.id);

  return sendSuccess(res, 200, { id: req.params.reviewId });
});

// ADMIN: Approve a review
// POST /api/listings/:id/reviews/:reviewId/approve
const approveReview = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "listing id");
  ensureObjectId(req.params.reviewId, "review id");
  if (!req.user || req.user.role !== "admin")
    throw new ApiError(403, "Admin only");
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, "Review not found");
  review.status = "approved";
  review.moderatedBy = req.user._id;
  review.moderatedAt = new Date();
  review.moderationReason = "";
  await review.save();
  await recalcListingStatsSafe(req.params.id);
  return sendSuccess(res, 200, review);
});

// ADMIN: Reject a review
// POST /api/listings/:id/reviews/:reviewId/reject
const rejectReview = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "listing id");
  ensureObjectId(req.params.reviewId, "review id");
  if (!req.user || req.user.role !== "admin")
    throw new ApiError(403, "Admin only");
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, "Review not found");
  review.status = "rejected";
  review.moderatedBy = req.user._id;
  review.moderatedAt = new Date();
  review.moderationReason = req.body.reason || "";
  await review.save();
  await recalcListingStatsSafe(req.params.id);
  return sendSuccess(res, 200, review);
});

// ADMIN: List all pending reviews (optionally for a listing)
// GET /api/reviews/pending?listingId=...
const listPendingReviews = asyncHandler(async (req, res) => {
  const filter = { status: "pending" };
  if (req.query.listingId) filter.listing = req.query.listingId;
  const reviews = await Review.find(filter)
    .populate("user", "name email")
    .populate("listing", "title");
  return sendSuccess(res, 200, { count: reviews.length, items: reviews });
});

module.exports = {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  listPendingReviews,
};
