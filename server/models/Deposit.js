import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    network: { type: String, enum: ['usdt_trc20', 'bnb_bep20'], required: true },
    adminAddress: { type: String, required: true },
    userWalletAddress: { type: String, required: true },
    transactionHash: { type: String, required: true },
    paymentSlip: { type: String }, // File path or URL
    paymentSlipData: { type: Buffer }, // Store image data
    paymentSlipMimeType: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    adminNotes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
depositSchema.index({ userId: 1, status: 1 });
depositSchema.index({ status: 1, createdAt: -1 });
depositSchema.index({ transactionHash: 1 });

export default mongoose.model('Deposit', depositSchema);
