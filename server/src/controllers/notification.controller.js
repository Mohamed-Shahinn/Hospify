const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, paginationMeta } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { PAGINATION } = require('../config/constants');

/**
 * GET /api/notifications
 * All roles — Get user's own notifications. Supports page and limit.
 */
const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  // Option to filter by unread only
  const query = { userId: req.user._id };
  if (req.query.unreadOnly === 'true') {
    query.isRead = false;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(query),
  ]);

  return successResponse(res, {
    message: 'Notifications retrieved successfully.',
    data: notifications,
    meta: paginationMeta(total, page, limit),
  });
});

/**
 * PATCH /api/notifications/:id/read
 * All roles — Mark a specific notification as read.
 */
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    throw new AppError('Notification not found.', 404);
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return successResponse(res, {
    message: 'Notification marked as read.',
    data: notification,
  });
});

/**
 * PATCH /api/notifications/read-all
 * All roles — Mark all notifications of the user as read.
 */
const markAllRead = asyncHandler(async (req, res) => {
  const now = new Date();
  const result = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    {
      $set: {
        isRead: true,
        readAt: now,
      },
    }
  );

  return successResponse(res, {
    message: 'All notifications marked as read.',
    data: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
  });
});

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};
