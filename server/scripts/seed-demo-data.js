/**
 * Seed Demo Data Script
 * Creates realistic demo data for testing the MLM platform
 * Run: node scripts/seed-demo-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm';
const allowDemoSeed = process.env.ALLOW_DEMO_SEED === 'true';

if (!allowDemoSeed) {
  console.log('⚠️  Demo seeding is disabled. Set ALLOW_DEMO_SEED=true to run this script.');
  process.exit(0);
}

// Connect to MongoDB
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define Schemas
const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  investment: { type: Number, required: true },
  dailyEarn: { type: Number, required: true },
  duration: { type: Number, required: true },
  totalReturn: { type: Number, required: true },
  roi: { type: Number, required: true },
  note: String,
  description: String,
  icon: String,
  badge: String,
  minInvestment: Number,
  maxInvestment: Number,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const adminSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: mongoose.Schema.Types.Mixed,
  description: String,
  
  directCommissionRate: { type: Number, default: 10 },
  levelCommissionRates: {
    level1: { type: Number, default: 5 },
    level2: { type: Number, default: 3 },
    level3: { type: Number, default: 2 },
    level4: { type: Number, default: 1 },
    level5: { type: Number, default: 0.5 },
  },
  
  minWithdrawal: { type: Number, default: 50 },
  maxWithdrawal: { type: Number, default: 50000 },
  withdrawalFeePercent: { type: Number, default: 2 },
  withdrawalApprovalRequired: { type: Boolean, default: true },
  
  platformFeePercent: { type: Number, default: 1 },
  maintenanceFeePercent: { type: Number, default: 0.5 },
  
  depositWalletAddress: String,
  minimumDeposit: { type: Number, default: 100 },
  maximumDeposit: { type: Number, default: 1000000 },
  
  platformStatus: { type: String, enum: ['active', 'maintenance', 'closed'], default: 'active' },
  maintenanceMessage: String,
  
  updatedBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Create Models
const Plan = mongoose.model('Plan', planSchema);
const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

// Demo Plans with realistic data
const demoPlans = [
  {
    name: 'STARTER PACK',
    investment: 100,
    dailyEarn: 0.55,
    duration: 365,
    totalReturn: 200.75,
    roi: 200.75,
    minInvestment: 100,
    maxInvestment: 249,
    description: 'Perfect for beginners. Get started with passive income.',
    icon: '🚀',
    badge: 'POPULAR',
    note: 'Entry-level investment plan for new members',
  },
  {
    name: 'ESSENTIAL PLAN',
    investment: 250,
    dailyEarn: 1.25,
    duration: 400,
    totalReturn: 500,
    roi: 200,
    minInvestment: 250,
    maxInvestment: 499,
    description: 'Steady returns with 400 days of earnings.',
    icon: '💼',
    badge: 'BEST VALUE',
    note: 'Reliable medium-term investment',
  },
  {
    name: 'BRONZE TIER',
    investment: 500,
    dailyEarn: 2.5,
    duration: 400,
    totalReturn: 1000,
    roi: 200,
    minInvestment: 500,
    maxInvestment: 999,
    description: 'Premium tier with enhanced daily returns.',
    icon: '🥉',
    badge: null,
    note: 'Professional investment tier',
  },
  {
    name: 'SILVER TIER',
    investment: 1000,
    dailyEarn: 5,
    duration: 400,
    totalReturn: 2000,
    roi: 200,
    minInvestment: 1000,
    maxInvestment: 1999,
    description: 'Accelerated earnings for serious investors.',
    icon: '🥈',
    badge: 'TRENDING',
    note: 'Corporate investment plan',
  },
  {
    name: 'GOLD TIER',
    investment: 2000,
    dailyEarn: 10,
    duration: 400,
    totalReturn: 4000,
    roi: 200,
    minInvestment: 2000,
    maxInvestment: 4999,
    description: 'Elite rewards with daily income.',
    icon: '🥇',
    badge: 'TOP CHOICE',
    note: 'Premium investment plan with maximum benefits',
  },
  {
    name: 'PLATINUM ELITE',
    investment: 5000,
    dailyEarn: 40,
    duration: 400,
    totalReturn: 16000,
    roi: 320,
    minInvestment: 5000,
    maxInvestment: 100000,
    description: 'Exclusive program for VIP members. Maximum returns.',
    icon: '💎',
    badge: 'VIP ONLY',
    note: 'Exclusive VIP investment tier',
  },
];

// Admin Settings
const adminSettings = {
  key: 'platform_settings',
  value: {
    platformName: 'CryptoMLM Pro',
    version: '1.0.0',
    environment: 'production',
  },
  description: 'Main platform configuration',
  directCommissionRate: 10,
  levelCommissionRates: {
    level1: 5,
    level2: 3,
    level3: 2,
    level4: 1,
    level5: 0.5,
  },
  minWithdrawal: 50,
  maxWithdrawal: 50000,
  withdrawalFeePercent: 2,
  withdrawalApprovalRequired: true,
  platformFeePercent: 1,
  maintenanceFeePercent: 0.5,
  minimumDeposit: 100,
  maximumDeposit: 1000000,
  platformStatus: 'active',
  depositWalletAddress: '1A1z7agoat4yNMLUP3NCjYsRaGjB5XLwm7', // Demo wallet
};

// Seed Data
async function seedData() {
  try {
    console.log('\n🌱 Starting database seeding...\n');
    
    // Clear existing data
    await Plan.deleteMany({});
    await AdminSettings.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Insert plans
    const insertedPlans = await Plan.insertMany(demoPlans);
    console.log(`✅ Created ${insertedPlans.length} investment plans`);
    
    // Insert admin settings
    const insertedSettings = await AdminSettings.create(adminSettings);
    console.log('✅ Created admin settings');
    
    // Display created plans
    console.log('\n📋 Created Investment Plans:');
    console.log('═════════════════════════════════════════════════════════════');
    insertedPlans.forEach((plan, index) => {
      console.log(`\n${index + 1}. ${plan.icon} ${plan.name}`);
      console.log(`   Investment: $${plan.investment} | Daily: ${plan.dailyEarn}% | ROI: ${plan.roi}%`);
      console.log(`   Duration: ${plan.duration} days | Total Return: $${plan.totalReturn}`);
      if (plan.badge) console.log(`   Badge: ${plan.badge}`);
    });
    
    console.log('\n📊 Admin Settings:');
    console.log('═════════════════════════════════════════════════════════════');
    console.log(`Direct Commission: ${adminSettings.directCommissionRate}%`);
    console.log(`Level 1 Commission: ${adminSettings.levelCommissionRates.level1}%`);
    console.log(`Withdrawal Fee: ${adminSettings.withdrawalFeePercent}%`);
    console.log(`Platform Fee: ${adminSettings.platformFeePercent}%`);
    console.log(`Min Deposit: $${adminSettings.minimumDeposit}`);
    console.log(`Max Withdrawal: $${adminSettings.maxWithdrawal}`);
    
    console.log('\n✨ Database seeding completed successfully!\n');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding
seedData();
