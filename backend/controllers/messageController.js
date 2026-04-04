const mongoose = require("mongoose");
const Message = require("../models/Message");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getUserId = (req) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Not authorized");
  }
  return userId.toString();
};

const ensureObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
};

// @desc    Get inbox messages
// @route   GET /api/messages
// @access  Private
const getInboxMessages = asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const messages = await Message.find({ recipient: userId })
    .populate("sender", "name email")
    .populate("listing", "title price")
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, {
    count: messages.length,
    items: messages,
  });
});

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const unreadCount = await Message.countDocuments({
    recipient: userId,
    readAt: null,
  });

  return sendSuccess(res, 200, { unreadCount });
});

// @desc    Mark a message as read
// @route   PATCH /api/messages/:id/read
// @access  Private
const markMessageAsRead = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, "message id");
  const userId = getUserId(req);

  const message = await Message.findOne({
    _id: req.params.id,
    recipient: userId,
  });

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (!message.readAt) {
    message.readAt = new Date();
    await message.save();
  }

  return sendSuccess(res, 200, message);
});

module.exports = {
  getInboxMessages,
  getUnreadCount,
  markMessageAsRead,
};
