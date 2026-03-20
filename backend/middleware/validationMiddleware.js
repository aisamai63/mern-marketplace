const { body, validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new ApiError(400, errors.array({ onlyFirstError: true })[0].msg),
    );
  }

  return next();
};

const registerValidation = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("valid email is required")
    .normalizeEmail(),
  body("password")
    .isString()
    .withMessage("password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  validateRequest,
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("valid email is required")
    .normalizeEmail(),
  body("password").isString().withMessage("password is required"),
  validateRequest,
];

const createListingValidation = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("description").trim().notEmpty().withMessage("description is required"),
  body("price")
    .notEmpty()
    .withMessage("price is required")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("price must be a non-negative number")
    .toFloat(),
  body("category").trim().notEmpty().withMessage("category is required"),
  body("location").trim().notEmpty().withMessage("location is required"),
  body("images").optional().isArray().withMessage("images must be an array"),
  body("images.*")
    .optional()
    .isString()
    .withMessage("each image must be a string")
    .trim(),
  body("status")
    .optional()
    .isIn(["active", "sold", "inactive"])
    .withMessage("status must be one of: active, sold, inactive"),
  validateRequest,
];

module.exports = {
  registerValidation,
  loginValidation,
  createListingValidation,
};
