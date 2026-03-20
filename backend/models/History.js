const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['created_listing', 'updated_listing', 'deleted_listing', 'purchased', 'sold'],
  },
  listing: {
    type: mongoose.Schema.ObjectId,
    ref: 'Listing',
  },
  details: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('History', historySchema);