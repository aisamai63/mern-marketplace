const User = require("../models/User");
const History = require("../models/History");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/apiResponse");

// @desc    Get current user's profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: user });
});

// @desc    Update current user's profile
// @route   PUT /api/users/me
// @access  Private
exports.updateMe = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.email) updates.email = req.body.email;
  if (req.body.profilePicture) updates.profilePicture = req.body.profilePicture;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
    select: "-password",
  });
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: user });
});

// @desc    Add a listing to favorites
// @route   POST /api/users/favorites/:listingId
// @access  Private
exports.addFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");
  const listingId = req.params.listingId;
  // Compare ObjectIds as strings to avoid duplicate favorites
  if (!user.favorites.some((favId) => favId.toString() === listingId)) {
    user.favorites.push(listingId);
    await user.save();
  }

  sendSuccess(res, 200, { favorites: user.favorites });
});

// @desc    Remove a listing from favorites
// @route   DELETE /api/users/favorites/:listingId
// @access  Private
exports.removeFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");
  const listingId = req.params.listingId;
  user.favorites = user.favorites.filter(
    (favId) => favId.toString() !== listingId,
  );
  await user.save();
  sendSuccess(res, 200, { favorites: user.favorites });
});

// @desc    Get all favorite listings for current user
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  if (!user) throw new ApiError(404, "User not found");
  sendSuccess(res, 200, { favorites: user.favorites });
});

// @desc    Get authenticated user's activity history
// @route   GET /api/users/history
// @access  Private
exports.getHistory = asyncHandler(async (req, res) => {
  const historyItems = await History.find({ user: req.user._id })
    .populate("listing", "title status price")
    .sort({ createdAt: -1 })
    .limit(50);

  sendSuccess(res, 200, {
    count: historyItems.length,
    items: historyItems,
  });
});
