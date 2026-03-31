const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    moderatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    moderatedAt: {
      type: Date,
    },
    moderationReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Ensure one review per user per listing
reviewSchema.index({ listing: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
