const mongoose = require("mongoose");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Review = require("../models/Review");
const Message = require("../models/Message");
const History = require("../models/History");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const VALID_ROLES = ["user", "admin"];

const ensureObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
};

const recalcListingStats = async (listingId) => {
  const stats = await Review.aggregate([
    { $match: { listing: mongoose.Types.ObjectId.createFromHexString(listingId) } },
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
    return;
  }

  await Listing.findByIdAndUpdate(listingId, {
    averageRating: 0,
    reviewsCount: 0,
  });
};

const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({})
    .select("-password")
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, {
    count: users.length,
    items: users,
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "user id");
  const nextRole = String(req.body.role || "").trim();

  if (!VALID_ROLES.includes(nextRole)) {
    throw new ApiError(400, `role must be one of: ${VALID_ROLES.join(", ")}`);
  }

  const currentAdminId = req.user?._id?.toString();
  if (currentAdminId && currentAdminId === req.params.id && nextRole !== "admin") {
    throw new ApiError(400, "You cannot remove your own admin role");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: nextRole },
    { new: true, runValidators: true, select: "-password" },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return sendSuccess(res, 200, user);
});

const deleteUserByAdmin = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "user id");

  const currentAdminId = req.user?._id?.toString();
  if (currentAdminId && currentAdminId === req.params.id) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userListings = await Listing.find({ user: user._id }).select("_id");
  const listingIds = userListings.map((item) => item._id);

  if (listingIds.length > 0) {
    await User.updateMany({}, { $pull: { favorites: { $in: listingIds } } });
  }

  await Promise.all([
    Listing.deleteMany({ user: user._id }),
    Review.deleteMany({
      $or: [
        { user: user._id },
        ...(listingIds.length > 0 ? [{ listing: { $in: listingIds } }] : []),
      ],
    }),
    Message.deleteMany({
      $or: [
        { sender: user._id },
        { recipient: user._id },
        ...(listingIds.length > 0 ? [{ listing: { $in: listingIds } }] : []),
      ],
    }),
    History.deleteMany({
      $or: [
        { user: user._id },
        ...(listingIds.length > 0 ? [{ listing: { $in: listingIds } }] : []),
      ],
    }),
    User.findByIdAndDelete(user._id),
  ]);

  return sendSuccess(res, 200, { id: user._id });
});

const listListingsForAdmin = asyncHandler(async (req, res) => {
  const status = String(req.query.status || "all");
  const query = {};

  if (status !== "all") {
    query.status = status;
  }

  const listings = await Listing.find(query)
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, {
    count: listings.length,
    items: listings,
  });
});

const deleteListingByAdmin = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "listing id");
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  await Promise.all([
    Listing.findByIdAndDelete(listing._id),
    Review.deleteMany({ listing: listing._id }),
    Message.deleteMany({ listing: listing._id }),
    History.deleteMany({ listing: listing._id }),
    User.updateMany({}, { $pull: { favorites: listing._id } }),
  ]);

  return sendSuccess(res, 200, { id: listing._id });
});

const listReviewsForAdmin = asyncHandler(async (req, res) => {
  const status = String(req.query.status || "all");
  const query = {};
  if (status !== "all") {
    query.status = status;
  }

  const reviews = await Review.find(query)
    .populate("user", "name email")
    .populate("listing", "title status")
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, {
    count: reviews.length,
    items: reviews,
  });
});

const deleteReviewByAdmin = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "review id");
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await Review.findByIdAndDelete(review._id);
  await recalcListingStats(review.listing.toString());

  return sendSuccess(res, 200, { id: review._id });
});

module.exports = {
  listUsers,
  updateUserRole,
  deleteUserByAdmin,
  listListingsForAdmin,
  deleteListingByAdmin,
  listReviewsForAdmin,
  deleteReviewByAdmin,
};
