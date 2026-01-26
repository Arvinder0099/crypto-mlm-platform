const mongoose = require('mongoose');

const referralBonusSchema = new mongoose.Schema(
  {
    // The user who made the referral (gets the bonus)
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // The user who was referred (used the referral link)
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Bonus details
    bonusPercentage: { type: Number, default: 10 }, // Default 10% bonus
    bonusAmount: { type: Number, default: 0 }, // Calculated bonus amount in USDT
    
    // Status of the bonus
    status: { 
      type: String, 
      enum: ['pending', 'credited', 'cancelled'], 
      default: 'pending' 
    },
    
    // When the bonus was credited
    creditedAt: Date,
    
    // Notes
    description: String,
    adminNotes: String,
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for performance
referralBonusSchema.index({ referrerId: 1 });
referralBonusSchema.index({ referredUserId: 1 });
referralBonusSchema.index({ status: 1 });
referralBonusSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ReferralBonus', referralBonusSchema);
