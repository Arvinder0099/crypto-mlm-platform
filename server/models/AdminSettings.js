const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    value: mongoose.Schema.Types.Mixed,
    description: String,
    dataType: { type: String, enum: ['string', 'number', 'boolean', 'object', 'array'] },
    
    // Commission Rates (Production)
    directCommissionRate: { type: Number, default: 8 }, // 8% direct commission
    levelCommissionRates: {
      level1: { type: Number, default: 4 }, // 4% from level 1
      level2: { type: Number, default: 2 }, // 2% from level 2
      level3: { type: Number, default: 1 }, // 1% from level 3
      level4: { type: Number, default: 0.5 }, // 0.5% from level 4
      level5: { type: Number, default: 0.25 }, // 0.25% from level 5
    },
    
    // Withdrawal Settings (Production)
    minWithdrawal: { type: Number, default: 100 }, // Minimum 100 USDT
    maxWithdrawal: { type: Number, default: 5000 }, // Maximum 5,000 USDT
    withdrawalFeePercent: { type: Number, default: 3 }, // 3% withdrawal fee
    withdrawalApprovalRequired: { type: Boolean, default: true }, // Manual approval required
    
    // Platform Settings (Production)
    platformFeePercent: { type: Number, default: 2 }, // 2% platform fee on investments
    maintenanceFeePercent: { type: Number, default: 1 }, // 1% maintenance fee
    
    // Deposit Settings (Real constraints)
    depositWalletAddress: String,
    minimumDeposit: { type: Number, default: 100 }, // Minimum 100 USDT
    maximumDeposit: { type: Number, default: 1000000 }, // Maximum 1M USDT
    
    // System Status
    platformStatus: { type: String, enum: ['active', 'maintenance', 'closed'], default: 'active' },
    maintenanceMessage: String,
    
    updatedBy: mongoose.Schema.Types.ObjectId,
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
