import express from "express";
import {
  createListing,
  getListings,
  updateListing,
  deleteListing
} from "../controllers/listingController.js";

const router = express.Router();

router.post("/", createListing);
router.get("/", getListings);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);

export default router; // ✅ THIS LINE IS IMPORTANT