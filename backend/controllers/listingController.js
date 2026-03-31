const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const History = require("../models/History");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const ALLOWED_STATUS = ["active", "sold", "inactive"];
const ALLOWED_UPDATE_FIELDS = [
  "title",
  "description",
  "price",
  "category",
  "images",
  "location",
  "status",
];

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : value;

const ensureObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
};

const getAuthenticatedUserId = (req) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Not authorized");
  }

  return userId.toString();
};

const parsePrice = (price, fieldName = "price") => {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    throw new ApiError(400, `${fieldName} must be a non-negative number`);
  }

  return numericPrice;
};

const parseImages = (images) => {
  if (!Array.isArray(images)) {
    throw new ApiError(400, "images must be an array");
  }

  return images
    .map((img) => normalizeString(img))
    .filter((img) => typeof img === "string" && img.length > 0);
};

const validateUpdatePayload = (payload) => {
  const keys = Object.keys(payload || {}).filter((key) =>
    ALLOWED_UPDATE_FIELDS.includes(key),
  );

  if (keys.length === 0) {
    throw new ApiError(
      400,
      `At least one updatable field is required: ${ALLOWED_UPDATE_FIELDS.join(", ")}`,
    );
  }

  const validated = {};

  keys.forEach((key) => {
    if (key === "price") {
      validated.price = parsePrice(payload.price);
      return;
    }

    if (key === "images") {
      validated.images = parseImages(payload.images);
      return;
    }

    if (key === "status") {
      const status = normalizeString(payload.status);
      if (!ALLOWED_STATUS.includes(status)) {
        throw new ApiError(
          400,
          `status must be one of: ${ALLOWED_STATUS.join(", ")}`,
        );
      }
      validated.status = status;
      return;
    }

    const value = normalizeString(payload[key]);
    if (!value) {
      throw new ApiError(400, `${key} cannot be empty`);
    }

    validated[key] = value;
  });

  return validated;
};

// @desc    Get all listings (with search & filters)
// @route   GET /api/listings
// @access  Public
const getListings = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, location } = req.query;
  const query = { status: "active" };

  if (q) {
    query.$text = { $search: q };
  }
  if (category) {
    query.category = category;
  }
  if (location) {
    query.location = location;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const listings = await Listing.find(query)
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, {
    count: listings.length,
    items: listings,
  });
});

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListing = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "listing id");

  const listing = await Listing.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  return sendSuccess(res, 200, listing);
});

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private
const createListing = asyncHandler(async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const payload = {
    title: normalizeString(req.body.title),
    description: normalizeString(req.body.description),
    price: Number(req.body.price),
    category: normalizeString(req.body.category),
    location: normalizeString(req.body.location),
    images: [],
  };

  // Handle uploaded files (images/videos)
  if (req.files && req.files.length > 0) {
    payload.images = req.files.map((file) => `/uploads/${file.filename}`);
  } else if (req.body.images !== undefined) {
    payload.images = parseImages(req.body.images);
  }

  if (req.body.status !== undefined) {
    payload.status = normalizeString(req.body.status);
  }

  payload.user = userId;

  const listing = await Listing.create(payload);

  await History.create({
    user: userId,
    action: "created_listing",
    listing: listing._id,
  });

  return sendSuccess(res, 201, listing);
});

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "listing id");

  const userId = getAuthenticatedUserId(req);
  let listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (listing.user.toString() !== userId && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to update this listing");
  }

  const updateData = validateUpdatePayload(req.body);

  // If new files uploaded, replace images array
  if (req.files && req.files.length > 0) {
    updateData.images = req.files.map((file) => `/uploads/${file.filename}`);
  }

  listing = await Listing.findByIdAndUpdate(req.params.id, updateData, {
    returnDocument: "after",
    runValidators: true,
  });

  await History.create({
    user: userId,
    action: "updated_listing",
    listing: listing._id,
  });

  return sendSuccess(res, 200, listing);
});

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "listing id");

  const userId = getAuthenticatedUserId(req);
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  if (listing.user.toString() !== userId && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to delete this listing");
  }

  await Listing.findByIdAndDelete(listing._id);

  await History.create({
    user: userId,
    action: "deleted_listing",
    listing: listing._id,
  });

  return sendSuccess(res, 200, {
    id: listing._id,
  });
});

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
};
