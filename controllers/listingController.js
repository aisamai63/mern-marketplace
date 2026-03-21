import Listing from "../models/listing.js";

export const createListing = async (req, res) => {
  const listing = new Listing(req.body);
  const saved = await listing.save();
  res.json(saved);
};

export const getListings = async (req, res) => {
  const listings = await Listing.find();
  res.json(listings);
};

export const updateListing = async (req, res) => {
  const updated = await Listing.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

export const deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};