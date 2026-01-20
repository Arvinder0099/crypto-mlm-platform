const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['deposit', 'withdrawal', 'investment', 'earning', 'commission', 'refund'], 
      required: true 
    },
    amount: { type: Number, required: true },
    previousBalance: Number,
    newBalance: Number,
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'cancelled'], 
      default: 'completed' 
    },
    description: String,
    
    // Related Data
    investmentId: mongoose.Schema.Types.ObjectId,
    withdrawalId: mongoose.Schema.Types.ObjectId,
    referredUserId: mongoose.Schema.Types.ObjectId,
    
    // Payment Details
    paymentMethod: String,
    transactionHash: String,
    walletAddress: String,
    
    // Admin Notes
    adminNotes: String,
    processedBy: mongoose.Schema.Types.ObjectId,
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
transactionSchema.index({ userId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
