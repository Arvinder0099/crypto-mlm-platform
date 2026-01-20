import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    
    // Investment Details
    amount: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    daysCompleted: { type: Number, default: 0 },
    
    // Status
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    
    // Earnings
    totalEarned: { type: Number, default: 0 },
    dailyEarned: { type: Number, default: 0 },
    lastEarningDate: Date,
    earningHistory: [
      {
        date: Date,
        amount: Number,
        status: { type: String, enum: ['pending', 'credited'], default: 'credited' },
      },
    ],
    
    // Payment
    paymentMethod: String,
    transactionHash: String,
    paymentVerified: { type: Boolean, default: true },
    
    // Referral Bonus
    referralBonus: { type: Number, default: 0 },
    
    // Metadata
    activationFor: String, // 'self' or 'downline'
    downlineUserId: mongoose.Schema.Types.ObjectId,
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
investmentSchema.index({ userId: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ startDate: -1 });

export default mongoose.model('Investment', investmentSchema);
