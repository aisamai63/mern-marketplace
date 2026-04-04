const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

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
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");
    const listingId = req.params.listingId;
    // Compare ObjectIds as strings to avoid duplicate favorites
    if (!user.favorites.some((favId) => favId.toString() === listingId)) {
      user.favorites.push(listingId);
      await user.save();
    }
    const { sendSuccess } = require("../utils/apiResponse");
    sendSuccess(res, 200, { favorites: user.favorites });
  } catch (err) {
    console.error("addFavorite error:", err);
    res
      .status(500)
      .json({ success: false, message: err.message, stack: err.stack });
  }
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
  const { sendSuccess } = require("../utils/apiResponse");
  sendSuccess(res, 200, { favorites: user.favorites });
});

// @desc    Get all favorite listings for current user
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  if (!user) throw new ApiError(404, "User not found");
  const { sendSuccess } = require("../utils/apiResponse");
  sendSuccess(res, 200, { favorites: user.favorites });
});
