const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../config/constants');

/**
 * Notification Model — In-app notifications for all user types.
 *
 * Relationship: Notification.userId → User._id
 *
 * Notifications are created server-side by the NotificationService
 * whenever a significant event occurs (appointment booked, cancelled, etc.)
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },

    type: {
      type: String,
      enum: {
        values: Object.values(NOTIFICATION_TYPES),
        message: 'Invalid notification type',
      },
      required: [true, 'Notification type is required'],
    },

    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title must be under 200 characters'],
    },

    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message must be under 1000 characters'],
    },

    // Optional data payload for frontend to deep-link (e.g. appointmentId)
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// TTL index: auto-delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
