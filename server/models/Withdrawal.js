const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    walletAddress: { type: String, required: true },
    
    // Status
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed', 'failed'], default: 'pending' },
    
    // Approval
    approvedBy: mongoose.Schema.Types.ObjectId,
    rejectionReason: String,
    approvalDate: Date,
    
    // Payment
    transactionHash: String,
    paymentDate: Date,
    paymentMethod: { type: String, default: 'crypto' },
    
    // Metadata
    requestReason: String,
    adminNotes: String,
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
withdrawalSchema.index({ userId: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
