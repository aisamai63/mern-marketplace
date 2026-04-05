const ApiError = require("../utils/ApiError");

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    const validationMessages = Object.values(err.errors || {}).map(
      (item) => item.message,
    );
    message = validationMessages[0] || "Validation failed";
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== "development") {
    message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
