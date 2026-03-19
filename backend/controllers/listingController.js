const Listing = require('../models/Listing');
const History = require('../models/History');

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'active' }).populate('user', 'name email');
    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('user', 'name email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const listing = await Listing.create(req.body);

    // Create history entry
    await History.create({
      user: req.user.id,
      action: 'created_listing',
      listing: listing._id,
    });

    res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Make sure user is listing owner
    if (listing.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this listing' });
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Create history entry
    await History.create({
      user: req.user.id,
      action: 'updated_listing',
      listing: listing._id,
    });

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Make sure user is listing owner
    if (listing.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this listing' });
    }

    await listing.remove();

    // Create history entry
    await History.create({
      user: req.user.id,
      action: 'deleted_listing',
      listing: listing._id,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
};