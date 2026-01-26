import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // Personal Information
    userId: { type: String, unique: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    phone: String,
    country: String,
    address: String,

    // MLM Information
    referralCode: { type: String, unique: true, required: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    directReferrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downlineUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Account Status
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
    kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

    // Financial Information
    balance: { type: Number, default: 0, min: 0 },
    totalInvested: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0, min: 0 },
    totalWithdrawn: { type: Number, default: 0, min: 0 },
    pendingWithdrawal: { type: Number, default: 0, min: 0 },

    // Investment Details
    activeInvestments: { type: Number, default: 0, min: 0 },
    totalInvestmentCount: { type: Number, default: 0, min: 0 },

    // Commission Tracking
    totalDirectCommission: { type: Number, default: 0, min: 0 },
    totalLevelCommission: { type: Number, default: 0, min: 0 },
    totalRankIncome: { type: Number, default: 0, min: 0 },
    
    // Referral Bonus Tracking
    totalReferralBonus: { type: Number, default: 0, min: 0 },
    referralBonusCount: { type: Number, default: 0, min: 0 },

    // Deposit Address
    walletAddress: String,
    walletType: { type: String, enum: ['usdt_trc20', 'bnb_bep20'], default: 'usdt_trc20' },
    walletAddressApproved: Boolean,

    // Metadata
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,

    // Email & Phone Verification
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    phoneVerificationCode: String,
    phoneVerificationExpires: Date,
    phoneCountryCode: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ referredBy: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);
