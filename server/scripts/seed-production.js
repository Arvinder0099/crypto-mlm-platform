/**
 * Production Seed Script
 * Creates empty production-ready database with admin settings
 * Run: node scripts/seed-production.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm';

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const adminSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: mongoose.Schema.Types.Mixed,
  
  directCommissionRate: { type: Number, default: 8 },
  levelCommissionRates: {
    level1: { type: Number, default: 4 },
    level2: { type: Number, default: 2 },
    level3: { type: Number, default: 1 },
    level4: { type: Number, default: 0.5 },
    level5: { type: Number, default: 0.25 },
  },
  
  minWithdrawal: { type: Number, default: 100 },
  maxWithdrawal: { type: Number, default: 100000 },
  withdrawalFeePercent: { type: Number, default: 3 },
  withdrawalApprovalRequired: { type: Boolean, default: true },
  
  platformFeePercent: { type: Number, default: 2 },
  maintenanceFeePercent: { type: Number, default: 1 },
  
  depositWalletAddress: String,
  minimumDeposit: { type: Number, default: 100 },
  maximumDeposit: { type: Number, default: 1000000 },
  
  platformStatus: { type: String, enum: ['active', 'maintenance', 'closed'], default: 'active' },
  maintenanceMessage: String,
  
  updatedBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

async function seedProduction() {
  try {
    console.log('\n🌱 Initializing Production Database...\n');
    
    // Clear existing settings
    await AdminSettings.deleteMany({});
    console.log('🗑️  Cleared existing admin settings');
    
    // Create production settings
    const settings = {
      key: 'platform_settings',
      value: { environment: 'production' },
      directCommissionRate: 8,
      levelCommissionRates: {
        level1: 4,
        level2: 2,
        level3: 1,
        level4: 0.5,
        level5: 0.25,
      },
      minWithdrawal: 100,
      maxWithdrawal: 100000,
      withdrawalFeePercent: 3,
      withdrawalApprovalRequired: true,
      platformFeePercent: 2,
      maintenanceFeePercent: 1,
      minimumDeposit: 100,
      maximumDeposit: 1000000,
      platformStatus: 'active',
    };
    
    await AdminSettings.create(settings);
    console.log('✅ Production settings initialized');
    
    console.log('\n📊 Production Configuration:');
    console.log('═════════════════════════════════════════');
    console.log(`Direct Commission: ${settings.directCommissionRate}%`);
    console.log(`Level 1: ${settings.levelCommissionRates.level1}%`);
    console.log(`Withdrawal Fee: ${settings.withdrawalFeePercent}%`);
    console.log(`Platform Fee: ${settings.platformFeePercent}%`);
    console.log(`Min Withdrawal: $${settings.minWithdrawal}`);
    console.log(`Max Withdrawal: $${settings.maxWithdrawal}`);
    
    console.log('\n✨ Production database ready!\n');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedProduction();
