const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!process.env.JWT_SECRET) {
    throw new ApiError(500, "JWT_SECRET is not configured");
  }

  if (!/^Bearer\s+/i.test(authHeader)) {
    throw new ApiError(401, "Not authorized, no token");
  }

  const token = authHeader.split(" ")[1]?.trim();
  if (!token) {
    throw new ApiError(401, "Not authorized, malformed token");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Not authorized, token expired"
        : "Not authorized, token failed";
    throw new ApiError(401, message);
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    throw new ApiError(401, "Not authorized, user not found");
  }

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authorized"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role ${req.user.role} is not authorized to access this route`,
        ),
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
