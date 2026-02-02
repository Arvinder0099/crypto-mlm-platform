const mongoose = require('mongoose');

const dashboardSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  widgets: {
    dailyAllotted: { type: Boolean, default: true },
    referralBonus: { type: Boolean, default: true },
    totalMembers: { type: Boolean, default: true },
    activeMembers: { type: Boolean, default: true },
    investments: { type: Boolean, default: true },
    withdrawals: { type: Boolean, default: true },
    creditDebit: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DashboardSettings', dashboardSettingsSchema);
