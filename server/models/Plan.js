import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    investment: { type: Number, required: true },
    dailyEarn: { type: Number, required: true },
    duration: { type: Number, required: true }, // in days
    totalReturn: { type: Number, required: true },
    roi: { type: Number, required: true }, // percentage
    note: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
