const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['direct', 'level', 'rank'], required: true },
    amount: { type: Number, required: true },
    
    // Related User/Investment
    sourceUserId: mongoose.Schema.Types.ObjectId,
    investmentId: mongoose.Schema.Types.ObjectId,
    
    // Level Information (for level income)
    level: Number,
    
    // Status
    status: { type: String, enum: ['pending', 'credited'], default: 'pending' },
    
    description: String,
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
commissionSchema.index({ userId: 1 });
commissionSchema.index({ type: 1 });
commissionSchema.index({ status: 1 });

module.exports = mongoose.model('Commission', commissionSchema);
