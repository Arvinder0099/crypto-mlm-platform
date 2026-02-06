const mongoose = require('mongoose');

const dashboardValuesSchema = new mongoose.Schema({
  // Total Investment
  totalInvestment: { type: Number, default: 0 },
  adminInvestment: { type: Number, default: 0 },
  walletInvestment: { type: Number, default: 0 },
  directInvestment: { type: Number, default: 0 },
  
  // Income Summary
  dailyAllotted: { type: Number, default: 0 },
  referralBonusAllotted: { type: Number, default: 0 },
  
  // Member Count Statistics
  totalMembers: { type: Number, default: 0 },
  activeMembers: { type: Number, default: 0 },
  inactiveMembers: { type: Number, default: 0 },
  suspendedMembers: { type: Number, default: 0 },
  
  // Credit/Debit
  totalCredited: { type: Number, default: 0 },
  todayCredited: { type: Number, default: 0 },
  yesterdayCredited: { type: Number, default: 0 },
  totalDebited: { type: Number, default: 0 },
  todayDebited: { type: Number, default: 0 },
  yesterdayDebited: { type: Number, default: 0 },
  
  // Withdrawal Summary
  totalWithdrawal: { type: Number, default: 0 },
  pendingWithdrawal: { type: Number, default: 0 },
  approvedWithdrawal: { type: Number, default: 0 },
  rejectedWithdrawal: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('DashboardValues', dashboardValuesSchema);
