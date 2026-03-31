const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
    },
    images: [
      {
        type: String, // URLs to images
      },
    ],
    location: {
      type: String,
      required: [true, "Please add a location"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "sold", "inactive"],
      default: "active",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for search
listingSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Listing", listingSchema);
