const express = require('express');
const router = express.Router();
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getListings).post(protect, createListing);
router
  .route('/:id')
  .get(getListing)
  .put(protect, updateListing)
  .delete(protect, deleteListing);

module.exports = router;