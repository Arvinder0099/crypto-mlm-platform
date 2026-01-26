const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema(
  {
    // Notification type
    type: { 
      type: String, 
      enum: ['referral_registration', 'withdrawal_request', 'deposit', 'kyc_submission', 'system_alert', 'other'],
      required: true 
    },
    
    // Title and message
    title: { type: String, required: true },
    message: { type: String, required: true },
    
    // Related user (who triggered the notification)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Related referrer (for referral notifications)
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Related data (flexible - can store any relevant data)
    data: {
      referralCode: String,
      referrerName: String,
      newUserName: String,
      newUserEmail: String,
      bonusAmount: Number,
      transactionId: mongoose.Schema.Types.ObjectId,
      investmentId: mongoose.Schema.Types.ObjectId,
    },
    
    // Read status
    isRead: { type: Boolean, default: false },
    readAt: Date,
    readBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Priority
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for performance
adminNotificationSchema.index({ type: 1 });
adminNotificationSchema.index({ isRead: 1 });
adminNotificationSchema.index({ createdAt: -1 });
adminNotificationSchema.index({ priority: 1 });

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
