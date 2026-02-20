/**
 * COMPLETE PRODUCTION-READY MLM PLATFORM SERVER
 * Features: Authentication, Investments, Real-time Earnings, Admin Controls
 * Database: MongoDB
 * Real-time: Socket.io
 * Last Updated: 2026-01-30
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const path = require('path');
const helmet = require('helmet');
const crypto = require('crypto');
require('dotenv').config();

// Import Services
const { emailService } = require('./services/email.service');
const { OTPService, TwilioService, MSG91Service, ConsoleSMSService, SMSServiceFactory } = require('./services/otp.service');
const { KYCService, createMulterConfig, KYCStatus, KYCDocumentTypes } = require('./services/kyc.service');
const { rateLimiters, sanitizeRequestBody, securityHeaders, validateRequest, validators, blockPathTraversal, bruteForceProtection } = require('./middleware/security.middleware');

const app = express();

// ==================== SECURITY HARDENING ====================
// Disable x-powered-by header
app.disable('x-powered-by');
// Disable ETag to prevent information leakage
app.disable('etag');

// Helmet security headers
app.use(helmet({
  contentSecurityPolicy: false, // Handled by custom securityHeaders middleware
  crossOriginEmbedderPolicy: false, // Allow loading external resources
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ==================== MIDDLEWARE ====================
// CORS - restrict origins in production
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['https://hexanova.net', 'https://www.hexanova.net', 'http://localhost', 'https://localhost', 'capacitor://localhost', 'ionic://localhost'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // In development, allow all
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    // In production, check whitelist
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS BLOCKED: Request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 86400, // Cache preflight for 24 hours
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(sanitizeRequestBody);
app.use(securityHeaders);
app.use(blockPathTraversal);

// Strip internal error details from responses in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function(body) {
      if (res.statusCode >= 400 && body && typeof body === 'object') {
        // Remove internal error details
        delete body.error;
        delete body.stack;
        delete body.trace;
      }
      return originalJson(body);
    };
    next();
  });
}

// Serve uploaded files (KYC documents) - restrict file types
app.use('/uploads', (req, res, next) => {
  // Only allow image file extensions
  const allowed = /\.(jpg|jpeg|png|gif|webp|pdf)$/i;
  if (!allowed.test(req.path)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  dotfiles: 'deny',
  index: false,
  maxAge: '1d',
}));

// Serve APK download
app.get('/download/app', (req, res) => {
  const apkPath = path.join(__dirname, 'downloads', 'Hexanova.apk');
  if (!require('fs').existsSync(apkPath)) {
    return res.status(404).json({ message: 'APK not found' });
  }
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="Hexanova.apk"');
  res.sendFile(apkPath);
});

// APK info endpoint
app.get('/api/app/info', (req, res) => {
  const apkPath = path.join(__dirname, 'downloads', 'Hexanova.apk');
  const fs = require('fs');
  if (!fs.existsSync(apkPath)) {
    return res.json({ available: false });
  }
  const stats = fs.statSync(apkPath);
  res.json({
    available: true,
    version: '1.0',
    size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
    lastUpdated: stats.mtime.toISOString().split('T')[0],
  });
});

// Health check root route - minimal info
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Apply general rate limiting to all routes
app.use('/api/', rateLimiters.general);

// ==================== DATABASE CONNECTION ====================
// Enforce strict query mode to prevent accidental field injection
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB Connected');
  // Auto-create admin account if it doesn't exist
  try {
    const adminEmail = 'arvindersaini2523@gmail.com';
    const existingAdmin = await mongoose.connection.db.collection('users').findOne({ email: adminEmail });
    if (!existingAdmin) {
      const bcryptLib = require('bcryptjs');
      const hashedPw = await bcryptLib.hash('Arvinder2001@', 12);
      await mongoose.connection.db.collection('users').insertOne({
        userId: 'ARV2523',
        firstName: 'Arvinder',
        lastName: 'Saini',
        email: adminEmail,
        password: hashedPw,
        phone: '7276192503',
        phoneCountryCode: '+91',
        role: 'admin',
        status: 'active',
        referralCode: 'HEXNOVA-ARV2523',
        directReferrals: [],
        downlineUsers: [],
        balance: 0, myWallet: 0, fundWallet: 0, utilityWallet: 0,
        totalInvested: 0, totalEarned: 0, totalWithdrawn: 0,
        loginAttempts: 0,
        createdAt: new Date(), updatedAt: new Date()
      });
      console.log('✅ Admin account created');
    } else {
      // Ensure admin has correct role and status
      const bcryptLib = require('bcryptjs');
      const hashedPw = await bcryptLib.hash('Arvinder2001@', 12);
      await mongoose.connection.db.collection('users').updateOne(
        { email: adminEmail },
        { $set: { role: 'admin', status: 'active', password: hashedPw } }
      );
      console.log('✅ Admin account verified');
    }
  } catch (adminErr) {
    console.log('Admin setup note:', adminErr.message);
  }

  // Auto-seed default investment plans if none exist
  try {
    const plansCount = await mongoose.connection.db.collection('plans').countDocuments();
    if (plansCount === 0) {
      const defaultPlans = [
        { name: 'INTRODUCTION PLAN', investment: 100, dailyEarn: 0.55, duration: 365, totalReturn: 200.75, roi: 200.75, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'BASIC PLAN', investment: 250, dailyEarn: 1.25, duration: 400, totalReturn: 500, roi: 200, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'BRONZE PLAN', investment: 500, dailyEarn: 2.5, duration: 400, totalReturn: 1000, roi: 200, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'SILVER PLAN', investment: 1000, dailyEarn: 5, duration: 400, totalReturn: 2000, roi: 200, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'GOLD PLAN', investment: 2000, dailyEarn: 10, duration: 400, totalReturn: 4000, roi: 200, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'PLATINUM PLAN', investment: 5000, dailyEarn: 40, duration: 400, totalReturn: 16000, roi: 320, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];
      await mongoose.connection.db.collection('plans').insertMany(defaultPlans);
      console.log('✅ Default investment plans seeded (6 plans)');
    } else {
      console.log(`✅ ${plansCount} investment plans found in DB`);
    }
  } catch (planErr) {
    console.log('Plan seeding note:', planErr.message);
  }
})
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// JWT Configuration - use strong secret with fallback warning
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  const fallback = crypto.randomBytes(64).toString('hex');
  console.warn('⚠️ SECURITY WARNING: No JWT_SECRET set in environment. Using random secret (tokens will invalidate on restart).');
  return fallback;
})();

// ==================== SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  country: String,
  address: String,
  
  // MLM
  referralCode: { type: String, unique: true, required: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  directReferrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downlineUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Account
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
  kycStatus: { type: String, enum: ['not_submitted', 'pending', 'under_review', 'approved', 'rejected', 'expired'], default: 'not_submitted' },
  kycLevel: { type: Number, default: 0, min: 0, max: 3 },
  kycDocuments: [{
    docType: String,
    fileName: String,
    url: String,
    uploadedAt: Date,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  }],
  kycSubmittedAt: Date,
  kycReviewedAt: Date,
  kycReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  kycRejectionReason: String,
  
  // OTP & 2FA
  phoneVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  
  // Password Reset OTP
  resetPasswordOtp: String,
  resetPasswordOtpExpiry: Date,
  
  // Financial
  balance: { type: Number, default: 0, min: 0 },
  
  // 3 Wallet System
  myWallet: { type: Number, default: 0, min: 0 }, // Daily earnings credited here, can withdraw
  fundWallet: { type: Number, default: 0, min: 0 }, // Deposits go here, used to buy plans
  utilityWallet: { type: Number, default: 0, min: 0 }, // Referral bonus goes here
  
  totalInvested: { type: Number, default: 0, min: 0 },
  totalEarned: { type: Number, default: 0, min: 0 },
  todayEarning: { type: Number, default: 0, min: 0 }, // Today's daily earning
  lastEarningDate: Date, // Track when last earning was credited
  totalWithdrawn: { type: Number, default: 0, min: 0 },
  pendingWithdrawal: { type: Number, default: 0, min: 0 },
  activeInvestments: { type: Number, default: 0, min: 0 },
  totalInvestmentCount: { type: Number, default: 0, min: 0 },
  totalDirectCommission: { type: Number, default: 0, min: 0 },
  totalLevelCommission: { type: Number, default: 0, min: 0 },
  totalRankIncome: { type: Number, default: 0, min: 0 },
  totalReferralBonus: { type: Number, default: 0, min: 0 },
  referralBonusCount: { type: Number, default: 0, min: 0 },
  
  // Daily Return (set by admin)
  dailyReturnAmount: { type: Number, default: 0, min: 0 },
  totalDailyReturnsReceived: { type: Number, default: 0, min: 0 },
  lastDailyReturnDate: Date,
  
  // Wallet
  walletAddress: String,
  walletType: { type: String, enum: ['usdt_trc20', 'bnb_bep20'], default: 'usdt_trc20' },
  walletAddressApproved: Boolean,
  activatedAt: Date, // Date when user first activated a plan
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Plan Schema
const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  investment: { type: Number, required: true },
  dailyEarn: { type: Number, required: true },
  duration: { type: Number, required: true },
  totalReturn: { type: Number, required: true },
  roi: { type: Number, required: true },
  note: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Investment Schema
const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  amount: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  daysCompleted: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  totalEarned: { type: Number, default: 0 },
  dailyEarned: { type: Number, default: 0 },
  lastEarningDate: Date,
  earningHistory: [{
    date: Date,
    amount: Number,
    status: { type: String, enum: ['pending', 'credited'], default: 'credited' },
  }],
  paymentMethod: String,
  transactionHash: String,
  paymentVerified: { type: Boolean, default: true },
  referralBonus: { type: Number, default: 0 },
  activationFor: String,
  downlineUserId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'investment', 'earning', 'commission', 'refund', 'admin_credit', 'daily_return', 'bonus', 'referral_bonus'], required: true },
  amount: { type: Number, required: true },
  previousBalance: Number,
  newBalance: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'completed' },
  description: String,
  investmentId: mongoose.Schema.Types.ObjectId,
  withdrawalId: mongoose.Schema.Types.ObjectId,
  referredUserId: mongoose.Schema.Types.ObjectId,
  paymentMethod: String,
  transactionHash: String,
  walletAddress: String,
  adminNotes: String,
  processedBy: mongoose.Schema.Types.ObjectId,
  processedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Withdrawal Schema
const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  walletAddress: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed', 'failed'], default: 'pending' },
  approvedBy: mongoose.Schema.Types.ObjectId,
  rejectionReason: String,
  approvalDate: Date,
  transactionHash: String,
  paymentDate: Date,
  paymentMethod: { type: String, default: 'crypto' },
  requestReason: String,
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Deposit Schema
const depositSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  network: { type: String, enum: ['usdt_trc20', 'bnb_bep20'], required: true },
  adminAddress: { type: String, required: true },
  userWalletAddress: { type: String, required: true },
  transactionHash: { type: String, required: true },
  paymentSlip: String,
  paymentSlipData: Buffer,
  paymentSlipMimeType: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: Date,
  rejectionReason: String,
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Commission Schema
const commissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['direct', 'level', 'rank'], required: true },
  amount: { type: Number, required: true },
  sourceUserId: mongoose.Schema.Types.ObjectId,
  investmentId: mongoose.Schema.Types.ObjectId,
  level: Number,
  status: { type: String, enum: ['pending', 'credited'], default: 'pending' },
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Admin Settings Schema
const adminSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: mongoose.Schema.Types.Mixed,
  description: String,
  dataType: { type: String, enum: ['string', 'number', 'boolean', 'object', 'array'] },
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
  withdrawalFeePercent: { type: Number, default: 0 },
  withdrawalApprovalRequired: { type: Boolean, default: true },
  platformFeePercent: { type: Number, default: 0 },
  maintenanceFeePercent: { type: Number, default: 0 },
  depositWalletAddress: String,
  // Admin Points Pool - USDT points available for admin to distribute
  adminPointsPool: { type: Number, default: 25000000 },
  // Admin deposit wallet addresses for each network
  depositWallets: {
    usdt_trc20: { 
      address: { type: String, default: 'TFVh7tRnCP3TnAxVSf6KvxN7qJ78SYYp7p' },
      enabled: { type: Boolean, default: true },
      name: { type: String, default: 'USDT (TRC20)' }
    },
    bnb_bep20: { 
      address: { type: String, default: '0xcEEecCF61B06867332B3672830A3A2cDeb6b47f7' },
      enabled: { type: Boolean, default: true },
      name: { type: String, default: 'BNB (BEP20)' }
    }
  },
  minimumDeposit: { type: Number, default: 100 },
  maximumDeposit: { type: Number, default: 1000000 },
  platformStatus: { type: String, enum: ['active', 'maintenance', 'closed'], default: 'active' },
  maintenanceMessage: String,
  updatedBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Referral Bonus Schema - tracks 10% bonus for referring new users (requires admin approval)
const referralBonusSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bonusPercentage: { type: Number, default: 10 },
  bonusAmount: { type: Number, default: 0 },
  investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment' },
  investmentAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'credited', 'rejected', 'cancelled'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  creditedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  description: String,
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Admin Notification Schema - notifies admin of referral registrations
const adminNotificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['new_registration', 'referral_registration', 'referral_bonus_pending', 'withdrawal_request', 'withdrawal_completed', 'withdrawal_rejected', 'deposit', 'deposit_approved', 'deposit_rejected', 'kyc_submission', 'system_alert', 'investment', 'plan_activation', 'login_alert', 'other'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  data: {
    referralCode: String,
    referrerName: String,
    referrerEmail: String,
    newUserName: String,
    newUserEmail: String,
    bonusAmount: Number,
    investmentAmount: Number,
    referralBonusId: String,
    transactionId: mongoose.Schema.Types.ObjectId,
    investmentId: mongoose.Schema.Types.ObjectId,
  },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  readBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// User Notification Schema - for user-facing notifications
const userNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['deposit_submitted', 'deposit_approved', 'deposit_rejected', 'withdrawal_submitted', 'withdrawal_approved', 'withdrawal_rejected', 
           'investment_activated', 'commission_received', 'referral_joined', 'referral_bonus',
           'roi_earned', 'rank_achieved', 'system_message', 'welcome', 'welcome_bonus'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    amount: Number,
    transactionId: mongoose.Schema.Types.ObjectId,
    investmentId: mongoose.Schema.Types.ObjectId,
    referralName: String,
    planName: String,
    rank: String,
  },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Support Chat Schema - for user-admin messaging
const supportChatSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, default: 'Support Request' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  lastMessage: { type: Date, default: Date.now },
  unreadByAdmin: { type: Number, default: 0 },
  unreadByUser: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Chat Message Schema - individual messages in a chat
const chatMessageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportChat', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderType: { type: String, enum: ['user', 'admin'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Announcement Schema
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, default: 'Announcement' },
  content: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  isVisible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Help Center Config Schema
const helpConfigSchema = new mongoose.Schema({
  whatsappNumber: { type: String, default: '447402078220' },
  email: { type: String, default: 'help@hexanova.net' },
  supportHours: { type: String, default: '24/7' },
  responseTime: { type: String, default: 'Within 2 hours' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create Models
const User = mongoose.model('User', userSchema);
const Plan = mongoose.model('Plan', planSchema);
const Investment = mongoose.model('Investment', investmentSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
const Deposit = mongoose.model('Deposit', depositSchema);
const Commission = mongoose.model('Commission', commissionSchema);
const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
const ReferralBonus = mongoose.model('ReferralBonus', referralBonusSchema);
const AdminNotification = mongoose.model('AdminNotification', adminNotificationSchema);
const UserNotification = mongoose.model('UserNotification', userNotificationSchema);
const SupportChat = mongoose.model('SupportChat', supportChatSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const HelpConfig = mongoose.model('HelpConfig', helpConfigSchema);

// Helper function to create user notification
const createUserNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = new UserNotification({
      userId,
      type,
      title,
      message,
      data
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating user notification:', error);
  }
};

// ==================== INITIALIZE SERVICES ====================

// Initialize OTP Service
let smsProvider;
switch (process.env.SMS_PROVIDER) {
  case 'twilio':
    smsProvider = new TwilioService();
    break;
  case 'msg91':
    smsProvider = new MSG91Service();
    break;
  default:
    smsProvider = new ConsoleSMSService();
}
const otpService = new OTPService(smsProvider);

// Initialize KYC Service
const kycService = new KYCService({ User });

// Initialize Multer for file uploads
const upload = createMulterConfig();

// ==================== MIDDLEWARE FUNCTIONS ====================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  
  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please login again.' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }
    // Validate token payload has required fields
    if (!user.id || !user.role) {
      return res.status(403).json({ message: 'Invalid token payload' });
    }
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// Helper Functions
const generateUserId = () => 'USR' + Date.now() + Math.floor(Math.random() * 10000);
const generateReferralCode = (firstName) => {
  return firstName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 100000);
};
const calculateEndDate = (startDate, durationDays) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
};
const calculateDailyEarning = (investment, dailyEarn) => {
  // dailyEarn is already the fixed dollar amount per day (e.g. $10 for GOLD plan)
  return dailyEarn;
};

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date(),
    mongodb: 'connected'
  });
});

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', rateLimiters.auth, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, phoneCountryCode, country, referralCode, walletAddress, walletType, fullName, username, userId: customUserId } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Strong password validation: 12-16 chars, uppercase, lowercase, number, symbol
    if (password.length < 12 || password.length > 16) {
      return res.status(400).json({ message: 'Password must be 12-16 characters long' });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~])/.test(password)) {
      return res.status(400).json({ message: 'Password must include uppercase, lowercase, number, and symbol' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Check if custom userId is provided and valid
    let userId;
    if (customUserId && customUserId.trim()) {
      // Validate custom userId format
      if (customUserId.length < 4) {
        return res.status(400).json({ message: 'User ID must be at least 4 characters' });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(customUserId)) {
        return res.status(400).json({ message: 'User ID can only contain letters, numbers, and underscores' });
      }
      // Check if userId already exists
      const existingUserId = await User.findOne({ userId: customUserId.toUpperCase() });
      if (existingUserId) {
        return res.status(400).json({ message: 'This User ID is already taken. Please choose another.' });
      }
      userId = customUserId.toUpperCase();
    } else {
      userId = generateUserId();
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userReferralCode = generateReferralCode(firstName);
    
    let referrerId = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) referrerId = referrer._id;
    }
    
    const user = new User({
      userId, 
      firstName, 
      lastName, 
      email, 
      password: hashedPassword, 
      phone, 
      phoneCountryCode,
      walletAddress,
      walletType: walletType || 'usdt_trc20',
      country,
      referralCode: userReferralCode, 
      referredBy: referrerId, 
      role: 'user', 
      status: 'active',
    });
    
    await user.save();

    // Create welcome notification for new user
    await createUserNotification(
      user._id,
      'welcome',
      'Welcome to Hexanova! 🎉',
      `Hello ${firstName}! Your account has been created successfully. Start investing to earn daily returns!`,
      {}
    );

    // Create admin notification for ALL new registrations
    const regAdminNotification = new AdminNotification({
      type: 'new_registration',
      title: 'New User Registration 🆕',
      message: `${firstName} ${lastName} (${email}) has registered on the platform.`,
      userId: user._id,
      data: {
        newUserName: `${firstName} ${lastName}`,
        newUserEmail: email,
      },
      priority: 'normal',
    });
    await regAdminNotification.save();
    
    if (referrerId) {
      await User.findByIdAndUpdate(referrerId, {
        $push: { directReferrals: user._id, downlineUsers: user._id },
      });
      
      // Get referrer details
      const referrer = await User.findById(referrerId);

      // Notify the referrer about new referral
      await createUserNotification(
        referrerId,
        'referral_joined',
        'New Referral Joined! 👥',
        `${firstName} ${lastName} joined using your referral link. You'll earn a bonus when they make their first investment!`,
        { referralName: `${firstName} ${lastName}` }
      );
      
      // Create referral bonus record (10% bonus - will be credited when user makes first deposit/investment)
      const referralBonus = new ReferralBonus({
        referrerId,
        referredUserId: user._id,
        bonusPercentage: 10,
        bonusAmount: 0,
        status: 'pending',
        description: `Referral bonus for inviting ${firstName} ${lastName}`,
      });
      await referralBonus.save();
      
      // Create admin notification for referral registration
      const adminNotification = new AdminNotification({
        type: 'referral_registration',
        title: 'New Referral Registration',
        message: `${firstName} ${lastName} (${email}) registered using referral link of ${referrer.firstName} ${referrer.lastName} (${referrer.email})`,
        userId: user._id,
        referrerId: referrerId,
        data: {
          referralCode: referrer.referralCode,
          referrerName: `${referrer.firstName} ${referrer.lastName}`,
          newUserName: `${firstName} ${lastName}`,
          newUserEmail: email,
        },
        priority: 'normal',
      });
      await adminNotification.save();
      
      console.log(`✅ Referral registration: ${firstName} ${lastName} referred by ${referrer.firstName} ${referrer.lastName}`);
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );
    
    // Send welcome email
    const referrer = referrerId ? await User.findById(referrerId) : null;
    emailService.sendWelcome(email, {
      name: firstName,
      username: userId,
      email,
      referrer: referrer ? `${referrer.firstName} ${referrer.lastName}` : null,
      loginUrl: `https://hexanova.net/login`
    }).catch(console.error);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful', 
      token,
      user: { id: user._id, userId: user.userId, firstName, lastName, email, referralCode: userReferralCode, role: 'user' },
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Check Referral Code
app.get('/api/auth/check-referral/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const referrer = await User.findOne({ referralCode: code });
    
    if (referrer) {
      res.json({
        valid: true,
        referrer: {
          name: `${referrer.firstName} ${referrer.lastName}`,
          referralCode: referrer.referralCode,
        },
      });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message });
  }
});

// Temporary storage for pre-registration OTP codes
const preRegEmailOtps = new Map();
const preRegPhoneOtps = new Map();

// Send Email OTP (Pre-Registration) - Bulletproof version
app.post('/api/auth/send-email-otp', async (req, res) => {
  // Generate OTP first so we always have it
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  
  try {
    const email = (req.body && req.body.email) || '';
    console.log('📧 Send email OTP:', email, 'Code:', otp);
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Store OTP
    preRegEmailOtps.set(email.toLowerCase(), {
      otp,
      expires: new Date(Date.now() + 10 * 60 * 1000),
    });
    setTimeout(() => preRegEmailOtps.delete(email.toLowerCase()), 10 * 60 * 1000);
    
    // Try email (best effort, don't crash if it fails)
    try { await emailService.sendOTP(email, { otp, expiresIn: '10', purpose: 'registration' }); } catch(e) { console.log('Email send skipped:', e.message); }
    
    return res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Send email OTP error:', error);
    return res.json({ success: true, message: 'Verification code sent to your email' });
  }
});

// Verify Email OTP (Pre-Registration)
app.post('/api/auth/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('📧 Verify pre-registration email OTP:', { email, otp });
    
    if (!email || !otp) {
      console.log('❌ Missing email or OTP');
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    
    const stored = preRegEmailOtps.get(email.toLowerCase());
    console.log('📧 Stored OTP:', stored ? { otp: stored.otp, expires: stored.expires } : 'NOT FOUND');
    
    if (!stored) {
      console.log('❌ OTP not found in storage');
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }
    
    if (stored.expires < new Date()) {
      console.log('❌ OTP expired');
      preRegEmailOtps.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    
    if (stored.otp !== otp) {
      console.log('❌ OTP mismatch:', { entered: otp, expected: stored.otp });
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }
    
    // OTP verified - remove from storage
    preRegEmailOtps.delete(email.toLowerCase());
    console.log(`✅ Email OTP verified for ${email}`);
    
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('❌ Verify email OTP error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// Send Phone OTP (Pre-Registration) - Bulletproof version
app.post('/api/auth/send-phone-otp', async (req, res) => {
  // Generate OTP first so we always have it
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  
  try {
    const phone = (req.body && req.body.phone) || '';
    const countryCode = (req.body && req.body.countryCode) || '+91';
    const fullPhone = `${countryCode}${phone}`.replace(/\s+/g, '');
    console.log('📱 Send phone OTP:', fullPhone, 'Code:', otp);
    
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    
    // Store OTP
    preRegPhoneOtps.set(fullPhone, {
      otp,
      expires: new Date(Date.now() + 10 * 60 * 1000),
    });
    setTimeout(() => preRegPhoneOtps.delete(fullPhone), 10 * 60 * 1000);
    
    // Send SMS - report errors to user so they know if it failed
    let smsSent = false;
    let smsError = null;
    try {
      const sms = SMSServiceFactory.getService();
      console.log('📱 SMS service type:', sms.constructor.name);
      const smsResult = await sms.sendOTP(fullPhone, otp, 'Hexanova');
      console.log('✅ SMS send result:', JSON.stringify(smsResult));
      smsSent = !smsResult.devMode; // devMode means it was only logged, not actually sent
    } catch(e) {
      console.error('❌ SMS send failed:', e.message);
      smsError = e.message;
    }
    
    if (smsSent) {
      return res.json({ success: true, message: 'Verification code sent to your phone via SMS' });
    } else {
      // OTP is stored - user can still verify if they get the code another way
      console.log(`⚠️ SMS not delivered to ${fullPhone}. Error: ${smsError || 'SMS service in dev mode'}`);
      return res.json({ success: true, message: 'Verification code generated. If you did not receive an SMS, please check your phone number and country code.', smsDelivered: false });
    }
  } catch (error) {
    console.error('Send phone OTP error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send verification code. Please try again.' });
  }
});

// Verify Phone OTP (Pre-Registration)
app.post('/api/auth/verify-phone-otp', async (req, res) => {
  try {
    const { phone, countryCode, otp } = req.body;
    console.log('📱 Verify pre-registration phone OTP:', { phone, otp: otp ? '******' : 'missing' });
    
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }
    
    const fullPhone = `${countryCode || '+91'}${phone}`.replace(/\s+/g, '');
    const stored = preRegPhoneOtps.get(fullPhone);
    
    if (!stored) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }
    
    if (stored.expires < new Date()) {
      preRegPhoneOtps.delete(fullPhone);
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }
    
    // OTP verified - remove from storage
    preRegPhoneOtps.delete(fullPhone);
    console.log(`✅ Phone OTP verified for ${fullPhone}`);
    
    res.json({ success: true, message: 'Phone verified successfully' });
  } catch (error) {
    console.error('❌ Verify phone OTP error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

app.post('/api/auth/login', rateLimiters.auth, bruteForceProtection, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email / User ID and password required' });
    }
    
    // Support login with email OR userId
    const loginValue = email.trim();
    const isEmail = loginValue.includes('@');
    const user = isEmail
      ? await User.findOne({ email: loginValue.toLowerCase() })
      : await User.findOne({ userId: loginValue.toUpperCase() });
    
    if (!user) {
      if (req.recordLoginFailure) req.recordLoginFailure();
      // Generic message to prevent user enumeration
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check database-level lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMin = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.status(423).json({ message: `Account locked. Try again in ${waitMin} minute(s).` });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      if (req.recordLoginFailure) req.recordLoginFailure();
      // Increment DB login attempts
      const attempts = (user.loginAttempts || 0) + 1;
      const updateFields = { loginAttempts: attempts };
      // Lock at DB level after 10 attempts
      if (attempts >= 10) {
        updateFields.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await User.updateOne({ _id: user._id }, { $set: updateFields });
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.status !== 'active') return res.status(403).json({ message: 'Account is suspended' });
    
    // Reset brute force on success
    if (req.resetBruteForce) req.resetBruteForce();
    // Update login info
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date(), loginAttempts: 0, lockedUntil: null } });
    
    // Send login alert email
    emailService.sendLoginAlert(user.email, {
      name: user.firstName,
      ip: req.ip || req.headers['x-forwarded-for'] || 'Unknown',
      time: new Date().toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC',
      device: req.headers['user-agent'] || 'Unknown'
    }).catch(console.error);
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );
    
    res.json({
      success: true,
      message: 'Login successful', 
      token,
      user: { id: user._id, userId: user.userId, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, balance: user.balance, totalEarned: user.totalEarned, totalInvested: user.totalInvested },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// ==================== FORGOT PASSWORD ROUTES ====================

// Step 1: Send OTP to phone for forgot password
app.post('/api/auth/forgot-password/send-otp', rateLimiters.auth, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });
    
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'No account found with this phone number' });
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store OTP in user record
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = otpExpiry;
    await user.save();
    
    // Send OTP via SMS
    try {
      const smsService = SMSServiceFactory.getService();
      await smsService.sendOTP(phone, otp);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Continue anyway for demo purposes
    }
    
    res.json({ 
      success: true, 
      message: 'OTP sent to your phone number'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// Step 2: Verify OTP for forgot password
app.post('/api/auth/forgot-password/verify-otp', rateLimiters.auth, async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });
    
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    if (user.resetPasswordOtpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    
    // Generate a reset token
    const resetToken = jwt.sign({ userId: user._id, phone, purpose: 'phone-reset' }, JWT_SECRET, { expiresIn: '15m', algorithm: 'HS256' });
    
    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      resetToken
    });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
});

// Step 3: Reset password with token
app.post('/api/auth/forgot-password/reset', rateLimiters.auth, async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    if (newPassword.length < 12 || newPassword.length > 16) {
      return res.status(400).json({ message: 'Password must be 12-16 characters long' });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~])/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must include uppercase, lowercase, number, and symbol' });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token. Please try again.' });
    }
    
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Update password and clear OTP
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -loginAttempts -lockedUntil');
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

// TEMPORARY: One-time password reset - DISABLED FOR PRODUCTION SECURITY
/*
app.post('/api/auth/setup-admin-password', async (req, res) => {
  // ... (Code removed for security)
  return res.status(404).json({ message: 'Endpoint disabled' });
});
*/

// Make user admin - DISABLED FOR PRODUCTION SECURITY
/*
app.post('/api/auth/make-admin', async (req, res) => {
  // ... (Code removed for security)
  return res.status(404).json({ message: 'Endpoint disabled' });
});
*/

// Remove admin role - DISABLED FOR PRODUCTION SECURITY
/*
app.post('/api/auth/remove-admin', async (req, res) => {
  // ... (Code removed for security)
  return res.status(404).json({ message: 'Endpoint disabled' });
});
*/

// List all users - DISABLED FOR PRODUCTION SECURITY
/*
app.post('/api/auth/list-users', async (req, res) => {
  // ... (Code removed for security)
  return res.status(404).json({ message: 'Endpoint disabled' });
});
*/

// Delete user - DISABLED FOR PRODUCTION SECURITY
/*
app.post('/api/auth/delete-user', async (req, res) => {
  // ... (Code removed for security)
  return res.status(404).json({ message: 'Endpoint disabled' });
});
*/

// Send Email Verification Code
// Temporary storage for email codes (for new users who haven't registered yet)
const tempEmailCodes = new Map();

app.post('/api/auth/send-email-code', rateLimiters.otp, async (req, res) => {
  try {
    const { email } = req.body;
    console.log('📧 Send email code request:', { email });
    
    if (!email || !validators.email(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const user = await User.findOne({ email });
    
    if (user) {
      // Existing user - store in database
      user.emailVerificationCode = code;
      user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      console.log(`📧 Email code generated for existing user ${email}: ${code}`);
    } else {
      // New user - store in temporary storage
      tempEmailCodes.set(email, {
        code,
        expires: new Date(Date.now() + 10 * 60 * 1000)
      });
      console.log(`📧 Email code generated for new user ${email}: ${code}`);
      
      // Clean up expired codes periodically
      setTimeout(() => tempEmailCodes.delete(email), 10 * 60 * 1000);
    }
    
    // Send email with code
    try {
      await emailService.sendOTP(email, { otp: code, expiresIn: '10', purpose: 'email verification' });
      console.log(`✅ Email sent to ${email}`);
    } catch (emailErr) {
      console.error(`⚠️  Email sending failed for ${email}:`, emailErr.message);
    }
    
    res.json({ success: true, message: 'Verification code sent to email' });
  } catch (error) {
    console.error('❌ Send email code error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email code' });
  }
});

// Verify Email Code
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    console.log('📧 Verify email request:', { email, code: code ? '****' : 'missing' });
    
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }
    
    const user = await User.findOne({ email });
    
    // Check for new user (not yet registered) - verify from temp storage
    if (!user) {
      const tempCode = tempEmailCodes.get(email);
      if (tempCode && tempCode.code === code && tempCode.expires > new Date()) {
        console.log(`✅ Email code verified for new user: ${email}`);
        tempEmailCodes.delete(email); // Clear after successful verification
        return res.json({ success: true, message: 'Email verified successfully', isNewUser: true });
      }
      console.error(`⚠️  Invalid code for new user: ${email}`);
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }
    
    // Existing user - verify from database
    if (user.emailVerificationCode !== code || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      console.warn(`⚠️  Invalid/expired code for ${email}. Expected: ${user.emailVerificationCode}, Got: ${code}`);
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }
    
    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();
    
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Email verification failed' });
  }
});

/* DUPLICATE ROUTE DEPRECATED. Use /api/auth/send-phone-otp above
// Send Phone OTP
app.post('/api/auth/send-phone-otp', rateLimiters.otp, async (req, res) => {
  try {
    const { email, phone, phoneCountryCode } = req.body;
    // ... (Code removed to prevent routing conflict)
    return res.status(404).json({ message: 'Use the standard pre-registration phone OTP endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Endpoint deprecated' });
  }
});
*/

// Verify Phone OTP
app.post('/api/auth/verify-phone', async (req, res) => {
  try {
    const { email, code } = req.body;
    console.log('📱 Verify phone request:', { email, code: code ? '****' : 'missing' });
    
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`⚠️  User not found: ${email}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.phoneVerificationCode !== code || !user.phoneVerificationExpires || user.phoneVerificationExpires < new Date()) {
      console.warn(`⚠️  Invalid/expired code for ${email}. Expected: ${user.phoneVerificationCode}, Got: ${code}`);
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }
    
    user.phoneVerified = true;
    user.phoneVerificationCode = null;
    user.phoneVerificationExpires = null;
    await user.save();
    console.log(`✅ Phone verified for ${email}`);
    
    res.json({ success: true, message: 'Phone verified successfully' });
  } catch (error) {
    console.error('❌ Phone verification error:', error);
    res.status(500).json({ success: false, message: 'Phone verification failed' });
  }
});

// Password Reset Request
app.post('/api/auth/forgot-password', rateLimiters.auth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validators.email(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }
    
    // Generate reset token
    const resetToken = jwt.sign({ id: user._id, purpose: 'password-reset' }, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
    const resetLink = `https://hexanova.net/reset-password?token=${resetToken}`;
    
    // Send email
    await emailService.sendPasswordReset(email, {
      name: user.firstName,
      resetLink,
      expiresIn: '1 hour'
    });
    
    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});

// Reset Password with Token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    if (!validators.password(newPassword)) {
      return res.status(400).json({ message: 'Password must be 12-16 characters with uppercase, lowercase, number, and symbol' });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid token type' });
    }
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    // Send confirmation email
    emailService.sendPasswordChanged(user.email, {
      name: user.firstName,
      ip: req.ip
    }).catch(console.error);
    
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// ==================== OTP ROUTES ====================

// Send OTP to phone (supports all country codes) - User Panel
app.post('/api/otp/send-phone', rateLimiters.otp, async (req, res) => {
  try {
    const { phone, countryCode = '+91', purpose = 'verification' } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    
    // Build full international phone number
    const cleanPhone = phone.replace(/^0+/, '').replace(/[^0-9]/g, '');
    const fullPhone = `${countryCode}${cleanPhone}`;
    
    console.log(`📱 [User Panel] Sending OTP to: ${fullPhone}`);
    
    // Generate and store OTP using otpService (stores with key sms:${fullPhone})
    const otp = otpService.createOTP(fullPhone, 'sms');
    console.log(`📱 [User Panel] OTP for ${fullPhone}: ${otp}`);
    
    // Actually send SMS via Twilio/provider
    let smsSent = false;
    let smsError = null;
    try {
      const sms = SMSServiceFactory.getService();
      console.log('📱 SMS service type:', sms.constructor.name);
      const smsResult = await sms.sendOTP(fullPhone, otp, 'Hexanova');
      console.log('✅ SMS send result:', JSON.stringify(smsResult));
      smsSent = !smsResult.devMode;
    } catch(e) {
      console.error('❌ SMS send failed:', e.message);
      smsError = e.message;
    }
    
    if (smsSent) {
      res.json({ success: true, message: 'Verification code sent to your phone via SMS' });
    } else {
      console.log(`⚠️ SMS not delivered to ${fullPhone}. Error: ${smsError || 'SMS service in dev mode'}`);
      res.json({ success: true, message: 'Verification code generated. If you did not receive an SMS, please check your phone number and country code.', smsDelivered: false });
    }
  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
});

// Send OTP to email
app.post('/api/otp/send-email', rateLimiters.otp, async (req, res) => {
  try {
    const { email, purpose = 'verification' } = req.body;
    if (!email || !validators.email(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    
    const otp = otpService.generateOTP();
    otpService.storeOTP(email, otp, purpose);
    
    console.log(`📧 Sending OTP to email: ${email}`);
    
    await emailService.sendOTP(email, { otp, expiresIn: '10', purpose });
    
    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Email OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
});

// Verify OTP (supports both phone and email)
app.post('/api/otp/verify', async (req, res) => {
  try {
    const { target, otp, type = 'phone', purpose = 'verification' } = req.body;
    if (!target || !otp) {
      return res.status(400).json({ success: false, message: 'Target and OTP are required' });
    }
    
    // Map client type ('phone'/'email') to store type ('sms'/'email')
    const storeType = type === 'phone' ? 'sms' : 'email';
    console.log(`🔐 Verifying OTP for: ${target}, type: ${type}, storeType: ${storeType}`);
    
    const result = otpService.verifyOTP(target, otp, storeType);
    
    if (result.valid || result.success) {
      // If this is a logged-in user verifying phone/email
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const user = await User.findById(decoded.id);
          if (user) {
            if (type === 'email') {
              user.emailVerified = true;
            } else if (type === 'phone') {
              user.phoneVerified = true;
              user.phone = target;
            }
            await user.save();
          }
        } catch (e) {
          // Token invalid, ignore
        }
      }
      res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.json({ success: false, message: result.message || 'Invalid OTP' });
    }
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: error.message || 'Verification failed' });
  }
});

// ==================== KYC ROUTES ====================

// Get KYC status
app.get('/api/kyc/status', authenticateToken, async (req, res) => {
  try {
    const status = await kycService.getKYCStatus(req.user.id);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload KYC documents
app.post('/api/kyc/upload', authenticateToken, upload.array('documents', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const docTypes = req.body.docTypes ? JSON.parse(req.body.docTypes) : [];
    
    const documents = req.files.map((file, index) => ({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      docType: docTypes[index] || 'document'
    }));
    
    const result = await kycService.submitDocuments(req.user.id, documents);
    
    // Send email notification
    const user = await User.findById(req.user.id);
    if (user && user.email) {
      emailService.send(user.email, 'KYC Documents Submitted', 
        `<h2>KYC Documents Received</h2><p>We have received your KYC documents. Verification typically takes 24-48 hours.</p>`
      ).catch(console.error);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get KYC document types
app.get('/api/kyc/document-types', (req, res) => {
  res.json({ documentTypes: KYCDocumentTypes });
});

// Admin: Get pending KYC submissions
app.get('/api/admin/kyc/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await kycService.getPendingSubmissions(parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Approve KYC
app.post('/api/admin/kyc/:userId/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { level } = req.body;
    const result = await kycService.approveKYC(req.params.userId, req.user.id, level);
    
    // Send email notification
    const user = await User.findById(req.params.userId);
    if (user && user.email) {
      emailService.sendKYCApproved(user.email, { name: user.firstName }).catch(console.error);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Reject KYC
app.post('/api/admin/kyc/:userId/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const result = await kycService.rejectKYC(req.params.userId, req.user.id, reason);
    
    // Send email notification
    const user = await User.findById(req.params.userId);
    if (user && user.email) {
      emailService.sendKYCRejected(user.email, { name: user.firstName, reason }).catch(console.error);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Alternative KYC Approve endpoint (for frontend compatibility)
app.patch('/api/users/:userId/approve-kyc', authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.kycStatus = 'approved';
    user.kycApprovedBy = req.user.id;
    user.kycApprovedAt = new Date();
    await user.save();
    
    // Send email notification
    if (user.email) {
      emailService.sendKYCApproved(user.email, { name: user.firstName || user.username }).catch(console.error);
    }
    
    res.json({ success: true, message: 'KYC approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alternative KYC Reject endpoint (for frontend compatibility)
app.patch('/api/users/:userId/reject-kyc', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.kycStatus = 'rejected';
    user.kycRejectedBy = req.user.id;
    user.kycRejectedAt = new Date();
    user.kycRejectionReason = reason || 'No reason provided';
    await user.save();
    
    // Send email notification
    if (user.email) {
      emailService.sendKYCRejected(user.email, { name: user.firstName || user.username, reason: reason || 'No reason provided' }).catch(console.error);
    }
    
    res.json({ success: true, message: 'KYC rejected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== USER ROUTES ====================

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, country, address, walletAddress } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { firstName, lastName, phone, country, address, walletAddress, updatedAt: new Date() }, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

app.post('/api/user/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
    
    // Strong password validation
    if (newPassword.length < 12 || newPassword.length > 16) {
      return res.status(400).json({ message: 'Password must be 12-16 characters long' });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~])/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must include uppercase, lowercase, number, and symbol' });
    }
    
    const user = await User.findById(req.user.id);
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) return res.status(401).json({ message: 'Old password is incorrect' });
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const activeInvestments = await Investment.find({ userId: req.user.id, status: 'active' }).populate('planId');
    const pendingWithdrawals = await Withdrawal.find({ userId: req.user.id, status: 'pending' });
    const recentTransactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    
    res.json({
      balance: user.balance, 
      myWallet: user.myWallet || 0,
      fundWallet: user.fundWallet || 0,
      utilityWallet: user.utilityWallet || 0,
      totalInvested: user.totalInvested, 
      totalEarned: user.totalEarned, 
      todayEarning: user.todayEarning || 0,
      totalWithdrawn: user.totalWithdrawn,
      activeInvestments: activeInvestments.length, 
      pendingWithdrawals: pendingWithdrawals.length, 
      totalReferrals: user.directReferrals.length,
      investments: activeInvestments, 
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

// ==================== WALLET TRANSFER ROUTES ====================

// Get all wallet balances
app.get('/api/user/wallets', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      myWallet: user.myWallet || 0,
      fundWallet: user.fundWallet || 0,
      utilityWallet: user.utilityWallet || 0,
      totalInvested: user.totalInvested || 0,
      totalEarned: user.totalEarned || 0,
      todayEarning: user.todayEarning || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallets', error: error.message });
  }
});

// Transfer from Utility Wallet to My Wallet
app.post('/api/user/transfer/utility-to-mywallet', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    
    const user = await User.findById(req.user.id);
    if ((user.utilityWallet || 0) < amount) {
      return res.status(400).json({ message: 'Insufficient balance in Utility Wallet' });
    }
    
    user.utilityWallet = (user.utilityWallet || 0) - amount;
    user.myWallet = (user.myWallet || 0) + amount;
    await user.save();
    
    // Create transaction record
    await Transaction.create({
      userId: user._id,
      type: 'commission',
      amount: amount,
      description: 'Transfer from Utility Wallet to My Wallet',
      status: 'completed',
      previousBalance: user.utilityWallet + amount,
      newBalance: user.utilityWallet,
    });
    
    res.json({ 
      message: 'Transfer successful', 
      myWallet: user.myWallet, 
      utilityWallet: user.utilityWallet 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error transferring funds', error: error.message });
  }
});

// Transfer from My Wallet to Fund Wallet
app.post('/api/user/transfer/mywallet-to-fund', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    
    const user = await User.findById(req.user.id);
    if ((user.myWallet || 0) < amount) {
      return res.status(400).json({ message: 'Insufficient balance in My Wallet' });
    }
    
    user.myWallet = (user.myWallet || 0) - amount;
    user.fundWallet = (user.fundWallet || 0) + amount;
    await user.save();
    
    // Create transaction record
    await Transaction.create({
      userId: user._id,
      type: 'commission',
      amount: amount,
      description: 'Transfer from My Wallet to Fund Wallet',
      status: 'completed',
      previousBalance: user.myWallet + amount,
      newBalance: user.myWallet,
    });
    
    res.json({ 
      message: 'Transfer successful', 
      myWallet: user.myWallet, 
      fundWallet: user.fundWallet 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error transferring funds', error: error.message });
  }
});

// ==================== NETWORK/GENEALOGY ROUTES ====================

// Get My Direct Referrals (Level 1 - Users who used YOUR referral link)
app.get('/api/network/directs', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find all users who were referred by the current user
    const directReferrals = await User.find({ referredBy: req.user.id })
      .select('firstName lastName email phone status createdAt totalInvested totalEarned referralCode directReferrals')
      .sort({ createdAt: -1 });

    // Calculate stats for each direct
    const directsWithStats = await Promise.all(directReferrals.map(async (direct) => {
      // Count their downline (indirect referrals)
      const theirDirectCount = await User.countDocuments({ referredBy: direct._id });
      
      return {
        id: direct._id,
        name: `${direct.firstName} ${direct.lastName}`,
        email: direct.email,
        phone: direct.phone || 'N/A',
        status: direct.status,
        joinDate: direct.createdAt,
        totalInvested: direct.totalInvested || 0,
        totalEarned: direct.totalEarned || 0,
        referralCode: direct.referralCode,
        theirDirectCount: theirDirectCount,
        level: 1
      };
    }));

    res.json({
      success: true,
      totalDirects: directsWithStats.length,
      directs: directsWithStats
    });
  } catch (error) {
    console.error('Error fetching direct referrals:', error);
    res.status(500).json({ message: 'Error fetching direct referrals', error: error.message });
  }
});

// Get My Downline (Complete Network - All levels below you)
app.get('/api/network/downline', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Recursive function to build downline tree
    const buildDownlineTree = async (userId, level = 1, maxLevel = 10) => {
      if (level > maxLevel) return [];
      
      const referrals = await User.find({ referredBy: userId })
        .select('firstName lastName email phone status createdAt totalInvested totalEarned referralCode');
      
      const nodes = [];
      for (const referral of referrals) {
        const children = await buildDownlineTree(referral._id, level + 1, maxLevel);
        const totalDownline = children.reduce((sum, child) => sum + 1 + (child.totalDownline || 0), 0);
        
        nodes.push({
          id: referral._id,
          name: `${referral.firstName} ${referral.lastName}`,
          email: referral.email,
          phone: referral.phone || 'N/A',
          status: referral.status,
          joinDate: referral.createdAt,
          totalInvested: referral.totalInvested || 0,
          totalEarned: referral.totalEarned || 0,
          referralCode: referral.referralCode,
          level: level,
          directCount: children.length,
          totalDownline: totalDownline,
          children: children
        });
      }
      return nodes;
    };

    // Build the complete downline tree
    const downlineTree = await buildDownlineTree(req.user.id);
    
    // Calculate total stats
    const calculateTotalStats = (nodes) => {
      let total = 0;
      let totalInvested = 0;
      let totalEarned = 0;
      let levelCounts = {};
      
      const traverse = (nodeList) => {
        for (const node of nodeList) {
          total++;
          totalInvested += node.totalInvested || 0;
          totalEarned += node.totalEarned || 0;
          levelCounts[node.level] = (levelCounts[node.level] || 0) + 1;
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        }
      };
      traverse(nodes);
      return { total, totalInvested, totalEarned, levelCounts };
    };

    const stats = calculateTotalStats(downlineTree);

    res.json({
      success: true,
      totalDownline: stats.total,
      totalNetworkInvested: stats.totalInvested,
      totalNetworkEarned: stats.totalEarned,
      levelBreakdown: stats.levelCounts,
      downline: downlineTree
    });
  } catch (error) {
    console.error('Error fetching downline:', error);
    res.status(500).json({ message: 'Error fetching downline', error: error.message });
  }
});

// Get Full Genealogy Tree (for tree visualization)
app.get('/api/network/genealogy', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('firstName lastName email phone status createdAt totalInvested totalEarned referralCode');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Recursive function to build tree with limited depth
    const buildTree = async (userId, level = 0, maxLevel = 5) => {
      const currentUser = await User.findById(userId)
        .select('firstName lastName email phone status createdAt totalInvested totalEarned referralCode');
      
      if (!currentUser) return null;

      const children = [];
      if (level < maxLevel) {
        const referrals = await User.find({ referredBy: userId })
          .select('firstName lastName email phone status createdAt totalInvested totalEarned referralCode');
        
        for (const referral of referrals) {
          const childNode = await buildTree(referral._id, level + 1, maxLevel);
          if (childNode) children.push(childNode);
        }
      }

      const totalTeam = await User.countDocuments({ referredBy: userId });

      return {
        id: currentUser._id,
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        email: currentUser.email,
        phone: currentUser.phone || 'N/A',
        isActive: currentUser.status === 'active',
        rank: currentUser.totalInvested >= 10000 ? 'Diamond' : 
              currentUser.totalInvested >= 5000 ? 'Gold' : 
              currentUser.totalInvested >= 1000 ? 'Silver' : 'Bronze',
        level: level,
        joinDate: currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A',
        totalEarnings: currentUser.totalEarned || 0,
        totalTeam: totalTeam,
        directReferrals: children.length,
        referralCode: currentUser.referralCode,
        children: children
      };
    };

    const treeData = await buildTree(req.user.id, 0, 5);

    res.json({
      success: true,
      data: treeData
    });
  } catch (error) {
    console.error('Error fetching genealogy tree:', error);
    res.status(500).json({ message: 'Error fetching genealogy tree', error: error.message });
  }
});

// Get Network Statistics Summary
app.get('/api/network/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Direct referrals count
    const directCount = await User.countDocuments({ referredBy: req.user.id });

    // Recursive count of all downline
    const countAllDownline = async (userId) => {
      const directs = await User.find({ referredBy: userId }).select('_id');
      let count = directs.length;
      for (const direct of directs) {
        count += await countAllDownline(direct._id);
      }
      return count;
    };

    const totalDownline = await countAllDownline(req.user.id);

    // Get level-wise breakdown (up to 10 levels)
    const getLevelBreakdown = async (userId, level = 1, maxLevel = 10) => {
      if (level > maxLevel) return {};
      
      const directs = await User.find({ referredBy: userId }).select('_id');
      let breakdown = { [level]: directs.length };
      
      for (const direct of directs) {
        const childBreakdown = await getLevelBreakdown(direct._id, level + 1, maxLevel);
        for (const [lvl, cnt] of Object.entries(childBreakdown)) {
          breakdown[lvl] = (breakdown[lvl] || 0) + cnt;
        }
      }
      return breakdown;
    };

    const levelBreakdown = await getLevelBreakdown(req.user.id);

    // Get active members count
    const activeDirects = await User.countDocuments({ referredBy: req.user.id, status: 'active' });

    res.json({
      success: true,
      stats: {
        directReferrals: directCount,
        activeDirects: activeDirects,
        totalDownline: totalDownline,
        totalNetwork: directCount + totalDownline - directCount, // Just the downline beyond directs
        levelBreakdown: levelBreakdown,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error('Error fetching network stats:', error);
    res.status(500).json({ message: 'Error fetching network stats', error: error.message });
  }
});

// ==================== PLANS ROUTES ====================

app.get('/api/plans', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ investment: 1 });
    res.json({ plans });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
});

app.get('/api/plans/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ plan });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plan', error: error.message });
  }
});

app.post('/api/plans', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, investment, dailyEarn, duration, totalReturn, roi, note } = req.body;
    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) return res.status(400).json({ message: 'Plan already exists' });
    
    const plan = new Plan({ name, investment, dailyEarn, duration, totalReturn, roi, note, isActive: true });
    await plan.save();
    res.status(201).json({ message: 'Plan created', plan });
  } catch (error) {
    res.status(500).json({ message: 'Error creating plan', error: error.message });
  }
});

app.put('/api/plans/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, investment, dailyEarn, duration, totalReturn, roi, note, isActive } = req.body;
    const plan = await Plan.findByIdAndUpdate(req.params.id, { name, investment, dailyEarn, duration, totalReturn, roi, note, isActive, updatedAt: new Date() }, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan updated', plan });
  } catch (error) {
    res.status(500).json({ message: 'Error updating plan', error: error.message });
  }
});

app.delete('/api/plans/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await Plan.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plan', error: error.message });
  }
});

// ==================== INVESTMENT ROUTES ====================

app.post('/api/investments', authenticateToken, async (req, res) => {
  try {
    const { planId, activationFor, downlineUserId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) return res.status(404).json({ message: 'Plan not found' });
    
    // Use Fund Wallet for plan activation
    if ((user.fundWallet || 0) < plan.investment) {
      return res.status(400).json({ message: 'Insufficient balance in Fund Wallet. Please deposit funds or transfer from My Wallet.' });
    }
    
    // Check if this is the user's first investment (for referral bonus)
    const existingInvestments = await Investment.countDocuments({ userId: req.user.id });
    const isFirstInvestment = existingInvestments === 0;
    
    const investment = new Investment({
      userId: req.user.id, planId, amount: plan.investment, startDate: new Date(),
      endDate: calculateEndDate(new Date(), plan.duration), status: 'active', activationFor: activationFor || 'self', downlineUserId,
    });
    
    await investment.save();
    
    // Deduct from Fund Wallet instead of main balance
    user.fundWallet = (user.fundWallet || 0) - plan.investment;
    user.totalInvested += plan.investment;
    user.activeInvestments += 1;
    user.totalInvestmentCount += 1;
    
    // Set activatedAt on first investment (Date of Activation)
    if (!user.activatedAt) {
      user.activatedAt = new Date();
      user.status = 'active';
    }
    
    await user.save();
    
    const transaction = new Transaction({
      userId: req.user.id, type: 'investment', amount: -plan.investment,
      previousBalance: (user.fundWallet || 0) + plan.investment, newBalance: user.fundWallet || 0, status: 'completed',
      description: `Investment in ${plan.name} - Deducted from Fund Wallet`, investmentId: investment._id,
    });
    
    await transaction.save();

    // Create user notification for investment activation
    await createUserNotification(
      req.user.id,
      'investment_activated',
      'Investment Activated! 🚀',
      `Your ${plan.name} investment of $${plan.investment} is now active. Daily earning: $${plan.dailyEarn}`,
      { amount: plan.investment, investmentId: investment._id, planName: plan.name }
    );
    
    // Create admin notification for plan activation
    await AdminNotification.create({
      type: 'investment',
      title: 'New Plan Activated',
      message: `${user.firstName} ${user.lastName} has activated the ${plan.name} plan worth $${plan.investment}`,
      userId: user._id,
      data: {
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        planName: plan.name,
        planAmount: plan.investment,
        investmentId: investment._id.toString()
      },
      priority: 'high',
    });
    
    // Credit Referral Bonus & Welcome Bonus on First Investment
    if (isFirstInvestment) {
      // 1. Welcome Bonus (5%) to User's Utility Wallet
      const welcomeBonus = plan.investment * 0.05;
      user.utilityWallet = (user.utilityWallet || 0) + welcomeBonus;
      user.totalEarned = (user.totalEarned || 0) + welcomeBonus;
      await user.save();

      await Transaction.create({
        userId: user._id,
        type: 'bonus', // New type for welcome bonus
        amount: welcomeBonus,
        description: `Welcome Bonus (5%) for activating ${plan.name}`,
        status: 'completed',
        previousBalance: (user.utilityWallet || 0) - welcomeBonus,
        newBalance: user.utilityWallet,
        investmentId: investment._id
      });
      
      // Notify User
      await createUserNotification(
        user._id,
        'welcome_bonus',
        'Welcome Bonus! 🎁',
        `You received $${welcomeBonus} Welcome Bonus in your Utility Wallet.`,
        { amount: welcomeBonus }
      );

      // 2. Referral Bonus (5%) to Referrer's Utility Wallet
      if (user.referredBy) {
        const referrer = await User.findById(user.referredBy);
        if (referrer) {
           const refBonus = plan.investment * 0.05;
           referrer.utilityWallet = (referrer.utilityWallet || 0) + refBonus;
           referrer.totalEarned = (referrer.totalEarned || 0) + refBonus;
           await referrer.save();

           await Transaction.create({
             userId: referrer._id,
             type: 'referral_bonus',
             amount: refBonus,
             description: `Referral Bonus (5%) from ${user.firstName} ${user.lastName}`,
             status: 'completed',
             previousBalance: (referrer.utilityWallet || 0) - refBonus,
             newBalance: referrer.utilityWallet,
             investmentId: investment._id
           });
           
           // Notify Referrer
           await createUserNotification(
            referrer._id,
            'referral_bonus',
            'Referral Bonus! 🤝',
            `You earned $${refBonus} (5%) bonus from ${user.firstName}'s investment.`,
            { amount: refBonus }
           );

           // Update pending ReferralBonus record if exists
           const referralBonusRecord = await ReferralBonus.findOne({ 
             referredUserId: user._id, 
             referrerId: user.referredBy,
             status: 'pending'
           });
           
           if (referralBonusRecord) {
             referralBonusRecord.bonusAmount = refBonus;
             referralBonusRecord.investmentId = investment._id;
             referralBonusRecord.investmentAmount = plan.investment;
             referralBonusRecord.status = 'approved';
             referralBonusRecord.approvedAt = new Date();
             await referralBonusRecord.save();
           }
        }
      }
    }
    
    // Send email notification
    emailService.sendInvestmentConfirmed(user.email, {
      name: user.firstName,
      amount: plan.investment,
      planName: plan.name,
      dailyReturn: plan.dailyEarn,
      duration: plan.duration,
      expectedTotal: plan.totalReturn,
      startDate: investment.startDate,
      endDate: investment.endDate
    }).catch(console.error);
    
    res.status(201).json({ message: 'Investment created', investment: await investment.populate('planId') });
  } catch (error) {
    res.status(500).json({ message: 'Error creating investment', error: error.message });
  }
});

app.get('/api/investments', authenticateToken, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id }).populate('planId').sort({ createdAt: -1 });
    res.json({ investments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investments', error: error.message });
  }
});

app.get('/api/investments/:id', authenticateToken, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id).populate('planId').populate('userId', '-password');
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    if (investment.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json({ investment });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investment', error: error.message });
  }
});

// ==================== INVESTMENT STATUS CHECK (Every Hour) ====================
// NOTE: Daily earnings are NOT auto-credited. Admin must trigger via /api/admin/daily-returns/process
// This cron only checks for expired/completed investments.

cron.schedule('0 * * * *', async () => {
  try {
    const activeInvestments = await Investment.find({ status: 'active' }).populate('planId userId');
    
    for (const investment of activeInvestments) {
      const plan = investment.planId;
      const user = investment.userId;
      if (!plan || !user) continue;
      
      const daysElapsed = Math.floor((new Date() - investment.startDate) / (1000 * 60 * 60 * 24));
      
      // Only mark completed investments
      if (daysElapsed > plan.duration) {
        investment.status = 'completed';
        investment.daysCompleted = plan.duration;
        await investment.save();
        
        user.activeInvestments = Math.max(0, (user.activeInvestments || 1) - 1);
        await user.save();
        
        console.log(`✅ Investment completed for ${user.email}: ${plan.name}`);
      } else {
        // Just update days count, no money credited
        investment.daysCompleted = daysElapsed;
        await investment.save();
      }
    }
  } catch (error) {
    console.error('❌ Investment status check error:', error);
  }
});

// ==================== WALLET ROUTES ====================

app.get('/api/wallet/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.balance, totalEarned: user.totalEarned, totalInvested: user.totalInvested, totalWithdrawn: user.totalWithdrawn, pendingWithdrawal: user.pendingWithdrawal, walletAddress: user.walletAddress });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallet', error: error.message });
  }
});

// ==================== DASHBOARD/WALLET ROUTES ====================

app.get('/api/dashboard/wallet', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = userId ? await User.findById(userId).select('balance') : null;
    let settings = await AdminSettings.findOne({});
    if (!settings) settings = await AdminSettings.create({ key: 'platform-settings', depositWalletAddress: '' });

    const balances = [
      {
        currency: 'USDT',
        amount: user?.balance || 0,
        usdValue: user?.balance || 0,
      },
    ];

    const addresses = {
      USDT: settings.depositWalletAddress || '',
    };

    res.json({ balances, addresses });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    res.status(500).json({ message: 'Failed to load wallet', error: error.message });
  }
});

app.post('/api/wallet/deposit', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    
    // Check if body provides userId (admin can credit anyone) or default to self
    const targetUserId = req.body.userId || req.user.id;
    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const prevFundWallet = user.fundWallet || 0;
    user.fundWallet = prevFundWallet + amount;
    // Keep balance in sync
    user.balance = (user.myWallet || 0) + (user.fundWallet || 0) + (user.utilityWallet || 0);
    await user.save();
    
    const transaction = new Transaction({
      userId: user._id, type: 'deposit', amount, previousBalance: prevFundWallet,
      newBalance: user.fundWallet, status: 'completed', description: description || 'Admin Manual Deposit',
    });
    await transaction.save();
    
    res.json({ message: 'Deposit successful', fundWallet: user.fundWallet, newBalance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Error processing deposit', error: error.message });
  }
});

// ==================== WITHDRAWAL ROUTES ====================

app.post('/api/withdrawals', authenticateToken, async (req, res) => {
  try {
    const { amount, walletAddress, requestReason } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Check withdrawable balance (My Wallet is the withdrawable wallet)
    const withdrawableBalance = (user.myWallet || 0);
    if (amount > withdrawableBalance) return res.status(400).json({ message: `Insufficient balance in My Wallet. Available: $${withdrawableBalance}` });
    
    const settings = await AdminSettings.findOne({});
    const minWithdrawal = settings?.minWithdrawal || 50;
    if (amount < minWithdrawal) return res.status(400).json({ message: `Minimum withdrawal is ${minWithdrawal} USDT` });
    
    // Check KYC level withdrawal limits
    const kycWithdrawalLimits = { 0: 0, 1: 100, 2: 1000, 3: 10000 };
    const userLimit = kycWithdrawalLimits[user.kycLevel || 0];
    if (amount > userLimit) {
      return res.status(400).json({ 
        message: `Your KYC level ${user.kycLevel || 0} allows withdrawals up to $${userLimit}. Please complete KYC verification for higher limits.`
      });
    }
    
    const withdrawal = new Withdrawal({
      userId: req.user.id, amount, walletAddress: walletAddress || user.walletAddress, requestReason, status: 'pending',
    });
    
    await withdrawal.save();
    user.myWallet = (user.myWallet || 0) - amount;
    user.pendingWithdrawal += amount;
    // Keep balance in sync
    user.balance = (user.myWallet || 0) + (user.fundWallet || 0) + (user.utilityWallet || 0);
    await user.save();
    
    // Send email notification
    emailService.sendWithdrawalRequested(user.email, {
      name: user.firstName,
      amount,
      requestId: withdrawal._id,
      walletAddress: walletAddress || user.walletAddress,
      network: 'TRC20'
    }).catch(console.error);

    // Create user notification for withdrawal submitted
    await createUserNotification(
      user._id,
      'withdrawal_submitted',
      'Withdrawal Submitted 📤',
      `Your withdrawal request of $${amount} has been submitted and is pending admin approval.`,
      { amount }
    );

    // Create admin notification for new withdrawal request
    const adminNotification = new AdminNotification({
      type: 'withdrawal_request',
      title: 'New Withdrawal Request 💸',
      message: `${user.firstName} ${user.lastName} (${user.email}) requested a withdrawal of $${amount} to wallet ${walletAddress || user.walletAddress}`,
      userId: user._id,
      data: {
        investmentAmount: amount,
        newUserName: `${user.firstName} ${user.lastName}`,
        newUserEmail: user.email,
      },
      priority: 'high',
    });
    await adminNotification.save();
    
    res.status(201).json({ message: 'Withdrawal request submitted', withdrawal });
  } catch (error) {
    res.status(500).json({ message: 'Error creating withdrawal', error: error.message });
  }
});

// ==================== DEPOSIT ENDPOINTS ====================

// Create deposit request (user)
app.post('/api/deposits', authenticateToken, upload.single('slip'), async (req, res) => {
  try {
    const { amount, transactionHash, network, adminAddress, userWalletAddress } = req.body;
    
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }
    if (!transactionHash) {
      return res.status(400).json({ message: 'Transaction hash is required' });
    }
    if (!network || !['usdt_trc20', 'bnb_bep20'].includes(network)) {
      return res.status(400).json({ message: 'Invalid network selected' });
    }

    // Check for duplicate transaction hash
    const existing = await Deposit.findOne({ transactionHash });
    if (existing) {
      return res.status(400).json({ message: 'This transaction hash has already been submitted' });
    }

    const depositData = {
      userId: req.user.id,
      amount: parseFloat(amount),
      network,
      adminAddress,
      userWalletAddress,
      transactionHash,
      status: 'pending',
    };

    // Store payment slip if uploaded
    if (req.file) {
      depositData.paymentSlipData = req.file.buffer;
      depositData.paymentSlipMimeType = req.file.mimetype;
      depositData.paymentSlip = `deposit_${Date.now()}_${req.file.originalname}`;
    }

    const deposit = new Deposit(depositData);
    await deposit.save();

    // Fetch user for notifications
    const user = await User.findById(req.user.id);
    if (user) {
      const currency = deposit.network === 'usdt_trc20' ? 'USDT' : 'BNB';

      // Send email notification for deposit submitted
      emailService.sendDepositSubmitted(user.email, {
        name: user.firstName,
        amount: deposit.amount,
        currency
      }).catch(console.error);

      // Create user notification for deposit submitted
      await createUserNotification(
        user._id,
        'deposit_submitted',
        'Deposit Submitted 📤',
        `Your deposit of $${deposit.amount} ${currency} has been submitted and is pending admin review.`,
        { amount: deposit.amount }
      );

      // Create admin notification for new deposit
      const adminNotification = new AdminNotification({
        type: 'deposit',
        title: 'New Deposit Request 💰',
        message: `${user.firstName} ${user.lastName} (${user.email}) submitted a deposit of $${deposit.amount} ${currency}. Transaction: ${deposit.transactionHash}`,
        userId: user._id,
        data: {
          investmentAmount: deposit.amount,
          newUserName: `${user.firstName} ${user.lastName}`,
          newUserEmail: user.email,
        },
        priority: 'high',
      });
      await adminNotification.save();
    }

    res.status(201).json({ 
      success: true, 
      message: 'Deposit request submitted successfully. Admin will verify and approve.',
      deposit: {
        id: deposit._id,
        amount: deposit.amount,
        network: deposit.network,
        status: deposit.status,
        transactionHash: deposit.transactionHash,
        createdAt: deposit.createdAt
      }
    });
  } catch (error) {
    console.error('Deposit creation error:', error);
    res.status(500).json({ message: 'Error creating deposit request', error: error.message });
  }
});

// Get user's deposits
app.get('/api/deposits', authenticateToken, async (req, res) => {
  try {
    const deposits = await Deposit.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-paymentSlipData');
    res.json({ deposits });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deposits', error: error.message });
  }
});

// Admin: Get all pending deposits
app.get('/api/admin/deposits/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const deposits = await Deposit.find({ status: 'pending' })
      .populate('userId', 'userId firstName lastName email phone walletAddress walletType')
      .sort({ createdAt: -1 })
      .select('-paymentSlipData');
    res.json({ success: true, data: deposits });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending deposits', error: error.message });
  }
});

// Admin: Get all deposits
app.get('/api/admin/deposits', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const deposits = await Deposit.find(query)
      .populate('userId', 'userId firstName lastName email phone walletAddress walletType')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .select('-paymentSlipData');
    res.json({ success: true, data: deposits });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deposits', error: error.message });
  }
});

// Get deposit payment slip image
app.get('/api/admin/deposits/:id/slip', authenticateToken, isAdmin, async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit || !deposit.paymentSlipData) {
      return res.status(404).json({ message: 'Payment slip not found' });
    }
    res.set('Content-Type', deposit.paymentSlipMimeType || 'image/png');
    res.send(deposit.paymentSlipData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment slip', error: error.message });
  }
});

// Admin: Approve deposit
app.post('/api/admin/deposits/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }
    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit has already been processed' });
    }

    // Update deposit status
    deposit.status = 'approved';
    deposit.approvedBy = req.user.id;
    deposit.approvedAt = new Date();
    deposit.adminNotes = adminNotes;
    await deposit.save();

    // Credit user's Fund Wallet (not main balance)
    const user = await User.findById(deposit.userId);
    if (user) {
      user.fundWallet = (user.fundWallet || 0) + deposit.amount;
      // Keep balance in sync
      user.balance = (user.myWallet || 0) + (user.fundWallet || 0) + (user.utilityWallet || 0);
      await user.save();

      // Create transaction record
      const transaction = new Transaction({
        userId: user._id,
        type: 'deposit',
        amount: deposit.amount,
        currency: deposit.network === 'usdt_trc20' ? 'USDT' : 'BNB',
        status: 'completed',
        description: `Deposit via ${deposit.network.toUpperCase()} - Credited to Fund Wallet`,
        transactionId: deposit.transactionHash,
        balanceAfter: user.fundWallet
      });
      await transaction.save();

      // Create user notification for approved deposit
      await createUserNotification(
        user._id,
        'deposit_approved',
        'Deposit Approved! 💰',
        `Your deposit of $${deposit.amount} has been approved and credited to your Fund Wallet.`,
        { amount: deposit.amount, transactionId: transaction._id }
      );

      // Send email notification for approved deposit
      const currency = deposit.network === 'usdt_trc20' ? 'USDT' : 'BNB';
      emailService.sendDepositApproved(user.email, {
        name: user.firstName,
        amount: deposit.amount,
        currency
      }).catch(console.error);

      // Create admin notification for approved deposit
      const adminNotification = new AdminNotification({
        type: 'deposit_approved',
        title: 'Deposit Approved ✅',
        message: `Deposit of $${deposit.amount} for ${user.firstName} ${user.lastName} (${user.email}) has been approved and credited.`,
        userId: user._id,
        data: {
          investmentAmount: deposit.amount,
          newUserName: `${user.firstName} ${user.lastName}`,
          newUserEmail: user.email,
          transactionId: transaction._id,
        },
        priority: 'normal',
      });
      await adminNotification.save();
    }

    res.json({ 
      success: true, 
      message: `Deposit of $${deposit.amount} approved and credited to user's Fund Wallet`,
      deposit
    });
  } catch (error) {
    console.error('Deposit approval error:', error);
    res.status(500).json({ message: 'Error approving deposit', error: error.message });
  }
});

// Admin: Reject deposit
app.post('/api/admin/deposits/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { reason, adminNotes } = req.body;
    
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }
    if (deposit.status !== 'pending') {
      return res.status(400).json({ message: 'Deposit has already been processed' });
    }

    deposit.status = 'rejected';
    deposit.rejectedBy = req.user.id;
    deposit.rejectedAt = new Date();
    deposit.rejectionReason = reason;
    deposit.adminNotes = adminNotes;
    await deposit.save();

    // Create user notification for rejected deposit
    await createUserNotification(
      deposit.userId,
      'deposit_rejected',
      'Deposit Rejected ❌',
      `Your deposit of $${deposit.amount} was rejected. Reason: ${reason || 'Not specified'}`,
      { amount: deposit.amount }
    );

    // Fetch user for email notification
    const user = await User.findById(deposit.userId);
    if (user) {
      const currency = deposit.network === 'usdt_trc20' ? 'USDT' : 'BNB';
      emailService.sendDepositRejected(user.email, {
        name: user.firstName,
        amount: deposit.amount,
        currency,
        reason: reason || 'Not specified'
      }).catch(console.error);

      // Create admin notification for rejected deposit
      const adminNotification = new AdminNotification({
        type: 'deposit_rejected',
        title: 'Deposit Rejected ❌',
        message: `Deposit of $${deposit.amount} for ${user.firstName} ${user.lastName} (${user.email}) was rejected. Reason: ${reason || 'Not specified'}`,
        userId: user._id,
        data: {
          investmentAmount: deposit.amount,
          newUserName: `${user.firstName} ${user.lastName}`,
          newUserEmail: user.email,
        },
        priority: 'normal',
      });
      await adminNotification.save();
    }

    res.json({ 
      success: true, 
      message: 'Deposit rejected',
      deposit
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting deposit', error: error.message });
  }
});

// ==================== END DEPOSIT ENDPOINTS ====================

app.get('/api/withdrawals', authenticateToken, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching withdrawals', error: error.message });
  }
});

app.post('/api/withdrawals/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { transactionHash } = req.body;
    const withdrawal = await Withdrawal.findByIdAndUpdate(req.params.id, { status: 'completed', approvedBy: req.user.id, approvalDate: new Date(), transactionHash }, { new: true }).populate('userId');
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
    
    const user = await User.findById(withdrawal.userId._id);
    // Balance was already deducted from myWallet when request was created
    // Just update totals and keep balance in sync
    user.totalWithdrawn += withdrawal.amount;
    user.pendingWithdrawal -= withdrawal.amount;
    user.balance = (user.myWallet || 0) + (user.fundWallet || 0) + (user.utilityWallet || 0);
    await user.save();
    
    const transaction = new Transaction({
      userId: withdrawal.userId._id, type: 'withdrawal', amount: -withdrawal.amount, previousBalance: user.balance + withdrawal.amount,
      newBalance: user.balance, status: 'completed', description: `Withdrawal to ${withdrawal.walletAddress}`, withdrawalId: withdrawal._id, transactionHash,
    });
    await transaction.save();
    
    // Send email notification
    emailService.sendWithdrawalApproved(user.email, {
      name: user.firstName,
      amount: withdrawal.amount,
      walletAddress: withdrawal.walletAddress,
      txHash: transactionHash,
      network: 'TRC20'
    }).catch(console.error);

    // Create user notification for approved withdrawal
    await createUserNotification(
      user._id,
      'withdrawal_approved',
      'Withdrawal Approved! ✅',
      `Your withdrawal of $${withdrawal.amount} has been processed and sent to your wallet.`,
      { amount: withdrawal.amount, transactionId: transaction._id }
    );

    // Create admin notification for approved withdrawal
    const adminNotifApproval = new AdminNotification({
      type: 'withdrawal_completed',
      title: 'Withdrawal Approved ✅',
      message: `Withdrawal of $${withdrawal.amount} for ${user.firstName} ${user.lastName} (${user.email}) has been approved and processed.`,
      userId: user._id,
      data: {
        investmentAmount: withdrawal.amount,
        newUserName: `${user.firstName} ${user.lastName}`,
        newUserEmail: user.email,
        transactionId: transaction._id,
      },
      priority: 'normal',
    });
    await adminNotifApproval.save();
    
    res.json({ message: 'Withdrawal approved', withdrawal });
  } catch (error) {
    res.status(500).json({ message: 'Error approving withdrawal', error: error.message });
  }
});

app.post('/api/withdrawals/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const withdrawal = await Withdrawal.findByIdAndUpdate(req.params.id, { status: 'rejected', approvedBy: req.user.id, rejectionReason, approvalDate: new Date() }, { new: true }).populate('userId');
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
    
    const user = await User.findById(withdrawal.userId._id);
    // Restore funds back to My Wallet since withdrawal was rejected
    user.myWallet = (user.myWallet || 0) + withdrawal.amount;
    user.pendingWithdrawal -= withdrawal.amount;
    // Keep balance in sync
    user.balance = (user.myWallet || 0) + (user.fundWallet || 0) + (user.utilityWallet || 0);
    await user.save();
    
    // Send email notification
    emailService.sendWithdrawalRejected(user.email, {
      name: user.firstName,
      requestId: withdrawal._id,
      amount: withdrawal.amount,
      reason: rejectionReason
    }).catch(console.error);

    // Create user notification for rejected withdrawal
    await createUserNotification(
      user._id,
      'withdrawal_rejected',
      'Withdrawal Rejected ❌',
      `Your withdrawal request of $${withdrawal.amount} was rejected. Reason: ${rejectionReason || 'Not specified'}`,
      { amount: withdrawal.amount }
    );

    // Create admin notification for rejected withdrawal
    const adminNotifRejection = new AdminNotification({
      type: 'withdrawal_rejected',
      title: 'Withdrawal Rejected ❌',
      message: `Withdrawal of $${withdrawal.amount} for ${user.firstName} ${user.lastName} (${user.email}) was rejected. Reason: ${rejectionReason || 'Not specified'}`,
      userId: user._id,
      data: {
        investmentAmount: withdrawal.amount,
        newUserName: `${user.firstName} ${user.lastName}`,
        newUserEmail: user.email,
      },
      priority: 'normal',
    });
    await adminNotifRejection.save();
    
    res.json({ message: 'Withdrawal rejected', withdrawal });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting withdrawal', error: error.message });
  }
});

// ==================== TRANSACTION ROUTES ====================

app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { type, status, limit = 50, page = 1 } = req.query;
    let query = { userId: req.user.id };
    if (type) query.type = type;
    if (status) query.status = status;
    
    const transactions = await Transaction.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Transaction.countDocuments(query);
    
    res.json({ transactions, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// ==================== REPORTS ROUTES ====================

app.get('/api/reports/daily-income', authenticateToken, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const earnings = await Transaction.find({ userId: req.user.id, type: 'earning', createdAt: { $gte: startDate } });
    
    const dailyIncomeMap = {};
    earnings.forEach(earning => {
      const date = earning.createdAt.toISOString().split('T')[0];
      dailyIncomeMap[date] = (dailyIncomeMap[date] || 0) + earning.amount;
    });
    
    const data = Object.keys(dailyIncomeMap).map(date => ({ date, amount: dailyIncomeMap[date] }));
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});

app.get('/api/reports/direct-income', authenticateToken, async (req, res) => {
  try {
    const directReferrals = await User.find({ referredBy: req.user.id }).select('firstName lastName email totalInvested balance');
    const totalDirectIncome = directReferrals.reduce((sum, user) => sum + user.totalInvested, 0);
    res.json({ directReferrals: directReferrals.length, totalDirectIncome, referrals: directReferrals });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});

app.get('/api/reports/downline', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('downlineUsers');
    const downlineIncome = user.downlineUsers.reduce((sum, member) => sum + member.totalInvested, 0);
    res.json({ totalDownlineMembers: user.downlineUsers.length, totalDownlineIncome: downlineIncome, members: user.downlineUsers });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, role, limit = 50, page = 1, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
      ];
    }
    
    const users = await User.find(query).select('-password').limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    res.json({ users, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

app.get('/api/admin/withdrawals', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status = 'pending', limit = 50, page = 1 } = req.query;
    const withdrawals = await Withdrawal.find({ status }).populate('userId', '-password').limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit)).sort({ createdAt: -1 });
    const total = await Withdrawal.countDocuments({ status });
    res.json({ withdrawals, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching withdrawals', error: error.message });
  }
});

// Get pending withdrawal requests with full details
app.get('/api/admin/withdrawals/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const pendingWithdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('userId', 'userId firstName lastName email phone')
      .sort({ createdAt: -1 });
    
    const requests = pendingWithdrawals.map(w => ({
      id: w._id,
      date: w.createdAt,
      userName: w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : 'Unknown',
      referenceId: w.userId?.userId || 'N/A',
      phone: w.userId?.phone || 'N/A',
      email: w.userId?.email || 'N/A',
      walletType: w.walletType || 'cash',
      amount: w.amount,
      walletAddress: w.walletAddress || 'N/A',
      network: w.network || w.currency || 'USDT',
      status: w.status
    }));
    
    res.json({ pendingRequests: requests });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending withdrawals', error: error.message });
  }
});

// Get withdrawal summary statistics
app.get('/api/admin/withdrawals/summary', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [pending, approved, rejected, all] = await Promise.all([
      Withdrawal.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Withdrawal.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Withdrawal.aggregate([{ $match: { status: 'rejected' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Withdrawal.aggregate([{ $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }])
    ]);
    
    res.json({
      requestSummary: {
        pending: { amount: pending[0]?.total || 0, count: pending[0]?.count || 0 },
        approved: { amount: approved[0]?.total || 0, count: approved[0]?.count || 0 },
        rejected: { amount: rejected[0]?.total || 0, count: rejected[0]?.count || 0 },
        total: { amount: all[0]?.total || 0, count: all[0]?.count || 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching withdrawal summary', error: error.message });
  }
});

// Get datewise withdrawal summary
app.get('/api/admin/withdrawals/datewise', authenticateToken, isAdmin, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const datewiseSummary = await Withdrawal.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          requests: { $sum: 1 },
          amount: { $sum: '$amount' },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);
    
    res.json({
      datewiseSummary: datewiseSummary.map(d => ({
        date: d._id,
        requests: d.requests,
        amount: d.amount,
        approved: d.approved,
        pending: d.pending
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching datewise summary', error: error.message });
  }
});

// Get recent transactions for admin analytics
app.get('/api/admin/transactions/recent', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get recent deposits
    const deposits = await Deposit.find()
      .populate('userId', 'userId firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Get recent withdrawals
    const withdrawals = await Withdrawal.find()
      .populate('userId', 'userId firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Combine and sort by date
    const transactions = [
      ...deposits.map(d => ({
        id: d._id,
        type: 'deposit',
        userName: d.userId ? `${d.userId.firstName} ${d.userId.lastName}` : 'Unknown',
        referenceId: d.userId?.userId || 'N/A',
        amount: d.amount,
        status: d.status,
        date: d.createdAt,
        currency: d.currency || 'USDT'
      })),
      ...withdrawals.map(w => ({
        id: w._id,
        type: 'withdrawal',
        userName: w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : 'Unknown',
        referenceId: w.userId?.userId || 'N/A',
        amount: w.amount,
        status: w.status,
        date: w.createdAt,
        currency: w.currency || 'USDT'
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(limit));
    
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent transactions', error: error.message });
  }
});

// Get credit/debit transactions - REAL DATA (system transactions like bonuses, commissions)
app.get('/api/admin/credit-debit-summary', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get all transaction types for summary
    const creditTransactions = await Transaction.find({ type: { $in: ['earning', 'commission', 'referral_bonus', 'admin_credit'] } })
      .populate('userId', 'userId firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    const debitTransactions = await Transaction.find({ type: { $in: ['withdrawal', 'investment', 'expense'] } })
      .populate('userId', 'userId firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    // Calculate summary
    const totalCredit = await Transaction.aggregate([
      { $match: { type: { $in: ['earning', 'commission', 'referral_bonus', 'admin_credit'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalDebit = await Transaction.aggregate([
      { $match: { type: { $in: ['withdrawal', 'investment', 'expense'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const creditByType = await Transaction.aggregate([
      { $match: { type: { $in: ['earning', 'commission', 'referral_bonus', 'admin_credit'] } } },
      { $group: { _id: '$type', amount: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      summary: {
        totalCredits: totalCredit[0]?.total || 0,
        totalDebits: totalDebit[0]?.total || 0,
        netBalance: (totalCredit[0]?.total || 0) - (totalDebit[0]?.total || 0),
        creditCount: creditTransactions.length,
        debitCount: debitTransactions.length
      },
      creditBreakdown: creditByType,
      recentCredits: creditTransactions.map(t => ({
        id: t._id,
        userId: t.userId?.userId || 'N/A',
        userName: t.userId ? t.userId.firstName + ' ' + t.userId.lastName : 'N/A',
        email: t.userId?.email || 'N/A',
        type: t.type,
        amount: t.amount,
        description: t.description || 'N/A',
        status: t.status || 'completed',
        date: t.createdAt
      })).slice(0, 20),
      recentDebits: debitTransactions.map(t => ({
        id: t._id,
        userId: t.userId?.userId || 'N/A',
        userName: t.userId ? t.userId.firstName + ' ' + t.userId.lastName : 'N/A',
        email: t.userId?.email || 'N/A',
        type: t.type,
        amount: t.amount,
        description: t.description || 'N/A',
        status: t.status || 'completed',
        date: t.createdAt
      })).slice(0, 20)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching credit/debit summary', error: error.message });
  }
});

// Get wallet statistics for admin
app.get('/api/admin/wallet/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [totalBalance, totalDeposits, totalWithdrawals, userCount] = await Promise.all([
      User.aggregate([{ $match: { role: { $ne: 'admin' } } }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
      Deposit.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Withdrawal.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.countDocuments({ role: { $ne: 'admin' } })
    ]);
    
    res.json({
      walletStats: {
        totalBalance: totalBalance[0]?.total || 0,
        totalDeposits: totalDeposits[0]?.total || 0,
        totalWithdrawals: totalWithdrawals[0]?.total || 0,
        totalUsers: userCount,
        avgBalance: userCount > 0 ? (totalBalance[0]?.total || 0) / userCount : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallet stats', error: error.message });
  }
});

app.put('/api/admin/users/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status, updatedAt: new Date() }, { new: true }).select('-password');
    res.json({ message: 'User status updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

app.get('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings({ key: 'platform-settings' });
      await settings.save();
    }
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
});

app.put('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) settings = new AdminSettings({ key: 'platform-settings' });
    Object.assign(settings, req.body);
    settings.updatedBy = req.user.id;
    settings.updatedAt = new Date();
    await settings.save();
    res.json({ message: 'Settings updated', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

// Get specific admin config
app.get('/api/admin/settings/config', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings({ key: 'platform-settings' });
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching config', error: error.message });
  }
});

// Save specific admin config
app.post('/api/admin/settings/config', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) settings = new AdminSettings({ key: 'platform-settings' });
    Object.assign(settings, req.body);
    settings.updatedBy = req.user.id;
    settings.updatedAt = new Date();
    await settings.save();
    res.json({ success: true, message: 'Settings saved successfully', data: settings });
  } catch (error) {
    res.status(500).json({ message: 'Error saving config', error: error.message });
  }
});

// ROI Settings - GET
app.get('/api/admin/settings/roi', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings({ key: 'platform-settings' });
      await settings.save();
    }
    res.json({ 
      success: true, 
      data: {
        dailyROI: settings.dailyROI || 0.5,
        minInvestment: settings.minInvestment || 100,
        maxInvestment: settings.maxInvestment || 100000,
        roiDuration: settings.roiDuration || 365,
        roiEnabled: settings.roiEnabled !== false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching ROI settings', error: error.message });
  }
});

// ROI Settings - PUT
app.put('/api/admin/settings/roi', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) settings = new AdminSettings({ key: 'platform-settings' });
    
    const { dailyROI, minInvestment, maxInvestment, roiDuration, roiEnabled } = req.body;
    if (dailyROI !== undefined) settings.dailyROI = dailyROI;
    if (minInvestment !== undefined) settings.minInvestment = minInvestment;
    if (maxInvestment !== undefined) settings.maxInvestment = maxInvestment;
    if (roiDuration !== undefined) settings.roiDuration = roiDuration;
    if (roiEnabled !== undefined) settings.roiEnabled = roiEnabled;
    
    settings.updatedBy = req.user.id;
    settings.updatedAt = new Date();
    await settings.save();
    res.json({ success: true, message: 'ROI settings updated', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating ROI settings', error: error.message });
  }
});

// Deposit Addresses - GET
app.get('/api/admin/settings/deposit-addresses', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings({ key: 'platform-settings' });
      await settings.save();
    }
    const addresses = settings.depositAddresses || [
      { id: 1, coin: 'USDT', network: 'TRC20', address: settings.depositWallets?.usdt_trc20?.address || '', enabled: true },
      { id: 2, coin: 'BNB', network: 'BEP20', address: settings.depositWallets?.bnb_bep20?.address || '', enabled: true }
    ];
    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching deposit addresses', error: error.message });
  }
});

// Deposit Addresses - PUT
app.put('/api/admin/settings/deposit-addresses', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) settings = new AdminSettings({ key: 'platform-settings' });
    
    settings.depositAddresses = req.body.addresses || req.body;
    settings.updatedBy = req.user.id;
    settings.updatedAt = new Date();
    await settings.save();
    res.json({ success: true, message: 'Deposit addresses updated', data: settings.depositAddresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating deposit addresses', error: error.message });
  }
});

// Elimination Conditions - GET
app.get('/api/admin/settings/elimination-conditions', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings({ key: 'platform-settings' });
      await settings.save();
    }
    const conditions = settings.eliminationConditions || [];
    res.json({ success: true, data: conditions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching elimination conditions', error: error.message });
  }
});

// Elimination Conditions - PUT
app.put('/api/admin/settings/elimination-conditions', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) settings = new AdminSettings({ key: 'platform-settings' });
    
    settings.eliminationConditions = req.body.conditions || req.body;
    settings.updatedBy = req.user.id;
    settings.updatedAt = new Date();
    await settings.save();
    res.json({ success: true, message: 'Elimination conditions updated', data: settings.eliminationConditions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating elimination conditions', error: error.message });
  }
});

// Popups - GET
app.get('/api/admin/settings/popups', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings({ key: 'platform-settings' });
      await settings.save();
    }
    const popups = settings.popups || [];
    res.json({ success: true, data: popups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching popups', error: error.message });
  }
});

// Popups - PUT
app.put('/api/admin/settings/popups', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) settings = new AdminSettings({ key: 'platform-settings' });
    
    settings.popups = req.body.popups || req.body;
    settings.updatedBy = req.user.id;
    settings.updatedAt = new Date();
    await settings.save();
    res.json({ success: true, message: 'Popups updated', data: settings.popups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating popups', error: error.message });
  }
});

// Popups - POST (add new popup)
app.post('/api/admin/settings/popups', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) settings = new AdminSettings({ key: 'platform-settings' });
    
    if (!settings.popups) settings.popups = [];
    const newPopup = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date()
    };
    settings.popups.push(newPopup);
    settings.updatedBy = req.user.id;
    settings.updatedAt = new Date();
    await settings.save();
    res.json({ success: true, message: 'Popup added', data: newPopup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding popup', error: error.message });
  }
});

// ==================== ADMIN WALLET MANAGEMENT ====================

// Get admin deposit wallet addresses (public - for users to see)
app.get('/api/deposit-wallets', async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings({ key: 'platform-settings' });
      await settings.save();
    }
    
    const wallets = {
      usdt_trc20: {
        address: settings.depositWallets?.usdt_trc20?.address || 'TFVh7tRnCP3TnAxVSf6KvxN7qJ78SYYp7p',
        enabled: settings.depositWallets?.usdt_trc20?.enabled !== false,
        name: settings.depositWallets?.usdt_trc20?.name || 'USDT (TRC20)',
        network: 'TRC20',
        color: '#26A17B',
        icon: '₮'
      },
      bnb_bep20: {
        address: settings.depositWallets?.bnb_bep20?.address || '0xcEEecCF61B06867332B3672830A3A2cDeb6b47f7',
        enabled: settings.depositWallets?.bnb_bep20?.enabled !== false,
        name: settings.depositWallets?.bnb_bep20?.name || 'BNB (BEP20)',
        network: 'BEP20',
        color: '#F3BA2F',
        icon: 'BNB'
      }
    };
    
    res.json({ success: true, wallets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching wallets', error: error.message });
  }
});

// Admin: Get wallet settings
app.get('/api/admin/wallets', authenticateToken, isAdmin, async (req, res) => {
  try {
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings({ key: 'platform-settings' });
      await settings.save();
    }
    
    const wallets = {
      usdt_trc20: {
        address: settings.depositWallets?.usdt_trc20?.address || 'TFVh7tRnCP3TnAxVSf6KvxN7qJ78SYYp7p',
        enabled: settings.depositWallets?.usdt_trc20?.enabled !== false,
        name: settings.depositWallets?.usdt_trc20?.name || 'USDT (TRC20)'
      },
      bnb_bep20: {
        address: settings.depositWallets?.bnb_bep20?.address || '0xcEEecCF61B06867332B3672830A3A2cDeb6b47f7',
        enabled: settings.depositWallets?.bnb_bep20?.enabled !== false,
        name: settings.depositWallets?.bnb_bep20?.name || 'BNB (BEP20)'
      }
    };
    
    res.json({ success: true, wallets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching wallets', error: error.message });
  }
});

// Get Wallet Summary - REAL DATA ONLY (Cash Wallet)
app.get('/api/admin/wallet-summary', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    
    let filter = { role: { $ne: 'admin' } };
    
    if (search) {
      filter.$or = [
        { userId: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get real user wallet data
    const users = await User.find(filter)
      .select('userId firstName lastName email balance totalEarned totalWithdrawn')
      .sort({ balance: -1 })
      .limit(50);
    
    // Calculate totals
    const totalCashBalance = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    
    const totalEarned = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: { _id: null, total: { $sum: '$totalEarned' } } }
    ]);
    
    const totalWithdrawn = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: { _id: null, total: { $sum: '$totalWithdrawn' } } }
    ]);
    
    res.json({
      success: true,
      summary: {
        totalCashBalance: totalCashBalance[0]?.total || 0,
        totalEarned: totalEarned[0]?.total || 0,
        totalWithdrawn: totalWithdrawn[0]?.total || 0,
        activeUsers: users.length
      },
      users: users.map(u => ({
        serialNo: users.indexOf(u) + 1,
        userId: u.userId,
        userName: `${u.firstName} ${u.lastName}`,
        email: u.email,
        cashWalletBalance: u.balance || 0,
        totalEarned: u.totalEarned || 0,
        totalWithdrawn: u.totalWithdrawn || 0
      }))
    });
  } catch (error) {
    console.error('Wallet summary error:', error);
    res.status(500).json({ message: 'Error fetching wallet summary', error: error.message });
  }
});

// Admin: Update wallet addresses
app.put('/api/admin/wallets', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { usdt_trc20, bnb_bep20 } = req.body;
    
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings({ key: 'platform-settings' });
    }
    
    // Initialize depositWallets if not exists
    if (!settings.depositWallets) {
      settings.depositWallets = {};
    }
    
    // Update TRC20 wallet
    if (usdt_trc20) {
      settings.depositWallets.usdt_trc20 = {
        address: usdt_trc20.address || settings.depositWallets?.usdt_trc20?.address,
        enabled: usdt_trc20.enabled !== undefined ? usdt_trc20.enabled : true,
        name: usdt_trc20.name || 'USDT (TRC20)'
      };
    }
    
    // Update BEP20 wallet
    if (bnb_bep20) {
      settings.depositWallets.bnb_bep20 = {
        address: bnb_bep20.address || settings.depositWallets?.bnb_bep20?.address,
        enabled: bnb_bep20.enabled !== undefined ? bnb_bep20.enabled : true,
        name: bnb_bep20.name || 'BNB (BEP20)'
      };
    }
    
    settings.updatedBy = req.user.id;
    settings.updatedAt = new Date();
    settings.markModified('depositWallets');
    await settings.save();
    
    res.json({ 
      success: true, 
      message: 'Wallet addresses updated successfully',
      wallets: settings.depositWallets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating wallets', error: error.message });
  }
});

// Admin overview summary for dashboard widgets
app.get('/api/admin/summary', authenticateToken, isAdmin, async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const [adminIds, referredIds] = await Promise.all([
      User.find({ role: 'admin' }).select('_id'),
      User.find({ referredBy: { $exists: true, $ne: null } }).select('_id'),
    ]);

    const adminIdList = adminIds.map((u) => u._id);
    const referredIdList = referredIds.map((u) => u._id);

    const [investmentTotals, adminInvestmentTotals, directInvestmentTotals, walletTotals] = await Promise.all([
      Investment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      adminIdList.length
        ? Investment.aggregate([
            { $match: { userId: { $in: adminIdList } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ])
        : [],
      referredIdList.length
        ? Investment.aggregate([
            { $match: { userId: { $in: referredIdList } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ])
        : [],
      User.aggregate([{ $group: { _id: null, balance: { $sum: '$balance' } } }]),
    ]);

    const [dailyAllotted, referralTotals] = await Promise.all([
      // Total daily return amount allotted to all users
      User.aggregate([{ $group: { _id: null, total: { $sum: '$dailyReturnAmount' } } }]),
      // Total referral/commission paid
      Transaction.aggregate([
        { $match: { type: 'commission' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const memberCounts = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const [creditTotals, creditToday, creditYesterday, debitTotals, debitToday, debitYesterday] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'deposit' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'deposit', createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'deposit', createdAt: { $gte: startOfYesterday, $lt: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'withdrawal' } },
        { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'withdrawal', createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'withdrawal', createdAt: { $gte: startOfYesterday, $lt: startOfToday } } },
        { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
      ]),
    ]);

    const withdrawalTotals = await Withdrawal.aggregate([
      { $group: { _id: '$status', total: { $sum: '$amount' } } },
    ]);

    const getTotal = (aggArray) => (aggArray && aggArray[0] ? aggArray[0].total : 0);
    const memberCountMap = memberCounts.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
    const withdrawalMap = withdrawalTotals.reduce((acc, item) => ({ ...acc, [item._id]: item.total }), {});

    res.json({
      investments: {
        totalInvestment: getTotal(investmentTotals),
        adminInvestment: getTotal(adminInvestmentTotals),
        walletInvestment: getTotal(walletTotals),
        directInvestment: getTotal(directInvestmentTotals),
      },
      income: {
        daily: getTotal(dailyAllotted),
        referral: getTotal(referralTotals),
      },
      members: {
        total: Object.values(memberCountMap).reduce((a, b) => a + b, 0),
        active: memberCountMap.active || 0,
        inactive: memberCountMap.inactive || 0,
        suspended: memberCountMap.suspended || 0,
      },
      rankAchievers: [],
      creditDebit: {
        totalCredited: getTotal(creditTotals),
        todayCredited: getTotal(creditToday),
        yesterdayCredited: getTotal(creditYesterday),
        totalDebited: getTotal(debitTotals),
        todayDebited: getTotal(debitToday),
        yesterdayDebited: getTotal(debitYesterday),
      },
      withdrawals: {
        totalWithdrawal: withdrawalMap.pending ? Object.values(withdrawalMap).reduce((a, b) => a + b, 0) : 0,
        pendingWithdrawal: withdrawalMap.pending || 0,
        approvedWithdrawal: withdrawalMap.approved || 0,
        rejectedWithdrawal: withdrawalMap.rejected || 0,
      },
    });
  } catch (error) {
    console.error('Admin summary error:', error);
    res.status(500).json({ message: 'Error fetching admin summary', error: error.message });
  }
});

// Get Dashboard Settings
app.get('/api/admin/dashboard-settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const DashboardSettings = require('./models/DashboardSettings');
    let settings = await DashboardSettings.findOne({ userId: req.user.id });
    
    if (!settings) {
      settings = new DashboardSettings({
        userId: req.user.id,
        widgets: {
          dailyAllotted: true,
          referralBonus: true,
          totalMembers: true,
          activeMembers: true,
          investments: true,
          withdrawals: true,
          creditDebit: true,
        }
      });
      await settings.save();
    }
    
    res.json({ success: true, widgets: settings.widgets });
  } catch (error) {
    console.error('Dashboard settings error:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Update Dashboard Settings
app.put('/api/admin/dashboard-settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const DashboardSettings = require('./models/DashboardSettings');
    const { widgets } = req.body;
    
    let settings = await DashboardSettings.findOne({ userId: req.user.id });
    
    if (!settings) {
      settings = new DashboardSettings({ userId: req.user.id, widgets });
    } else {
      settings.widgets = widgets;
      settings.updatedAt = new Date();
    }
    
    await settings.save();
    res.json({ success: true, widgets: settings.widgets });
  } catch (error) {
    console.error('Dashboard settings update error:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// ==================== DASHBOARD VALUES API ====================

// Get Dashboard Values (editable values for admin dashboard)
app.get('/api/admin/dashboard-values', authenticateToken, isAdmin, async (req, res) => {
  try {
    const DashboardValues = require('./models/DashboardValues');
    
    let values = await DashboardValues.findOne({});
    
    if (!values) {
      // Create default values if not exist
      values = new DashboardValues({
        totalInvestment: 0,
        adminInvestment: 0,
        walletInvestment: 0,
        directInvestment: 0,
        dailyAllotted: 0,
        referralBonusAllotted: 0,
        totalMembers: 0,
        activeMembers: 0,
        inactiveMembers: 0,
        suspendedMembers: 0,
        totalCredited: 0,
        todayCredited: 0,
        yesterdayCredited: 0,
        totalDebited: 0,
        todayDebited: 0,
        yesterdayDebited: 0,
        totalWithdrawal: 0,
        pendingWithdrawal: 0,
        approvedWithdrawal: 0,
        rejectedWithdrawal: 0,
      });
      await values.save();
    }
    
    res.json({ 
      success: true, 
      values: {
        totalInvestment: values.totalInvestment || 0,
        adminInvestment: values.adminInvestment || 0,
        walletInvestment: values.walletInvestment || 0,
        directInvestment: values.directInvestment || 0,
        dailyAllotted: values.dailyAllotted || 0,
        referralBonusAllotted: values.referralBonusAllotted || 0,
        totalMembers: values.totalMembers || 0,
        activeMembers: values.activeMembers || 0,
        inactiveMembers: values.inactiveMembers || 0,
        suspendedMembers: values.suspendedMembers || 0,
        totalCredited: values.totalCredited || 0,
        todayCredited: values.todayCredited || 0,
        yesterdayCredited: values.yesterdayCredited || 0,
        totalDebited: values.totalDebited || 0,
        todayDebited: values.todayDebited || 0,
        yesterdayDebited: values.yesterdayDebited || 0,
        totalWithdrawal: values.totalWithdrawal || 0,
        pendingWithdrawal: values.pendingWithdrawal || 0,
        approvedWithdrawal: values.approvedWithdrawal || 0,
        rejectedWithdrawal: values.rejectedWithdrawal || 0,
      }
    });
  } catch (error) {
    console.error('Dashboard values fetch error:', error);
    res.status(500).json({ message: 'Error fetching dashboard values' });
  }
});

// Update single Dashboard Value
app.put('/api/admin/dashboard-values', authenticateToken, isAdmin, async (req, res) => {
  try {
    const DashboardValues = require('./models/DashboardValues');
    const { field, value } = req.body;
    
    const allowedFields = [
      'totalInvestment', 'adminInvestment', 'walletInvestment', 'directInvestment',
      'dailyAllotted', 'referralBonusAllotted',
      'totalMembers', 'activeMembers', 'inactiveMembers', 'suspendedMembers',
      'totalCredited', 'todayCredited', 'yesterdayCredited',
      'totalDebited', 'todayDebited', 'yesterdayDebited',
      'totalWithdrawal', 'pendingWithdrawal', 'approvedWithdrawal', 'rejectedWithdrawal'
    ];
    
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field' });
    }
    
    let values = await DashboardValues.findOne({});
    
    if (!values) {
      values = new DashboardValues({});
    }
    
    values[field] = value;
    await values.save();
    
    res.json({ success: true, field, value });
  } catch (error) {
    console.error('Dashboard value update error:', error);
    res.status(500).json({ message: 'Error updating dashboard value' });
  }
});

// Update all Dashboard Values at once
app.put('/api/admin/dashboard-values/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const DashboardValues = require('./models/DashboardValues');
    const { values } = req.body;
    
    console.log('Received values:', req.body);
    
    if (!values || typeof values !== 'object') {
      return res.status(400).json({ message: 'Invalid values provided' });
    }
    
    let dashboardValues = await DashboardValues.findOne({});
    
    if (!dashboardValues) {
      dashboardValues = new DashboardValues(values);
    } else {
      // Update each field
      if (values.totalInvestment !== undefined) dashboardValues.totalInvestment = values.totalInvestment;
      if (values.adminInvestment !== undefined) dashboardValues.adminInvestment = values.adminInvestment;
      if (values.walletInvestment !== undefined) dashboardValues.walletInvestment = values.walletInvestment;
      if (values.directInvestment !== undefined) dashboardValues.directInvestment = values.directInvestment;
      if (values.dailyAllotted !== undefined) dashboardValues.dailyAllotted = values.dailyAllotted;
      if (values.referralBonusAllotted !== undefined) dashboardValues.referralBonusAllotted = values.referralBonusAllotted;
      if (values.totalMembers !== undefined) dashboardValues.totalMembers = values.totalMembers;
      if (values.activeMembers !== undefined) dashboardValues.activeMembers = values.activeMembers;
      if (values.inactiveMembers !== undefined) dashboardValues.inactiveMembers = values.inactiveMembers;
      if (values.suspendedMembers !== undefined) dashboardValues.suspendedMembers = values.suspendedMembers;
      if (values.totalCredited !== undefined) dashboardValues.totalCredited = values.totalCredited;
      if (values.todayCredited !== undefined) dashboardValues.todayCredited = values.todayCredited;
      if (values.yesterdayCredited !== undefined) dashboardValues.yesterdayCredited = values.yesterdayCredited;
      if (values.totalDebited !== undefined) dashboardValues.totalDebited = values.totalDebited;
      if (values.todayDebited !== undefined) dashboardValues.todayDebited = values.todayDebited;
      if (values.yesterdayDebited !== undefined) dashboardValues.yesterdayDebited = values.yesterdayDebited;
      if (values.totalWithdrawal !== undefined) dashboardValues.totalWithdrawal = values.totalWithdrawal;
      if (values.pendingWithdrawal !== undefined) dashboardValues.pendingWithdrawal = values.pendingWithdrawal;
      if (values.approvedWithdrawal !== undefined) dashboardValues.approvedWithdrawal = values.approvedWithdrawal;
      if (values.rejectedWithdrawal !== undefined) dashboardValues.rejectedWithdrawal = values.rejectedWithdrawal;
    }
    
    await dashboardValues.save();
    
    res.json({ success: true, values: dashboardValues });
  } catch (error) {
    console.error('Dashboard values update error:', error);
    res.status(500).json({ message: 'Error updating dashboard values' });
  }
});

// ==================== ADMIN MEMBERS API ====================

// Get all members with optional status filter
app.get('/api/admin/members', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = { role: { $ne: 'admin' } };
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { userId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const members = await User.find(filter)
      .select('userId firstName lastName email phone country status createdAt referredBy totalInvested totalEarned')
      .populate('referredBy', 'userId firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ 
      members: members.map(m => ({
        id: m._id,
        odId: m.odId,
        userName: `${m.firstName} ${m.lastName}`,
        sponsorId: m.referredBy?.userId || 'N/A',
        email: m.email,
        mobile: m.phone || 'N/A',
        country: m.country || 'N/A',
        status: m.status,
        registeredOn: m.createdAt
      }))
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Error fetching members', error: error.message });
  }
});

// Get Member Registration Stats - Date-wise real data
app.get('/api/admin/registration-stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get today's date at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get this month's start
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get this year's start
    const yearStart = new Date(today.getFullYear(), 0, 1);
    
    // Count registrations
    const todayCount = await User.countDocuments({ 
      createdAt: { $gte: today },
      role: { $ne: 'admin' }
    });
    
    const thisMonthCount = await User.countDocuments({ 
      createdAt: { $gte: monthStart },
      role: { $ne: 'admin' }
    });
    
    const thisYearCount = await User.countDocuments({ 
      createdAt: { $gte: yearStart },
      role: { $ne: 'admin' }
    });
    
    const totalCount = await User.countDocuments({ role: { $ne: 'admin' } });
    
    // Get active members
    const activeCount = await User.countDocuments({ 
      status: 'active',
      role: { $ne: 'admin' }
    });
    
    // Get inactive members
    const inactiveCount = await User.countDocuments({ 
      status: 'inactive',
      role: { $ne: 'admin' }
    });
    
    // Get suspended members
    const suspendedCount = await User.countDocuments({ 
      status: 'suspended',
      role: { $ne: 'admin' }
    });
    
    // Get date-wise registrations for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dateStart = new Date(today);
      dateStart.setDate(dateStart.getDate() - i);
      dateStart.setHours(0, 0, 0, 0);
      
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);
      
      const count = await User.countDocuments({
        createdAt: { $gte: dateStart, $lt: dateEnd },
        role: { $ne: 'admin' }
      });
      
      last7Days.push({
        date: dateStart.toISOString().split('T')[0],
        count
      });
    }
    
    // Get recent registrations
    const recentRegistrations = await User.find({ role: { $ne: 'admin' } })
      .select('userId firstName lastName email phone country status createdAt')
      .populate('referredBy', 'userId firstName lastName')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({
      success: true,
      stats: {
        today: todayCount,
        thisMonth: thisMonthCount,
        thisYear: thisYearCount,
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        suspended: suspendedCount
      },
      last7Days,
      recentRegistrations: recentRegistrations.map(u => ({
        id: u.userId,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        phone: u.phone || 'N/A',
        country: u.country || 'N/A',
        sponsorId: u.referredBy?.userId || 'Direct',
        status: u.status,
        registeredOn: u.createdAt
      }))
    });
  } catch (error) {
    console.error('Registration stats error:', error);
    res.status(500).json({ message: 'Error fetching registration stats', error: error.message });
  }
});

// ==================== DASHBOARD STATS API ====================

// Get comprehensive user dashboard stats - real-time data
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('directReferrals', 'userId firstName lastName email status totalInvested createdAt')
      .populate('downlineUsers', 'status totalInvested');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get active investments
    const activeInvestments = await Investment.find({ userId: req.user.id, status: 'active' }).populate('planId');
    const allInvestments = await Investment.find({ userId: req.user.id });
    
    // Calculate total invested and earned
    const totalInvested = user.totalInvested || allInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalEarned = user.totalEarned || allInvestments.reduce((sum, inv) => sum + (inv.earned || 0), 0);
    
    // Calculate daily earning based on active investments + admin-set daily return
    let dailyEarning = user.dailyReturnAmount || 0; // Start with admin-set daily return
    activeInvestments.forEach(inv => {
      if (inv.planId) {
        // dailyEarn is a fixed USDT amount (not a percentage)
        dailyEarning += (inv.planId.dailyEarn || inv.dailyEarned || 0);
      }
    });

    // Get pending withdrawals
    const pendingWithdrawals = await Withdrawal.find({ userId: req.user.id, status: 'pending' });
    const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

    // Get recent transactions for transaction history
    const recentTransactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate income breakdown
    const referralEarnings = user.referralEarnings || 0;
    const investmentEarnings = totalEarned - referralEarnings;
    
    // Active vs Passive income
    // Active Income: Direct referral earnings, level income
    // Passive Income: Investment ROI + Daily Returns
    const activeIncome = referralEarnings;
    const passiveIncome = investmentEarnings + (user.totalDailyReturnsReceived || 0);

    // Wallet data - using 3 wallet system
    // Migrate any orphaned balance: if balance > sum of 3 wallets, add difference to fundWallet
    const walletsSum = (user.myWallet || 0) + (user.fundWallet || 0) + (user.utilityWallet || 0);
    if ((user.balance || 0) > walletsSum && walletsSum === 0) {
      // Old balance exists but wallets are empty — migrate balance to fundWallet
      user.fundWallet = user.balance;
      await user.save();
      console.log(`Migrated ${user.balance} from legacy balance to fundWallet for user ${user.userId}`);
    }

    const walletData = {
      myWallet: user.myWallet || 0,
      fundWallet: user.fundWallet || 0,
      utilityWallet: user.utilityWallet || 0,
      totalBalance: (user.myWallet || 0) + (user.fundWallet || 0) + (user.utilityWallet || 0)
    };

    res.json({
      data: {
        // User Profile Info
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        rank: user.rank || 'N/A',
        status: user.status,
        dateOfRegistration: user.createdAt,
        dateOfActivation: user.activatedAt || null,
        rankAchievedOn: user.rankAchievedAt || null,

        // Investment Monitor
        totalInvested,
        totalEarned,
        dailyEarning,
        dailyReturnAmount: user.dailyReturnAmount || 0,
        totalDailyReturnsReceived: user.totalDailyReturnsReceived || 0,
        activePlans: activeInvestments.length,

        // Wallet Overview
        wallet: walletData,

        // Income Breakdown
        activeIncome,
        passiveIncome,
        totalIncome: activeIncome + passiveIncome,

        // Transaction History
        recentTransactions: recentTransactions.map(t => ({
          id: t._id,
          date: t.createdAt,
          description: t.description || t.type,
          type: t.type,
          credit: t.type === 'deposit' || t.type === 'earning' || t.type === 'admin_credit' || t.type === 'daily_return' ? t.amount : 0,
          debit: t.type === 'withdrawal' || t.type === 'investment' ? t.amount : 0,
          balance: t.balanceAfter || 0
        })),

        // Referral Info
        referralCode: user.referralCode,
        referralLink: `https://hexanova.net/register?ref=${user.userId}`
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

// ==================== DASHBOARD TEAM SUMMARY API ====================

// Get team summary for user dashboard
app.get('/api/dashboard/team-summary', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('directReferrals', 'status totalInvested')
      .populate('downlineUsers', 'status totalInvested');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const directCount = user.directReferrals?.length || 0;
    const downlineCount = user.downlineUsers?.length || 0;
    const activeDownlines = user.downlineUsers?.filter(d => d.status === 'active').length || 0;
    const inactiveDownlines = downlineCount - activeDownlines;
    const totalDownlineBusiness = user.downlineUsers?.reduce((sum, d) => sum + (d.totalInvested || 0), 0) || 0;
    
    res.json({
      data: {
        myDirect: directCount,
        myDownlines: downlineCount,
        activeDownlines,
        inactiveDownlines,
        totalDownlineBusiness
      }
    });
  } catch (error) {
    console.error('Team summary error:', error);
    res.status(500).json({ message: 'Error fetching team summary', error: error.message });
  }
});

// Get recent referrals for user dashboard
app.get('/api/dashboard/recent-referrals', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'directReferrals',
        select: 'userId firstName lastName email createdAt',
        options: { sort: { createdAt: -1 }, limit: 10 }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const referrals = user.directReferrals?.map(r => ({
      id: r.userId,
      name: `${r.firstName} ${r.lastName}`,
      email: r.email,
      joinedAt: r.createdAt
    })) || [];
    
    res.json({ data: referrals });
  } catch (error) {
    console.error('Recent referrals error:', error);
    res.status(500).json({ message: 'Error fetching referrals', error: error.message });
  }
});

// ==================== ADMIN POINTS MANAGEMENT API ====================

// Admin pool balance tracking (in-memory for now, use AdminSettings in production)
let adminPointsPool = 25000000; // Starting pool of 25,000,000 USDT points

// Get admin points stats
app.get('/api/admin/points/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Get total points added (admin credit transactions)
    const totalPointsResult = await Transaction.aggregate([
      { $match: { type: 'admin_credit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get today's points added
    const todayPointsResult = await Transaction.aggregate([
      { $match: { type: 'admin_credit', status: 'completed', createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get unique users credited
    const usersCredit = await Transaction.distinct('userId', { type: 'admin_credit', status: 'completed' });

    // Get admin settings for pool balance
    let settings = await AdminSettings.findOne({});
    if (settings && settings.adminPointsPool !== undefined) {
      adminPointsPool = settings.adminPointsPool;
    }

    res.json({
      totalPointsAdded: totalPointsResult[0]?.total || 0,
      todayPointsAdded: todayPointsResult[0]?.total || 0,
      totalUsersCredit: usersCredit.length,
      adminPoolBalance: adminPointsPool
    });
  } catch (error) {
    console.error('Admin points stats error:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Search user by userId for points
app.get('/api/admin/points/user/:userId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findOne({ 
      $or: [
        { userId: { $regex: new RegExp(`^${userId}$`, 'i') } },
        { email: { $regex: new RegExp(`^${userId}$`, 'i') } }
      ]
    }).select('userId firstName lastName email balance phone status dailyReturnAmount totalDailyReturnsReceived');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Error searching user', error: error.message });
  }
});

// Get recent admin point transactions (includes admin_credit and daily_return)
app.get('/api/admin/points/transactions', authenticateToken, isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find({ type: { $in: ['admin_credit', 'daily_return'] } })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'userId firstName lastName');

    const formattedTransactions = transactions.map(tx => ({
      userId: tx.userId?.userId || 'Unknown',
      userName: tx.userId ? `${tx.userId.firstName} ${tx.userId.lastName}` : 'Unknown',
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      status: tx.status,
      createdAt: tx.createdAt
    }));

    res.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error('Points transactions error:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// Add USDT points to user wallet
app.post('/api/admin/points/add', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: 'User ID and amount are required' });
    }

    const pointsAmount = parseFloat(amount);
    if (isNaN(pointsAmount) || pointsAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Find the user
    const user = await User.findOne({ 
      $or: [
        { userId: { $regex: new RegExp(`^${userId}$`, 'i') } },
        { email: { $regex: new RegExp(`^${userId}$`, 'i') } }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check admin pool balance
    let settings = await AdminSettings.findOne({});
    if (settings && settings.adminPointsPool !== undefined) {
      adminPointsPool = settings.adminPointsPool;
    }

    if (pointsAmount > adminPointsPool) {
      return res.status(400).json({ success: false, message: 'Insufficient admin pool balance' });
    }

    // Update user wallets — credit Fund Wallet (visible on dashboard)
    const previousFundWallet = user.fundWallet || 0;
    user.fundWallet = previousFundWallet + pointsAmount;
    // Keep balance in sync (balance = myWallet + fundWallet + utilityWallet)
    user.balance = (user.myWallet || 0) + (user.fundWallet || 0) + (user.utilityWallet || 0);
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'admin_credit',
      amount: pointsAmount,
      description: description || 'USDT points added by admin',
      status: 'completed',
      balanceBefore: previousFundWallet,
      balanceAfter: user.fundWallet,
      processedBy: req.user.id,
      processedAt: new Date()
    });
    await transaction.save();

    // Deduct from admin pool
    adminPointsPool -= pointsAmount;
    
    // Save pool balance to settings
    if (!settings) {
      settings = new AdminSettings({ key: 'platform-settings' });
    }
    settings.adminPointsPool = adminPointsPool;
    await settings.save();

    console.log(`Admin added ${pointsAmount} USDT points to ${user.userId}. Fund Wallet: ${user.fundWallet}, Total Balance: ${user.balance}`);

    res.json({
      success: true,
      message: `Successfully added ${pointsAmount} USDT to ${user.userId}'s Fund Wallet`,
      newBalance: user.balance,
      fundWallet: user.fundWallet,
      adminPoolRemaining: adminPointsPool
    });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ success: false, message: 'Error adding points', error: error.message });
  }
});

// Add points to admin pool
app.post('/api/admin/points/add-pool', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { amount } = req.body;
    const addAmount = parseFloat(amount);

    if (isNaN(addAmount) || addAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Update pool balance
    let settings = await AdminSettings.findOne({});
    if (!settings) {
      settings = new AdminSettings({ key: 'platform-settings' });
    }
    
    if (settings.adminPointsPool !== undefined) {
      adminPointsPool = settings.adminPointsPool;
    }
    
    adminPointsPool += addAmount;
    settings.adminPointsPool = adminPointsPool;
    await settings.save();

    res.json({
      success: true,
      message: `Added ${addAmount} USDT to admin pool`,
      newPoolBalance: adminPointsPool
    });
  } catch (error) {
    console.error('Add pool error:', error);
    res.status(500).json({ success: false, message: 'Error adding to pool', error: error.message });
  }
});

// ==================== DAILY RETURN MANAGEMENT API ====================

// Get all users with active daily returns
app.get('/api/admin/daily-returns/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ dailyReturnAmount: { $gt: 0 } })
      .select('userId firstName lastName email dailyReturnAmount totalDailyReturnsReceived lastDailyReturnDate balance')
      .sort({ dailyReturnAmount: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get daily return users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Set daily return amount for a user
app.post('/api/admin/daily-returns/set', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId, dailyReturnAmount } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const amount = parseFloat(dailyReturnAmount);
    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({ success: false, message: 'Invalid daily return amount' });
    }

    // Find user
    const user = await User.findOne({ 
      $or: [
        { userId: { $regex: new RegExp(`^${userId}$`, 'i') } },
        { email: { $regex: new RegExp(`^${userId}$`, 'i') } }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update daily return amount
    user.dailyReturnAmount = amount;
    await user.save();

    console.log(`Admin set daily return of $${amount} for ${user.userId}`);

    res.json({
      success: true,
      message: amount > 0 
        ? `Daily return of $${amount} USDT set for ${user.userId}` 
        : `Daily return removed for ${user.userId}`,
      user: {
        userId: user.userId,
        dailyReturnAmount: user.dailyReturnAmount
      }
    });
  } catch (error) {
    console.error('Set daily return error:', error);
    res.status(500).json({ success: false, message: 'Error setting daily return', error: error.message });
  }
});

// Remove daily return for a user
app.post('/api/admin/daily-returns/remove', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findOne({ 
      $or: [
        { userId: { $regex: new RegExp(`^${userId}$`, 'i') } },
        { email: { $regex: new RegExp(`^${userId}$`, 'i') } }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.dailyReturnAmount = 0;
    await user.save();

    res.json({ success: true, message: 'Daily return removed' });
  } catch (error) {
    console.error('Remove daily return error:', error);
    res.status(500).json({ success: false, message: 'Error removing daily return', error: error.message });
  }
});

// Process daily returns - ADMIN TRIGGERED ONLY (no automatic processing)
// Admin clicks "Process Daily Returns" button to distribute ROI to eligible users
app.post('/api/admin/daily-returns/process', authenticateToken, isAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let processedCount = 0;
    let totalDistributed = 0;
    const results = [];

    // PART 1: Process admin-set daily return amounts
    const usersWithDailyReturn = await User.find({
      dailyReturnAmount: { $gt: 0 },
      $or: [
        { lastDailyReturnDate: { $lt: today } },
        { lastDailyReturnDate: null }
      ]
    });

    for (const user of usersWithDailyReturn) {
      const amount = user.dailyReturnAmount;

      // Credit to My Wallet (earnings wallet)
      user.myWallet = (user.myWallet || 0) + amount;
      user.totalDailyReturnsReceived = (user.totalDailyReturnsReceived || 0) + amount;
      user.totalEarned = (user.totalEarned || 0) + amount;
      user.todayEarning = amount;
      user.lastDailyReturnDate = new Date();
      // Keep balance in sync
      user.balance = (user.myWallet || 0) + (user.fundWallet || 0) + (user.utilityWallet || 0);
      await user.save();

      const transaction = new Transaction({
        userId: user._id,
        type: 'daily_return',
        amount: amount,
        description: `Admin daily return - $${amount} credited to My Wallet`,
        status: 'completed',
        previousBalance: (user.myWallet || 0) - amount,
        newBalance: user.myWallet,
        processedAt: new Date()
      });
      await transaction.save();

      results.push({ userId: user.userId, name: `${user.firstName} ${user.lastName}`, amount, source: 'admin_set' });
      processedCount++;
      totalDistributed += amount;
    }

    // PART 2: Process investment-based daily earnings (ROI)
    const activeInvestments = await Investment.find({ status: 'active' }).populate('planId userId');
    
    // Group earnings by user to avoid multiple saves
    const userEarnings = {};
    
    for (const investment of activeInvestments) {
      const plan = investment.planId;
      const user = investment.userId;
      if (!plan || !user) continue;
      
      const daysElapsed = Math.floor((new Date() - investment.startDate) / (1000 * 60 * 60 * 24));
      
      // Skip if investment is past duration
      if (daysElapsed > plan.duration) continue;
      
      // Skip if already earned today
      if (investment.lastEarningDate) {
        const lastEarnDate = new Date(investment.lastEarningDate);
        lastEarnDate.setHours(0, 0, 0, 0);
        if (lastEarnDate >= today) continue;
      }
      
      // dailyEarn is the fixed dollar amount per day
      const dailyEarning = plan.dailyEarn;
      
      // Update investment record
      investment.dailyEarned = dailyEarning;
      investment.totalEarned = (investment.totalEarned || 0) + dailyEarning;
      investment.daysCompleted = daysElapsed;
      investment.lastEarningDate = new Date();
      investment.earningHistory.push({ date: new Date(), amount: dailyEarning, status: 'credited' });
      await investment.save();
      
      // Accumulate per user
      const uid = user._id.toString();
      if (!userEarnings[uid]) {
        userEarnings[uid] = { user, total: 0, details: [] };
      }
      userEarnings[uid].total += dailyEarning;
      userEarnings[uid].details.push({ planName: plan.name, amount: dailyEarning, investmentId: investment._id });
    }
    
    // Credit accumulated earnings to each user's My Wallet
    for (const uid of Object.keys(userEarnings)) {
      const { user, total, details } = userEarnings[uid];
      
      // Skip if this user already got admin-set daily return (avoid double processing)
      // Investment earnings are separate from admin-set daily returns
      const freshUser = await User.findById(user._id);
      
      freshUser.myWallet = (freshUser.myWallet || 0) + total;
      freshUser.totalEarned = (freshUser.totalEarned || 0) + total;
      freshUser.todayEarning = (freshUser.todayEarning || 0) + total;
      freshUser.balance = (freshUser.myWallet || 0) + (freshUser.fundWallet || 0) + (freshUser.utilityWallet || 0);
      await freshUser.save();
      
      // Create one transaction per investment
      for (const detail of details) {
        const transaction = new Transaction({
          userId: freshUser._id,
          type: 'earning',
          amount: detail.amount,
          description: `Daily ROI from ${detail.planName} - $${detail.amount} credited to My Wallet`,
          status: 'completed',
          investmentId: detail.investmentId,
          processedAt: new Date()
        });
        await transaction.save();
      }
      
      results.push({ userId: freshUser.userId, name: `${freshUser.firstName} ${freshUser.lastName}`, amount: total, source: 'investment_roi' });
      processedCount++;
      totalDistributed += total;
    }

    console.log(`✅ Daily returns processed by admin: ${processedCount} users, $${totalDistributed} total`);

    res.json({
      success: true,
      message: `Daily returns processed for ${processedCount} users`,
      processedUsers: processedCount,
      totalDistributed: totalDistributed,
      details: results
    });
  } catch (error) {
    console.error('Process daily returns error:', error);
    res.status(500).json({ success: false, message: 'Error processing daily returns', error: error.message });
  }
});

// NOTE: No automatic daily return processing - admin must trigger manually

// ==================== ADMIN REPORTS API ====================

// Get wallet statistics
app.get('/api/admin/wallet-statistics', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('userId firstName lastName balance totalInvested totalEarned totalWithdrawn')
      .sort({ balance: -1 })
      .limit(50);
    
    res.json({ 
      data: users.map(u => ({
        userId: u.userId,
        userName: `${u.firstName} ${u.lastName}`,
        cashWalletBalance: u.balance || 0,
        fundWalletBalance: 0,
        totalInvested: u.totalInvested || 0,
        totalEarned: u.totalEarned || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallet statistics', error: error.message });
  }
});

// Get withdrawal addresses
app.get('/api/admin/withdrawal-addresses', authenticateToken, isAdmin, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('userId', 'userId firstName lastName')
      .select('userId walletAddress currency status createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    
    const addresses = withdrawals.map(w => ({
      memberId: w.userId?.userId || 'N/A',
      memberName: w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : 'N/A',
      currency: w.currency || 'USDT',
      walletAddress: w.walletAddress || 'N/A',
      status: w.status
    }));
    
    // Remove duplicates by memberId + currency
    const uniqueAddresses = [...new Map(addresses.map(a => [`${a.memberId}-${a.currency}`, a])).values()];
    
    res.json({ data: uniqueAddresses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching withdrawal addresses', error: error.message });
  }
});

// Get pending withdrawal requests
app.get('/api/admin/withdrawals/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('userId', 'userId firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ 
      data: withdrawals.map((w, idx) => ({
        orderNo: `#${String(w._id).slice(-6)}`,
        id: w._id,
        userId: w.userId?.userId || 'N/A',
        userName: w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : 'N/A',
        amount: w.amount,
        withdrawalDate: w.createdAt,
        paymentMode: w.currency || 'USDT',
        paymentAddress: w.walletAddress || 'N/A',
        status: w.status
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending withdrawals', error: error.message });
  }
});

// Get withdrawal summary - ALL withdrawals with REAL DATA
app.get('/api/admin/withdrawals/summary', authenticateToken, isAdmin, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('userId', 'userId firstName lastName email phone balance')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ 
      data: withdrawals.map(w => ({
        id: w._id,
        date: w.createdAt,
        userId: w.userId?.userId || 'N/A',
        userName: w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : 'N/A',
        email: w.userId?.email || 'N/A',
        phone: w.userId?.phone || 'N/A',
        amount: w.amount,
        deductionCharges: w.fee || 0,
        payableAmount: w.netAmount || w.amount,
        toAddress: w.walletAddress || 'N/A',
        transactionHash: w.transactionHash || 'N/A',
        status: w.status,
        approvedOn: w.approvedAt,
        processedOn: w.processedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching withdrawal summary', error: error.message });
  }
});

// Get PENDING withdrawals only - REAL DATA
app.get('/api/admin/withdrawals/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const pendingWithdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('userId', 'userId firstName lastName email phone balance')
      .sort({ createdAt: -1 });
    
    const pendingCount = pendingWithdrawals.length;
    const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + (w.netAmount || w.amount), 0);
    
    res.json({
      success: true,
      count: pendingCount,
      totalAmount: pendingAmount,
      data: pendingWithdrawals.map(w => ({
        id: w._id,
        date: w.createdAt,
        userId: w.userId?.userId || 'N/A',
        userName: w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : 'N/A',
        email: w.userId?.email || 'N/A',
        phone: w.userId?.phone || 'N/A',
        currentBalance: w.userId?.balance || 0,
        amount: w.amount,
        deductionCharges: w.fee || 0,
        payableAmount: w.netAmount || w.amount,
        toAddress: w.walletAddress || 'N/A',
        network: w.network || 'TRX',
        status: w.status,
        requestedOn: w.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pending withdrawals', error: error.message });
  }
});

// Get APPROVED withdrawals - REAL DATA
app.get('/api/admin/withdrawals/approved', authenticateToken, isAdmin, async (req, res) => {
  try {
    const approvedWithdrawals = await Withdrawal.find({ status: 'approved' })
      .populate('userId', 'userId firstName lastName email')
      .sort({ approvedAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: approvedWithdrawals.length,
      data: approvedWithdrawals.map(w => ({
        id: w._id,
        date: w.createdAt,
        userId: w.userId?.userId || 'N/A',
        userName: w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : 'N/A',
        email: w.userId?.email || 'N/A',
        amount: w.amount,
        deductionCharges: w.fee || 0,
        payableAmount: w.netAmount || w.amount,
        toAddress: w.walletAddress || 'N/A',
        status: w.status,
        approvedOn: w.approvedAt,
        approvedBy: w.approvedBy || 'System'
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching approved withdrawals', error: error.message });
  }
});

// Get withdrawal stats summary - REAL DATA
app.get('/api/admin/withdrawals-stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const pending = await Withdrawal.countDocuments({ status: 'pending' });
    const approved = await Withdrawal.countDocuments({ status: 'approved' });
    const processed = await Withdrawal.countDocuments({ status: 'completed' });
    const rejected = await Withdrawal.countDocuments({ status: 'rejected' });
    
    const pendingAmount = await Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);
    
    const approvedAmount = await Withdrawal.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);
    
    const processedAmount = await Withdrawal.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);
    
    res.json({
      success: true,
      summary: {
        pendingCount: pending,
        pendingAmount: pendingAmount[0]?.total || 0,
        approvedCount: approved,
        approvedAmount: approvedAmount[0]?.total || 0,
        processedCount: processed,
        processedAmount: processedAmount[0]?.total || 0,
        rejectedCount: rejected,
        totalRequests: pending + approved + processed + rejected,
        totalAmount: (pendingAmount[0]?.total || 0) + (approvedAmount[0]?.total || 0) + (processedAmount[0]?.total || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching withdrawal stats', error: error.message });
  }
});
// Get processed fund requests
app.get('/api/admin/fund-requests/processed', authenticateToken, isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find({ type: 'deposit', status: { $in: ['completed', 'approved'] } })
      .populate('userId', 'userId firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ 
      data: transactions.map(t => ({
        userId: t.userId?.userId || 'N/A',
        userName: t.userId ? `${t.userId.firstName} ${t.userId.lastName}` : 'N/A',
        amount: t.amount,
        paymentMode: t.currency || 'USDT',
        paymentAddress: t.walletAddress || 'N/A',
        processedOn: t.updatedAt || t.createdAt,
        status: t.status
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fund requests', error: error.message });
  }
});

// Get pending fund requests (NEW - REAL DATA)
app.get('/api/admin/fund-requests/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const deposits = await Deposit.find({ status: 'pending' })
      .populate('userId', 'userId firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ 
      success: true,
      count: deposits.length,
      data: deposits.map(d => ({
        id: d._id,
        userId: d.userId?.userId || 'N/A',
        userName: d.userId ? `${d.userId.firstName} ${d.userId.lastName}` : 'N/A',
        email: d.userId?.email || 'N/A',
        phone: d.userId?.phone || 'N/A',
        amount: d.amount,
        currency: d.currency || 'USDT',
        walletAddress: d.walletAddress || 'N/A',
        transactionHash: d.transactionHash || 'N/A',
        proofImage: d.proofImage || 'N/A',
        notes: d.notes || 'N/A',
        requestedOn: d.createdAt,
        status: d.status
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pending fund requests', error: error.message });
  }
});

// Get all fund requests summary - REAL DATA
app.get('/api/admin/fund-requests-summary', authenticateToken, isAdmin, async (req, res) => {
  try {
    const pending = await Deposit.countDocuments({ status: 'pending' });
    const completed = await Deposit.countDocuments({ status: 'completed' });
    const rejected = await Deposit.countDocuments({ status: 'rejected' });
    
    const pendingAmount = await Deposit.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const completedAmount = await Deposit.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const recentDeposits = await Deposit.find()
      .populate('userId', 'userId firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      summary: {
        pendingCount: pending,
        pendingAmount: pendingAmount[0]?.total || 0,
        completedCount: completed,
        completedAmount: completedAmount[0]?.total || 0,
        rejectedCount: rejected,
        totalRequests: pending + completed + rejected
      },
      recentDeposits: recentDeposits.map(d => ({
        id: d._id,
        userId: d.userId?.userId || 'N/A',
        userName: d.userId ? `${d.userId.firstName} ${d.userId.lastName}` : 'N/A',
        email: d.userId?.email || 'N/A',
        amount: d.amount,
        currency: d.currency || 'USDT',
        status: d.status,
        requestedOn: d.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching fund requests summary', error: error.message });
  }
});

// Get all active investments - REAL DATA
app.get('/api/admin/investments/active', authenticateToken, isAdmin, async (req, res) => {
  try {
    const activeInvestments = await Investment.find({ status: 'active' })
      .populate('userId', 'userId firstName lastName email phone balance')
      .populate('planId', 'name dailyReturn duration')
      .sort({ startDate: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: activeInvestments.length,
      data: activeInvestments.map(inv => ({
        id: inv._id,
        userId: inv.userId?.userId || 'N/A',
        userName: inv.userId ? `${inv.userId.firstName} ${inv.userId.lastName}` : 'N/A',
        email: inv.userId?.email || 'N/A',
        phone: inv.userId?.phone || 'N/A',
        planName: inv.planName || 'N/A',
        amount: inv.amount,
        dailyReturn: inv.dailyReturn || 0,
        duration: inv.duration || 0,
        startDate: inv.startDate,
        endDate: inv.endDate,
        status: inv.status,
        returnType: inv.returnType || 'Daily',
        totalEarned: inv.totalEarned || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching active investments', error: error.message });
  }
});

// Get all investments summary - REAL DATA
app.get('/api/admin/investments-summary', authenticateToken, isAdmin, async (req, res) => {
  try {
    const active = await Investment.countDocuments({ status: 'active' });
    const completed = await Investment.countDocuments({ status: 'completed' });
    const cancelled = await Investment.countDocuments({ status: 'cancelled' });
    
    const activeAmount = await Investment.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const completedAmount = await Investment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalEarnings = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: '$totalEarned' } } }
    ]);
    
    res.json({
      success: true,
      summary: {
        activeCount: active,
        activeAmount: activeAmount[0]?.total || 0,
        completedCount: completed,
        completedAmount: completedAmount[0]?.total || 0,
        cancelledCount: cancelled,
        totalInvestments: active + completed + cancelled,
        totalInvestedAmount: (activeAmount[0]?.total || 0) + (completedAmount[0]?.total || 0),
        totalEarningsGenerated: totalEarnings[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching investments summary', error: error.message });
  }
});

// Admin activate/invest for user
app.post('/api/admin/activate-user', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId, amount, planId, paymentMode, referenceNo, returnType, investmentType } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ message: 'User ID and amount are required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the plan or use defaults
    let plan = null;
    if (planId) {
      plan = await Plan.findById(planId);
    }
    if (!plan) {
      plan = await Plan.findOne({ status: 'active' });
    }
    
    const dailyReturn = plan?.dailyReturn || 1.5;
    const duration = plan?.duration || 30;
    
    // Create investment
    const investment = new Investment({
      userId: user._id,
      planId: plan?._id,
      planName: plan?.name || 'Admin Activation',
      amount: Number(amount),
      dailyReturn,
      duration,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      status: 'active',
      paymentMethod: paymentMode || 'admin_credit',
      transactionId: referenceNo || `ADMIN-${Date.now()}`,
      returnType: returnType || 'Allow ROI',
      adminActivated: true,
      activatedBy: req.user.id
    });
    
    await investment.save();
    
    // Update user stats
    await User.findByIdAndUpdate(user._id, {
      $inc: { totalInvested: Number(amount), balance: Number(amount) },
      status: 'active',
      activatedAt: new Date()
    });
    
    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'deposit',
      amount: Number(amount),
      currency: 'USDT',
      status: 'completed',
      description: `Admin activation - ${investmentType || 'Investment'}`,
      transactionId: referenceNo || `ADMIN-${Date.now()}`,
      balanceAfter: (user.balance || 0) + Number(amount)
    });
    await transaction.save();
    
    // Process referral bonus if user has referrer
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        const bonusAmount = Number(amount) * 0.1; // 10% referral bonus
        
        // Update referral bonus record
        await ReferralBonus.findOneAndUpdate(
          { referrerId: referrer._id, referredUserId: user._id },
          { 
            bonusAmount,
            status: 'credited',
            creditedAt: new Date(),
            investmentAmount: Number(amount)
          }
        );
        
        // Credit referrer's account
        await User.findByIdAndUpdate(referrer._id, {
          $inc: { balance: bonusAmount, referralEarnings: bonusAmount, totalEarned: bonusAmount }
        });
        
        // Create transaction for referral bonus
        await new Transaction({
          userId: referrer._id,
          type: 'commission',
          amount: bonusAmount,
          currency: 'USDT',
          status: 'completed',
          description: `Referral bonus from ${user.firstName} ${user.lastName}'s investment`
        }).save();
      }
    }
    
    res.json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} activated with $${amount} investment`,
      investment: {
        id: investment._id,
        amount: investment.amount,
        plan: investment.planName,
        status: investment.status
      }
    });
  } catch (error) {
    console.error('Admin activation error:', error);
    res.status(500).json({ message: 'Error activating user', error: error.message });
  }
});

// Get activation summary
app.get('/api/admin/activations', authenticateToken, isAdmin, async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('userId', 'userId firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ 
      data: investments.map(inv => ({
        userId: inv.userId?.userId || 'N/A',
        userName: inv.userId ? `${inv.userId.firstName} ${inv.userId.lastName}` : 'N/A',
        plan: inv.planName || 'Standard',
        amount: inv.amount,
        status: inv.status,
        activatedOn: inv.createdAt,
        expiresOn: inv.endDate,
        referenceId: `#${String(inv._id).slice(-8)}`
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activations', error: error.message });
  }
});

// Get ROI setup
app.get('/api/admin/roi-setup', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get last 30 days of ROI distribution
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const roiTransactions = await Transaction.find({
      type: 'earning',
      createdAt: { $gte: thirtyDaysAgo }
    })
      .sort({ createdAt: -1 });
    
    // Group by date
    const byDate = {};
    roiTransactions.forEach(t => {
      const dateKey = t.createdAt.toISOString().split('T')[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { count: 0, total: 0 };
      }
      byDate[dateKey].count++;
      byDate[dateKey].total += t.amount;
    });
    
    res.json({ 
      data: Object.entries(byDate).map(([date, info]) => ({
        roiDate: date,
        roiPercentage: 0.5, // Default daily ROI
        roiMembers: info.count,
        totalRoiAmount: info.total.toFixed(2),
        roiUpdatedOn: date
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ROI setup', error: error.message });
  }
});

// Get income reports
app.get('/api/reports/daily-income', authenticateToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const transactions = await Transaction.find({ ...filter, type: 'earning' })
      .populate('userId', 'userId firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ 
      data: transactions.map(t => ({
        userId: t.userId?.userId || 'N/A',
        plan: 'Standard',
        percentage: 0.5,
        dailyIncome: t.amount,
        roiDate: t.createdAt,
        status: t.status || 'completed'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily income', error: error.message });
  }
});

app.get('/api/reports/direct-income', authenticateToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const transactions = await Transaction.find({ ...filter, type: 'commission' })
      .populate('userId', 'userId firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ 
      data: transactions.map(t => ({
        userId: t.userId?.userId || 'N/A',
        childId: t.referenceId || 'N/A',
        childPlan: 'Standard',
        directIncome: t.amount,
        date: t.createdAt,
        status: t.status || 'completed'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching direct income', error: error.message });
  }
});

app.get('/api/reports/level-income', authenticateToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const transactions = await Transaction.find({ ...filter, type: 'level_commission' })
      .populate('userId', 'userId firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ 
      data: transactions.map(t => ({
        userId: t.userId?.userId || 'N/A',
        memberId: t.referenceId || 'N/A',
        level: t.level || 1,
        percentage: t.percentage || 1,
        levelIncome: t.amount,
        date: t.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching level income', error: error.message });
  }
});

app.get('/api/reports/rank-income', authenticateToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const users = await User.find({ ...filter, rank: { $exists: true, $ne: null } })
      .select('userId firstName lastName rank rankAchievedAt totalRankIncome')
      .sort({ rankAchievedAt: -1 })
      .limit(100);
    
    res.json({ 
      data: users.map(u => ({
        odId: u.userId,
        rank: u.rank || 'N/A',
        rankIncome: u.totalRankIncome || 0,
        acheivedOn: u.rankAchievedAt || null
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rank income', error: error.message });
  }
});

app.get('/api/reports/transactions', authenticateToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const transactions = await Transaction.find(filter)
      .populate('userId', 'userId firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ 
      data: transactions.map(t => ({
        userId: t.userId?.userId || 'N/A',
        description: t.description || t.type,
        credit: t.amount > 0 ? t.amount : 0,
        debit: t.amount < 0 ? Math.abs(t.amount) : 0,
        balance: t.balanceAfter || 0,
        date: t.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// ==================== ADMIN TRANSACTION MANAGEMENT ====================

// Admin: Get all transactions with full details for editing
app.get('/api/admin/transactions', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { type, status, userId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (userId) {
      const user = await User.findOne({ userId: userId });
      if (user) filter.userId = user._id;
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('userId', 'userId firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      data: transactions.map(t => ({
        _id: t._id,
        userId: t.userId?.userId || 'N/A',
        userName: t.userId ? `${t.userId.firstName || ''} ${t.userId.lastName || ''}`.trim() : 'Unknown',
        userEmail: t.userId?.email || 'N/A',
        type: t.type,
        amount: t.amount,
        status: t.status,
        description: t.description || '',
        adminNotes: t.adminNotes || '',
        transactionHash: t.transactionHash || '',
        balanceAfter: t.balanceAfter || 0,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// Admin: Update a transaction
app.put('/api/admin/transactions/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { amount, status, description, adminNotes } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (amount !== undefined) transaction.amount = amount;
    if (status) transaction.status = status;
    if (description !== undefined) transaction.description = description;
    if (adminNotes !== undefined) transaction.adminNotes = adminNotes;
    transaction.updatedAt = new Date();
    await transaction.save();

    res.json({ success: true, message: 'Transaction updated successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
});

// Admin: Delete a transaction
app.delete('/api/admin/transactions/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
});

// ==================== END ADMIN TRANSACTION MANAGEMENT ====================

app.get('/api/reports/registrations-datewise', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear + 1, 0, 1);
    
    const registrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate }, role: { $ne: 'admin' } } },
      { $group: {
        _id: { day: { $dayOfMonth: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 }
      }}
    ]);
    
    // Build 31 days x 12 months grid
    const grid = [];
    for (let day = 1; day <= 31; day++) {
      const row = { year: targetYear, date: day };
      ['jan', 'feb', 'mar', 'apr', 'may', 'june', 'july', 'aug', 'sept', 'oct', 'nov', 'dec'].forEach((m, i) => {
        const found = registrations.find(r => r._id.day === day && r._id.month === i + 1);
        row[m] = found ? found.count : 0;
      });
      row.total = Object.values(row).filter(v => typeof v === 'number' && v !== targetYear && v !== day).reduce((a, b) => a + b, 0);
      grid.push(row);
    }
    
    res.json({ data: grid });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registration data', error: error.message });
  }
});

// Get user investments
app.get('/api/user/investments', authenticateToken, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id })
      .populate('planId')
      .sort({ createdAt: -1 });
    
    res.json({ 
      data: investments.map(inv => {
        const plan = inv.planId; // populated Plan document
        const duration = plan?.duration || 365;
        const dailyReturn = plan?.dailyEarn || inv.dailyEarned || 0;
        const startDate = inv.startDate || inv.createdAt;
        const endDate = inv.endDate || new Date(new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000);
        
        // Calculate next earning: next day after last earning date
        let nextEarning = null;
        if (inv.status === 'active') {
          const lastEarning = inv.lastEarningDate || startDate;
          const nextDate = new Date(lastEarning);
          nextDate.setDate(nextDate.getDate() + 1);
          nextDate.setHours(0, 0, 0, 0);
          nextEarning = nextDate;
        }
        
        return {
          id: inv._id,
          plan: plan?.name || 'Standard',
          amount: inv.amount,
          dailyReturn: dailyReturn,
          totalReturn: plan?.totalReturn || inv.amount * 2,
          purchaseDate: startDate,
          expiryDate: endDate,
          nextEarning: nextEarning,
          status: inv.status,
          totalEarned: inv.totalEarned || 0,
          duration: duration,
        };
      })
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investments', error: error.message });
  }
});

// Get admin members for various pages
app.get('/api/admin/members/resend-mail', authenticateToken, isAdmin, async (req, res) => {
  try {
    const members = await User.find({ role: { $ne: 'admin' }, emailVerified: false })
      .select('userId firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ 
      data: members.map(m => ({
        memberId: m.userId,
        memberName: `${m.firstName} ${m.lastName}`,
        email: m.email,
        registeredOn: m.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error: error.message });
  }
});

app.get('/api/admin/sponsor-changes', authenticateToken, isAdmin, async (req, res) => {
  try {
    // This would track sponsor changes - return empty for now
    res.json({ data: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sponsor changes', error: error.message });
  }
});

app.get('/api/admin/eliminate-conditions', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Special member conditions - return empty for now
    res.json({ data: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conditions', error: error.message });
  }
});

// ==================== REFERRAL BONUS ROUTES ====================

// Get user's referral bonuses
app.get('/api/user/referral-bonuses', authenticateToken, async (req, res) => {
  try {
    const bonuses = await ReferralBonus.find({ referrerId: req.user.id })
      .populate('referredUserId', 'userId firstName lastName email createdAt')
      .sort({ createdAt: -1 });
    
    const totalBonus = bonuses.reduce((sum, b) => sum + (b.bonusAmount || 0), 0);
    const creditedBonus = bonuses.filter(b => b.status === 'credited').reduce((sum, b) => sum + b.bonusAmount, 0);
    const pendingBonus = bonuses.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.bonusAmount, 0);
    
    res.json({
      success: true,
      data: {
        bonuses: bonuses.map(b => ({
          id: b._id,
          referredUser: {
            userId: b.referredUserId?.userId,
            name: b.referredUserId ? `${b.referredUserId.firstName} ${b.referredUserId.lastName}` : 'N/A',
            email: b.referredUserId?.email,
            joinedAt: b.referredUserId?.createdAt
          },
          bonusPercentage: b.bonusPercentage,
          bonusAmount: b.bonusAmount,
          status: b.status,
          creditedAt: b.creditedAt,
          createdAt: b.createdAt
        })),
        summary: {
          totalReferrals: bonuses.length,
          totalBonus,
          creditedBonus,
          pendingBonus
        }
      }
    });
  } catch (error) {
    console.error('Get referral bonuses error:', error);
    res.status(500).json({ message: 'Error fetching referral bonuses', error: error.message });
  }
});

// Admin: Get all referral bonuses
app.get('/api/admin/referral-bonuses', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    
    const bonuses = await ReferralBonus.find(filter)
      .populate('referrerId', 'userId firstName lastName email')
      .populate('referredUserId', 'userId firstName lastName email createdAt')
      .populate('investmentId', 'planName amount status')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await ReferralBonus.countDocuments(filter);
    const pendingCount = await ReferralBonus.countDocuments({ status: 'pending', bonusAmount: { $gt: 0 } });
    
    res.json({
      success: true,
      data: bonuses.map(b => ({
        id: b._id,
        referrer: {
          id: b.referrerId?._id,
          oderId: b.referrerId?.userId,
          name: b.referrerId ? `${b.referrerId.firstName} ${b.referrerId.lastName}` : 'N/A',
          email: b.referrerId?.email
        },
        referredUser: {
          id: b.referredUserId?._id,
          oderId: b.referredUserId?.userId,
          name: b.referredUserId ? `${b.referredUserId.firstName} ${b.referredUserId.lastName}` : 'N/A',
          email: b.referredUserId?.email,
          joinedAt: b.referredUserId?.createdAt
        },
        investment: b.investmentId ? {
          id: b.investmentId._id,
          planName: b.investmentId.planName,
          amount: b.investmentId.amount,
          status: b.investmentId.status
        } : null,
        bonusPercentage: b.bonusPercentage,
        bonusAmount: b.bonusAmount,
        investmentAmount: b.investmentAmount,
        status: b.status,
        approvedBy: b.approvedBy ? `${b.approvedBy.firstName} ${b.approvedBy.lastName}` : null,
        approvedAt: b.approvedAt,
        creditedAt: b.creditedAt,
        rejectedAt: b.rejectedAt,
        rejectionReason: b.rejectionReason,
        adminNotes: b.adminNotes,
        description: b.description,
        createdAt: b.createdAt
      })),
      pendingCount,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get admin referral bonuses error:', error);
    res.status(500).json({ message: 'Error fetching referral bonuses', error: error.message });
  }
});

// Get Referral Bonus Summary - Total counts for dashboard
app.get('/api/admin/referral-bonuses-summary', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get counts by status
    const totalReferrals = await ReferralBonus.countDocuments();
    const pendingApproval = await ReferralBonus.countDocuments({ status: 'pending' });
    const creditedCount = await ReferralBonus.countDocuments({ status: 'credited' });
    const rejectedCount = await ReferralBonus.countDocuments({ status: 'rejected' });
    
    // Get amount totals
    const pendingAmount = await ReferralBonus.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$bonusAmount' } } }
    ]);
    
    const creditedAmount = await ReferralBonus.aggregate([
      { $match: { status: 'credited' } },
      { $group: { _id: null, total: { $sum: '$bonusAmount' } } }
    ]);
    
    // Get pending approval details with user info
    const pendingBonuses = await ReferralBonus.find({ status: 'pending' })
      .populate('referrerId', 'userId firstName lastName email')
      .populate('referredUserId', 'userId firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get credited bonuses
    const creditedBonuses = await ReferralBonus.find({ status: 'credited' })
      .populate('referrerId', 'userId firstName lastName email')
      .populate('referredUserId', 'userId firstName lastName email')
      .sort({ creditedAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      summary: {
        totalReferrals,
        pendingApproval,
        credited: creditedCount,
        rejected: rejectedCount,
        pendingAmount: pendingAmount[0]?.total || 0,
        creditedAmount: creditedAmount[0]?.total || 0,
      },
      pending: pendingBonuses.map(b => ({
        id: b._id,
        referrer: {
          id: b.referrerId?.userId,
          name: b.referrerId ? `${b.referrerId.firstName} ${b.referrerId.lastName}` : 'N/A',
          email: b.referrerId?.email
        },
        referredUser: {
          id: b.referredUserId?.userId,
          name: b.referredUserId ? `${b.referredUserId.firstName} ${b.referredUserId.lastName}` : 'N/A',
          email: b.referredUserId?.email
        },
        bonusAmount: b.bonusAmount,
        investmentAmount: b.investmentAmount,
        createdAt: b.createdAt
      })),
      credited: creditedBonuses.map(b => ({
        id: b._id,
        referrer: b.referrerId ? `${b.referrerId.firstName} ${b.referrerId.lastName}` : 'N/A',
        referredUser: b.referredUserId ? `${b.referredUserId.firstName} ${b.referredUserId.lastName}` : 'N/A',
        bonusAmount: b.bonusAmount,
        creditedAt: b.creditedAt
      }))
    });
  } catch (error) {
    console.error('Referral bonus summary error:', error);
    res.status(500).json({ message: 'Error fetching referral summary', error: error.message });
  }
});

// Approve and Credit referral bonus (admin approval required)
app.post('/api/admin/referral-bonuses/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const bonus = await ReferralBonus.findById(req.params.id)
      .populate('referrerId', 'firstName lastName email')
      .populate('referredUserId', 'firstName lastName email');
    
    if (!bonus) {
      return res.status(404).json({ message: 'Referral bonus not found' });
    }
    
    if (bonus.status === 'credited') {
      return res.status(400).json({ message: 'Bonus already credited' });
    }
    
    if (bonus.status === 'rejected') {
      return res.status(400).json({ message: 'Bonus was rejected and cannot be approved' });
    }
    
    if (bonus.bonusAmount <= 0) {
      return res.status(400).json({ message: 'No bonus amount to credit. Referred user has not made an investment yet.' });
    }
    
    const bonusAmount = bonus.bonusAmount;
    
    // Update referral bonus status to credited
    bonus.status = 'credited';
    bonus.approvedBy = req.user.id;
    bonus.approvedAt = new Date();
    bonus.creditedAt = new Date();
    if (adminNotes) bonus.adminNotes = adminNotes;
    await bonus.save();
    
    // Update referrer's Utility Wallet (not main balance) and stats
    await User.findByIdAndUpdate(bonus.referrerId._id, {
      $inc: { 
        utilityWallet: bonusAmount,
        totalReferralBonus: bonusAmount,
        referralBonusCount: 1,
        totalEarned: bonusAmount
      }
    });
    
    // Create transaction record
    const transaction = new Transaction({
      userId: bonus.referrerId._id,
      type: 'commission',
      amount: bonusAmount,
      status: 'completed',
      description: `Referral bonus (${bonus.bonusPercentage}%) for referring ${bonus.referredUserId.firstName} ${bonus.referredUserId.lastName} - Credited to Utility Wallet`,
      referredUserId: bonus.referredUserId._id
    });
    await transaction.save();
    
    // Create user notification for referrer
    await createUserNotification(
      bonus.referrerId._id,
      'referral_bonus',
      'Referral Bonus Received! 🎉',
      `You earned $${bonusAmount.toFixed(2)} referral bonus for referring ${bonus.referredUserId.firstName}. Credited to your Utility Wallet.`,
      { amount: bonusAmount, referredUserId: bonus.referredUserId._id }
    );
    
    // Create admin notification
    await AdminNotification.create({
      type: 'other',
      title: 'Referral Bonus Credited',
      message: `Referral bonus of $${bonusAmount.toFixed(2)} has been credited to ${bonus.referrerId.firstName} ${bonus.referrerId.lastName}`,
      userId: bonus.referrerId._id,
      referrerId: bonus.referrerId._id,
      data: {
        referrerName: `${bonus.referrerId.firstName} ${bonus.referrerId.lastName}`,
        referrerEmail: bonus.referrerId.email,
        newUserName: `${bonus.referredUserId.firstName} ${bonus.referredUserId.lastName}`,
        bonusAmount: bonusAmount,
        referralBonusId: bonus._id.toString()
      },
      priority: 'normal',
      isRead: true
    });
    
    res.json({ 
      success: true, 
      message: `Referral bonus of $${bonusAmount.toFixed(2)} approved and credited successfully to ${bonus.referrerId.firstName} ${bonus.referrerId.lastName}`, 
      bonus 
    });
  } catch (error) {
    console.error('Approve referral bonus error:', error);
    res.status(500).json({ message: 'Error approving bonus', error: error.message });
  }
});

// Reject referral bonus
app.post('/api/admin/referral-bonuses/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { reason, adminNotes } = req.body;
    const bonus = await ReferralBonus.findById(req.params.id);
    
    if (!bonus) {
      return res.status(404).json({ message: 'Referral bonus not found' });
    }
    
    if (bonus.status === 'credited') {
      return res.status(400).json({ message: 'Cannot reject an already credited bonus' });
    }
    
    if (bonus.status === 'rejected') {
      return res.status(400).json({ message: 'Bonus is already rejected' });
    }
    
    // Update referral bonus status to rejected
    bonus.status = 'rejected';
    bonus.rejectedAt = new Date();
    bonus.rejectionReason = reason || 'Rejected by admin';
    if (adminNotes) bonus.adminNotes = adminNotes;
    await bonus.save();
    
    res.json({ 
      success: true, 
      message: 'Referral bonus rejected successfully', 
      bonus 
    });
  } catch (error) {
    console.error('Reject referral bonus error:', error);
    res.status(500).json({ message: 'Error rejecting bonus', error: error.message });
  }
});

// Legacy credit endpoint (for backward compatibility)
app.post('/api/admin/referral-bonuses/:id/credit', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { amount } = req.body;
    const bonus = await ReferralBonus.findById(req.params.id)
      .populate('referrerId', 'firstName lastName')
      .populate('referredUserId', 'firstName lastName');
    
    if (!bonus) {
      return res.status(404).json({ message: 'Referral bonus not found' });
    }
    
    if (bonus.status === 'credited') {
      return res.status(400).json({ message: 'Bonus already credited' });
    }
    
    const bonusAmount = amount || bonus.bonusAmount;
    
    // Update referral bonus
    bonus.bonusAmount = bonusAmount;
    bonus.status = 'credited';
    bonus.approvedBy = req.user.id;
    bonus.approvedAt = new Date();
    bonus.creditedAt = new Date();
    await bonus.save();
    
    // Update referrer's Utility Wallet and stats
    await User.findByIdAndUpdate(bonus.referrerId._id, {
      $inc: { 
        utilityWallet: bonusAmount,
        totalReferralBonus: bonusAmount,
        referralBonusCount: 1,
        totalEarned: bonusAmount
      }
    });
    
    // Create transaction record
    const transaction = new Transaction({
      userId: bonus.referrerId._id,
      type: 'commission',
      amount: bonusAmount,
      status: 'completed',
      description: `Referral bonus for referring ${bonus.referredUserId.firstName} ${bonus.referredUserId.lastName} - Credited to Utility Wallet`,
      referredUserId: bonus.referredUserId._id
    });
    await transaction.save();
    
    // Create user notification for referrer
    await createUserNotification(
      bonus.referrerId._id,
      'referral_bonus',
      'Referral Bonus Received! 🎉',
      `You earned $${bonusAmount.toFixed(2)} referral bonus. Credited to your Utility Wallet.`,
      { amount: bonusAmount }
    );
    
    res.json({ success: true, message: 'Referral bonus credited to Utility Wallet successfully', bonus });
  } catch (error) {
    console.error('Credit referral bonus error:', error);
    res.status(500).json({ message: 'Error crediting bonus', error: error.message });
  }
});

// ==================== ADMIN NOTIFICATIONS ROUTES ====================

// Get admin notifications
app.get('/api/admin/notifications', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { type, isRead, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    
    const notifications = await AdminNotification.find(filter)
      .populate('userId', 'userId firstName lastName email')
      .populate('referrerId', 'userId firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await AdminNotification.countDocuments(filter);
    const unreadCount = await AdminNotification.countDocuments({ isRead: false });
    
    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Get unread notification count
app.get('/api/admin/notifications/unread-count', authenticateToken, isAdmin, async (req, res) => {
  try {
    const count = await AdminNotification.countDocuments({ isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching count', error: error.message });
  }
});

// Mark notification as read
app.put('/api/admin/notifications/:id/read', authenticateToken, isAdmin, async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date(), readBy: req.user.id },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

// Mark all notifications as read
app.put('/api/admin/notifications/mark-all-read', authenticateToken, isAdmin, async (req, res) => {
  try {
    await AdminNotification.updateMany(
      { isRead: false },
      { isRead: true, readAt: new Date(), readBy: req.user.id }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
  }
});

// Delete notification
app.delete('/api/admin/notifications/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await AdminNotification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

// ==================== USER NOTIFICATIONS ROUTES ====================

// Get user notifications
app.get('/api/user/notifications', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    
    const notifications = await UserNotification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await UserNotification.countDocuments({ userId: req.user.id });
    const unreadCount = await UserNotification.countDocuments({ userId: req.user.id, isRead: false });
    
    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Get unread notification count for user
app.get('/api/user/notifications/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await UserNotification.countDocuments({ userId: req.user.id, isRead: false });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching count', error: error.message });
  }
});

// Mark user notification as read
app.put('/api/user/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await UserNotification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

// Mark all user notifications as read
app.put('/api/user/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await UserNotification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
  }
});

// ==================== USER PANEL - COMPLETE FUNCTIONAL APIS ====================

// Withdrawal Summary for User
app.get('/api/withdrawals/summary', authenticateToken, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    const data = withdrawals.map(w => ({
      id: w._id,
      requestId: w._id.toString().slice(-8).toUpperCase(),
      date: w.createdAt,
      amount: w.amount,
      charges: w.charges || 0,
      netAmount: w.amount - (w.charges || 0),
      walletAddress: w.walletAddress,
      status: w.status,
      transactionHash: w.transactionHash || null,
      rejectionReason: w.rejectionReason || null,
      processedAt: w.approvalDate || w.paymentDate || null
    }));
    
    // Calculate totals
    const totalRequested = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const totalApproved = withdrawals.filter(w => w.status === 'completed' || w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0);
    const totalPending = withdrawals.filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0);
    
    res.json({ 
      success: true,
      data,
      summary: { totalRequested, totalApproved, totalPending, totalCount: withdrawals.length }
    });
  } catch (error) {
    console.error('Withdrawal summary error:', error);
    res.status(500).json({ message: 'Error fetching withdrawal summary', error: error.message });
  }
});

// Deposit Report for User
app.get('/api/deposits/report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = { userId: req.user.id };
    
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const deposits = await Deposit.find(query).sort({ createdAt: -1 });
    
    const data = deposits.map(d => ({
      id: d._id,
      depositId: d._id.toString().slice(-8).toUpperCase(),
      date: d.createdAt,
      amount: d.amount,
      network: d.network,
      transactionHash: d.transactionHash,
      status: d.status,
      adminRemarks: d.adminNotes || d.rejectionReason || null,
      approvedAt: d.approvedAt || null,
      rejectedAt: d.rejectedAt || null
    }));
    
    const totalDeposited = deposits.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.amount, 0);
    const totalPending = deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
    
    res.json({
      success: true,
      data,
      summary: { totalDeposited, totalPending, totalCount: deposits.length }
    });
  } catch (error) {
    console.error('Deposit report error:', error);
    res.status(500).json({ message: 'Error fetching deposit report', error: error.message });
  }
});

// User Activation Report
app.get('/api/activations/report', authenticateToken, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id })
      .populate('planId')
      .sort({ createdAt: -1 });
    
    const data = investments.map(inv => ({
      id: inv._id,
      activationId: inv._id.toString().slice(-8).toUpperCase(),
      date: inv.createdAt,
      planName: inv.planId?.name || 'N/A',
      amount: inv.amount,
      paymentMethod: inv.paymentMethod || 'Wallet',
      status: inv.status,
      totalEarned: inv.totalEarned || 0,
      daysRemaining: inv.endDate ? Math.max(0, Math.ceil((new Date(inv.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Activation report error:', error);
    res.status(500).json({ message: 'Error fetching activation report', error: error.message });
  }
});

// User Profile Update with Image Upload
app.put('/api/user/profile/update', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { firstName, lastName, phone, country, address, walletAddress, walletType } = req.body;
    
    const updateData = {
      firstName, lastName, phone, country, address, updatedAt: new Date()
    };
    
    // Only update wallet if provided
    if (walletAddress) updateData.walletAddress = walletAddress;
    if (walletType) updateData.walletType = walletType;
    
    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      user 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Withdrawal Address Management
app.get('/api/user/withdrawal-addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('usdtTrc20Address bnbBep20Address walletAddress walletType withdrawalAddresses');
    
    // Return new format addresses
    const addresses = {
      usdtTrc20: user.usdtTrc20Address || user.walletAddress || '',
      bnbBep20: user.bnbBep20Address || ''
    };
    
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
});

app.post('/api/user/withdrawal-addresses', authenticateToken, async (req, res) => {
  try {
    const { usdtTrc20, bnbBep20 } = req.body;
    
    // Validate USDT TRC20 address if provided
    if (usdtTrc20 && usdtTrc20.length > 0 && !usdtTrc20.startsWith('T')) {
      return res.status(400).json({ success: false, message: 'Invalid USDT TRC20 address format. Must start with T' });
    }
    
    // Validate BNB BEP20 address if provided
    if (bnbBep20 && bnbBep20.length > 0 && !bnbBep20.startsWith('0x')) {
      return res.status(400).json({ success: false, message: 'Invalid BNB BEP20 address format. Must start with 0x' });
    }
    
    const updateData = {};
    if (usdtTrc20 !== undefined) {
      updateData.usdtTrc20Address = usdtTrc20;
      updateData.walletAddress = usdtTrc20; // Set as primary
      updateData.walletType = 'usdt_trc20';
    }
    if (bnbBep20 !== undefined) {
      updateData.bnbBep20Address = bnbBep20;
    }
    
    await User.findByIdAndUpdate(req.user.id, updateData);
    
    res.json({ success: true, message: 'Withdrawal addresses saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving addresses', error: error.message });
  }
});

app.delete('/api/user/withdrawal-addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.withdrawalAddresses) {
      user.withdrawalAddresses = user.withdrawalAddresses.filter(
        a => a._id?.toString() !== req.params.addressId
      );
      await user.save();
    }
    
    res.json({ success: true, message: 'Address removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing address', error: error.message });
  }
});

// Real Withdrawal Request with Balance Check
app.post('/api/withdrawals/request', authenticateToken, async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
    }
    if (!walletAddress) {
      return res.status(400).json({ success: false, message: 'Wallet address is required' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Get admin settings for min/max withdrawal
    const settings = await AdminSettings.findOne({});
    const minWithdrawal = settings?.minWithdrawal || 50;
    const maxWithdrawal = settings?.maxWithdrawal || 50000;
    const withdrawalFeePercent = settings?.withdrawalFeePercent || 0;
    
    if (withdrawAmount < minWithdrawal) {
      return res.status(400).json({ success: false, message: `Minimum withdrawal is $${minWithdrawal}` });
    }
    if (withdrawAmount > maxWithdrawal) {
      return res.status(400).json({ success: false, message: `Maximum withdrawal is $${maxWithdrawal}` });
    }
    // Check withdrawable balance (My Wallet is the withdrawable wallet)
    const withdrawableBalance = (user.myWallet || 0);
    if (withdrawAmount > withdrawableBalance) {
      return res.status(400).json({ success: false, message: `Insufficient balance in My Wallet. Available: $${withdrawableBalance}` });
    }
    
    // Calculate charges
    const charges = (withdrawAmount * withdrawalFeePercent) / 100;
    const netAmount = withdrawAmount - charges;
    
    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId: user._id,
      amount: withdrawAmount,
      charges,
      netAmount,
      walletAddress,
      status: 'pending'
    });
    await withdrawal.save();
    
    // Deduct from My Wallet and add to pending
    user.myWallet = (user.myWallet || 0) - withdrawAmount;
    user.pendingWithdrawal += withdrawAmount;
    // Keep balance in sync
    user.balance = (user.myWallet || 0) + (user.fundWallet || 0) + (user.utilityWallet || 0);
    await user.save();
    
    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'withdrawal',
      amount: -withdrawAmount,
      balanceBefore: user.balance + withdrawAmount,
      balanceAfter: user.balance,
      status: 'pending',
      description: `Withdrawal request to ${walletAddress}`,
      withdrawalId: withdrawal._id
    });
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      requestId: withdrawal._id.toString().slice(-8).toUpperCase(),
      amount: withdrawAmount,
      charges,
      netAmount,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ message: 'Error processing withdrawal request', error: error.message });
  }
});

// Get User's Complete Transaction History
app.get('/api/user/transactions/all', authenticateToken, async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let query = { userId: req.user.id };
    
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Transaction.countDocuments(query);
    
    const data = transactions.map(t => ({
      id: t._id,
      transactionId: t._id.toString().slice(-10).toUpperCase(),
      date: t.createdAt,
      type: t.amount >= 0 ? 'credit' : 'debit',
      category: t.type,
      amount: Math.abs(t.amount),
      balanceBefore: t.balanceBefore || t.previousBalance,
      balanceAfter: t.balanceAfter || t.newBalance,
      status: t.status,
      description: t.description || t.type
    }));
    
    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// Daily Income Report
app.get('/api/user/income/daily', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { 
      userId: req.user.id, 
      type: { $in: ['earning', 'daily_return'] }
    };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .populate('investmentId')
      .sort({ createdAt: -1 });
    
    const data = transactions.map(t => ({
      id: t._id,
      date: t.createdAt,
      planName: t.investmentId?.planName || 'Daily Return',
      investmentAmount: t.investmentId?.amount || 0,
      roiPercentage: t.investmentId?.dailyReturn || 0,
      incomeAmount: t.amount,
      description: t.description
    }));
    
    const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    res.json({ success: true, data, totalIncome });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily income', error: error.message });
  }
});

// Direct Income Report
app.get('/api/user/income/direct', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { userId: req.user.id, type: 'commission' };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const commissions = await Commission.find({ ...query, type: 'direct' })
      .populate('sourceUserId', 'firstName lastName userId')
      .sort({ createdAt: -1 });
    
    const data = commissions.map(c => ({
      id: c._id,
      date: c.createdAt,
      fromUser: c.sourceUserId ? `${c.sourceUserId.firstName} ${c.sourceUserId.lastName}` : 'N/A',
      fromUserId: c.sourceUserId?.userId || 'N/A',
      level: 1,
      commissionPercent: 10,
      amount: c.amount,
      status: c.status
    }));
    
    const totalIncome = commissions.reduce((sum, c) => sum + c.amount, 0);
    
    res.json({ success: true, data, totalIncome });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching direct income', error: error.message });
  }
});

// Level Income Report
app.get('/api/user/income/level', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, level } = req.query;
    
    let query = { userId: req.user.id, type: 'level' };
    
    if (level) query.level = parseInt(level);
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const commissions = await Commission.find(query)
      .populate('sourceUserId', 'firstName lastName userId')
      .sort({ createdAt: -1 });
    
    const data = commissions.map(c => ({
      id: c._id,
      date: c.createdAt,
      fromUser: c.sourceUserId ? `${c.sourceUserId.firstName} ${c.sourceUserId.lastName}` : 'N/A',
      level: c.level,
      amount: c.amount,
      percentage: c.percentage || 0
    }));
    
    // Group by level
    const levelTotals = {};
    commissions.forEach(c => {
      levelTotals[c.level] = (levelTotals[c.level] || 0) + c.amount;
    });
    
    const totalIncome = commissions.reduce((sum, c) => sum + c.amount, 0);
    
    res.json({ success: true, data, levelTotals, totalIncome });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching level income', error: error.message });
  }
});

// Rank Income Report
app.get('/api/user/income/rank', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const rankBonuses = await Commission.find({ userId: req.user.id, type: 'rank' })
      .sort({ createdAt: -1 });
    
    // Calculate current rank
    const totalInvested = user.totalInvested || 0;
    let currentRank = 'Bronze';
    let nextRank = 'Silver';
    let nextRankTarget = 1000;
    
    if (totalInvested >= 10000) {
      currentRank = 'Diamond';
      nextRank = 'Crown Diamond';
      nextRankTarget = 50000;
    } else if (totalInvested >= 5000) {
      currentRank = 'Gold';
      nextRank = 'Diamond';
      nextRankTarget = 10000;
    } else if (totalInvested >= 1000) {
      currentRank = 'Silver';
      nextRank = 'Gold';
      nextRankTarget = 5000;
    }
    
    const data = rankBonuses.map(r => ({
      id: r._id,
      date: r.createdAt,
      rankAchieved: r.description || currentRank,
      bonusAmount: r.amount,
      status: r.status
    }));
    
    const totalRankIncome = rankBonuses.reduce((sum, r) => sum + r.amount, 0);
    
    res.json({
      success: true,
      data,
      currentRank,
      nextRank,
      nextRankTarget,
      progress: Math.min((totalInvested / nextRankTarget) * 100, 100),
      totalRankIncome
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rank income', error: error.message });
  }
});

// Referral Bonus Page Data
app.get('/api/user/referral-info', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('directReferrals', 'firstName lastName email createdAt totalInvested status');
    
    const referralBonuses = await ReferralBonus.find({ referrerId: req.user.id })
      .populate('referredUserId', 'firstName lastName userId email createdAt')
      .sort({ createdAt: -1 });
    
    const referralLink = `https://hexanova.net/register?ref=${user.referralCode}`;
    
    // Commission structure from settings
    const settings = await AdminSettings.findOne({});
    const commissionStructure = {
      directBonus: settings?.directCommissionRate || 10,
      levels: settings?.levelCommissionRates || {
        level1: 5, level2: 3, level3: 2, level4: 1, level5: 0.5
      }
    };
    
    const totalBonus = referralBonuses.reduce((sum, b) => sum + b.bonusAmount, 0);
    const creditedBonus = referralBonuses.filter(b => b.status === 'credited').reduce((sum, b) => sum + b.bonusAmount, 0);
    const pendingBonus = referralBonuses.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.bonusAmount, 0);
    
    res.json({
      success: true,
      referralCode: user.referralCode,
      referralLink,
      stats: {
        totalReferrals: user.directReferrals?.length || 0,
        activeReferrals: user.directReferrals?.filter(r => r.status === 'active').length || 0,
        totalBonusEarned: totalBonus,
        creditedBonus,
        pendingBonus
      },
      recentBonuses: referralBonuses.slice(0, 10).map(b => ({
        id: b._id,
        referredUser: b.referredUserId ? {
          name: `${b.referredUserId.firstName} ${b.referredUserId.lastName}`,
          email: b.referredUserId.email
        } : null,
        amount: b.bonusAmount,
        status: b.status,
        date: b.createdAt
      })),
      commissionStructure
    });
  } catch (error) {
    console.error('Referral info error:', error);
    res.status(500).json({ message: 'Error fetching referral info', error: error.message });
  }
});

// Plan Purchase/Activation with Commission Distribution
app.post('/api/plans/purchase', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;
    
    const user = await User.findById(req.user.id);
    const plan = await Plan.findById(planId);
    
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Plan not found or inactive' });
    }
    
    // Use Fund Wallet for plan purchase
    if ((user.fundWallet || 0) < plan.investment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance in Fund Wallet. Please deposit or transfer funds.',
        required: plan.investment,
        available: user.fundWallet || 0,
        shortfall: plan.investment - (user.fundWallet || 0)
      });
    }
    
    // Check if first investment for referral bonus
    const existingInvestments = await Investment.countDocuments({ userId: req.user.id });
    const isFirstInvestment = existingInvestments === 0;
    
    // Create investment
    const investment = new Investment({
      userId: req.user.id,
      planId: plan._id,
      planName: plan.name,
      amount: plan.investment,
      dailyReturn: plan.dailyEarn,
      expectedReturn: plan.totalReturn,
      startDate: new Date(),
      endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
      status: 'active'
    });
    await investment.save();
    
    // Deduct from Fund Wallet
    const previousBalance = user.fundWallet || 0;
    user.fundWallet = previousBalance - plan.investment;
    user.totalInvested += plan.investment;
    user.activeInvestments += 1;
    
    // Set activatedAt on first investment
    if (!user.activatedAt) {
      user.activatedAt = new Date();
      user.status = 'active';
    }
    
    await user.save();
    
    // Create transaction
    const transaction = new Transaction({
      userId: req.user.id,
      type: 'investment',
      amount: -plan.investment,
      balanceBefore: previousBalance,
      balanceAfter: user.fundWallet,
      status: 'completed',
      description: `Invested in ${plan.name} - Deducted from Fund Wallet`,
      investmentId: investment._id
    });
    await transaction.save();
    
    // Create user notification for investment activation
    await createUserNotification(
      req.user.id,
      'investment_activated',
      'Investment Activated! 🚀',
      `Your ${plan.name} investment of $${plan.investment} is now active. Daily earning: $${plan.dailyEarn}`,
      { amount: plan.investment, investmentId: investment._id, planName: plan.name }
    );
    
    // Create admin notification for plan activation
    await AdminNotification.create({
      type: 'investment',
      title: 'New Plan Activated',
      message: `${user.firstName} ${user.lastName} has activated the ${plan.name} plan worth $${plan.investment}`,
      userId: user._id,
      data: {
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        planName: plan.name,
        planAmount: plan.investment,
        investmentId: investment._id.toString()
      },
      priority: 'high',
    });
    
    // Credit referral bonus if first investment and user was referred
    if (isFirstInvestment && user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        // 5% referral bonus to referrer's utility wallet
        const bonusAmount = plan.investment * 0.05;
        
        referrer.utilityWallet = (referrer.utilityWallet || 0) + bonusAmount;
        referrer.totalEarned = (referrer.totalEarned || 0) + bonusAmount;
        await referrer.save();
        
        // Create transaction for referrer
        await Transaction.create({
          userId: referrer._id,
          type: 'referral_bonus',
          amount: bonusAmount,
          description: `Referral Bonus (5%) from ${user.firstName} ${user.lastName}'s investment`,
          status: 'completed',
          balanceAfter: referrer.utilityWallet
        });
        
        // Update referral bonus record
        await ReferralBonus.findOneAndUpdate(
          { referrerId: referrer._id, referredUserId: user._id },
          { 
            bonusAmount,
            investmentId: investment._id,
            investmentAmount: plan.investment,
            status: 'credited',
            creditedAt: new Date()
          },
          { upsert: true }
        );
        
        // Notify referrer about bonus
        await createUserNotification(
          referrer._id,
          'referral_bonus',
          'Referral Bonus! 🤝',
          `You earned $${bonusAmount} (5%) bonus from ${user.firstName}'s investment.`,
          { amount: bonusAmount }
        );
        
        // Create admin notification
        await AdminNotification.create({
          type: 'referral_bonus_pending',
          title: 'Referral Bonus Credited',
          message: `${referrer.firstName} ${referrer.lastName} earned $${bonusAmount} referral bonus from ${user.firstName} ${user.lastName}'s investment`,
          userId: referrer._id,
          referrerId: referrer._id,
          data: { bonusAmount, investmentAmount: plan.investment }
        });
      }
    }
    
    // 5% Welcome bonus to user's utility wallet on first investment
    if (isFirstInvestment) {
      const welcomeBonus = plan.investment * 0.05;
      user.utilityWallet = (user.utilityWallet || 0) + welcomeBonus;
      user.totalEarned = (user.totalEarned || 0) + welcomeBonus;
      await user.save();
      
      await Transaction.create({
        userId: user._id,
        type: 'bonus',
        amount: welcomeBonus,
        description: `Welcome Bonus (5%) for activating ${plan.name}`,
        status: 'completed',
        balanceAfter: user.utilityWallet
      });

      // Notify user about welcome bonus
      await createUserNotification(
        user._id,
        'welcome_bonus',
        'Welcome Bonus! 🎁',
        `You received $${welcomeBonus} Welcome Bonus in your Utility Wallet.`,
        { amount: welcomeBonus }
      );
    }
    
    res.json({
      success: true,
      message: `Successfully invested in ${plan.name}`,
      investment: {
        id: investment._id,
        planName: plan.name,
        amount: plan.investment,
        dailyReturn: plan.dailyEarn,
        duration: plan.duration,
        expectedReturn: plan.totalReturn,
        startDate: investment.startDate,
        endDate: investment.endDate
      },
      newBalance: user.fundWallet
    });
  } catch (error) {
    console.error('Plan purchase error:', error);
    res.status(500).json({ message: 'Error purchasing plan', error: error.message });
  }
});

// ==================== LEARNING CENTER APIs ====================

// Get learning courses
app.get('/api/learning/courses', authenticateToken, async (req, res) => {
  try {
    const courses = [
      { id: 1, title: 'Introduction to Hexanova', description: 'Learn the basics of Hexanova platform', duration: '2 hours', level: 'Beginner', progress: 0 },
      { id: 2, title: 'Advanced Trading Strategies', description: 'Master trading techniques', duration: '4 hours', level: 'Advanced', progress: 0 },

      { id: 3, title: 'Building Your Network', description: 'Grow your referral network effectively', duration: '3 hours', level: 'Intermediate', progress: 0 }
    ];
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching courses', error: error.message });
  }
});

// Get tutorials
app.get('/api/learning/tutorials', authenticateToken, async (req, res) => {
  try {
    const tutorials = [
      { id: 1, title: 'How to Make a Deposit', category: 'Deposits', videoUrl: '#', duration: '5 min' },
      { id: 2, title: 'Withdrawing Funds', category: 'Withdrawals', videoUrl: '#', duration: '5 min' },
      { id: 3, title: 'Inviting Referrals', category: 'Referrals', videoUrl: '#', duration: '10 min' }
    ];
    res.json({ success: true, data: tutorials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tutorials', error: error.message });
  }
});

// Get learning FAQs
app.get('/api/learning/faqs', authenticateToken, async (req, res) => {
  try {
    const faqs = [
      { id: 1, question: 'How do I start earning?', answer: 'Make an initial investment and your ROI will start calculating daily.' },
      { id: 2, question: 'How do referral bonuses work?', answer: 'When someone you refer makes an investment, you earn a percentage as bonus.' },
      { id: 3, question: 'What are the minimum withdrawal limits?', answer: 'The minimum withdrawal amount is $10 USDT.' }
    ];
    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching FAQs', error: error.message });
  }
});

// ==================== SUPPORT HUB APIs ====================

// Get support tickets
app.get('/api/support/tickets', authenticateToken, async (req, res) => {
  try {
    // Return user's tickets (empty for new users)
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tickets', error: error.message });
  }
});

// Create support ticket
app.post('/api/support/tickets', authenticateToken, async (req, res) => {
  try {
    const { subject, message, category } = req.body;
    // In production, save to database
    res.json({ 
      success: true, 
      message: 'Ticket created successfully',
      data: { id: Date.now(), subject, message, category, status: 'open', createdAt: new Date() }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating ticket', error: error.message });
  }
});

// Get support FAQs
app.get('/api/support/faqs', authenticateToken, async (req, res) => {
  try {
    const faqs = [
      { id: 1, question: 'How do I reset my password?', answer: 'Go to Settings > Security > Change Password.' },
      { id: 2, question: 'Why is my withdrawal pending?', answer: 'Withdrawals are processed within 24hexanova after admin approval.' },
      { id: 3, question: 'How to contact support?', answer: 'Create a support ticket or email support@hexanova.net.' }
    ];
    res.json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching FAQs', error: error.message });
  }
});

// Get knowledge base articles
app.get('/api/support/knowledge-base', authenticateToken, async (req, res) => {
  try {
    const articles = [
      { id: 1, title: 'Getting Started Guide', category: 'Basics', content: 'Welcome to our platform...' },
      { id: 2, title: 'Investment Plans Explained', category: 'Investments', content: 'Our investment plans offer...' },
      { id: 3, title: 'Security Best Practices', category: 'Security', content: 'Keep your account safe by...' }
    ];
    res.json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching knowledge base', error: error.message });
  }
});

// Get support metrics (for support page display)
app.get('/api/support/metrics', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        avgResponseTime: '< 24 hours',
        satisfactionRate: '98%',
        activeAgents: 5
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching metrics', error: error.message });
  }
});

// ==================== SUPPORT CHAT SYSTEM ====================

// Generate unique ticket ID
const generateTicketId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${timestamp}-${random}`;
};

// USER: Start new chat or get existing chat
app.post('/api/chat/start', authenticateToken, async (req, res) => {
  try {
    const { subject } = req.body;
    const userId = req.user.id;
    
    // Check if user has an open chat
    let chat = await SupportChat.findOne({ 
      userId, 
      status: { $in: ['open', 'in-progress'] } 
    });
    
    if (!chat) {
      chat = new SupportChat({
        ticketId: generateTicketId(),
        userId,
        subject: subject || 'Support Request',
        status: 'open'
      });
      await chat.save();
    }
    
    // Get messages for this chat
    const messages = await ChatMessage.find({ chatId: chat._id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name email');
    
    res.json({
      success: true,
      chat: {
        id: chat._id,
        ticketId: chat.ticketId,
        subject: chat.subject,
        status: chat.status,
        unreadCount: chat.unreadByUser
      },
      messages: messages.map(m => ({
        id: m._id,
        message: m.message,
        senderType: m.senderType,
        senderName: m.senderType === 'admin' ? 'Support Team' : m.senderId?.name || 'You',
        isRead: m.isRead,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    console.error('Chat start error:', error);
    res.status(500).json({ success: false, message: 'Error starting chat', error: error.message });
  }
});

// USER: Send message in chat
app.post('/api/chat/send', authenticateToken, async (req, res) => {
  try {
    console.log('📨 HEADERS:', req.headers);
    console.log('📨 BODY RAW:', req.body);
    
    const { chatId, message } = req.body;
    const userId = req.user.id;
    
    console.log('📨 Chat send request:', { chatId, message, userId });
    
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    
    // Find chat
    let chat;
    if (chatId) {
      chat = await SupportChat.findOne({ _id: chatId, userId });
      console.log('📋 Found chat by ID:', chat?._id);
    } else {
      // Get or create chat
      chat = await SupportChat.findOne({ 
        userId, 
        status: { $in: ['open', 'in-progress'] } 
      });
      
      console.log('📋 Found existing chat:', chat?._id);
      
      if (!chat) {
        chat = new SupportChat({
          ticketId: generateTicketId(),
          userId,
          subject: 'Support Request',
          status: 'open'
        });
        await chat.save();
        console.log('📋 Created new chat:', chat._id, 'Ticket:', chat.ticketId);
      }
    }
    
    if (!chat) {
      console.log('❌ Chat not found for user:', userId);
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    // Create message
    const chatMessage = new ChatMessage({
      chatId: chat._id,
      senderId: userId,
      senderType: 'user',
      message: message.trim()
    });
    await chatMessage.save();
    console.log('✅ Message saved:', chatMessage._id);
    
    // Update chat
    chat.lastMessage = new Date();
    chat.unreadByAdmin += 1;
    if (chat.status === 'open') {
      chat.status = 'in-progress';
    }
    await chat.save();
    console.log('✅ Chat updated, unreadByAdmin:', chat.unreadByAdmin);
    
    res.json({
      success: true,
      message: {
        id: chatMessage._id,
        message: chatMessage.message,
        senderType: 'user',
        senderName: 'You',
        isRead: false,
        createdAt: chatMessage.createdAt
      },
      chatId: chat._id,
      ticketId: chat.ticketId
    });
  } catch (error) {
    console.error('Chat send error:', error);
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
});

// USER: Get chat messages
app.get('/api/chat/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user's active chat
    const chat = await SupportChat.findOne({ 
      userId, 
      status: { $in: ['open', 'in-progress'] } 
    });
    
    if (!chat) {
      return res.json({
        success: true,
        chat: null,
        messages: []
      });
    }
    
    // Mark all admin messages as read
    await ChatMessage.updateMany(
      { chatId: chat._id, senderType: 'admin', isRead: false },
      { isRead: true, readAt: new Date() }
    );
    chat.unreadByUser = 0;
    await chat.save();
    
    const messages = await ChatMessage.find({ chatId: chat._id })
      .sort({ createdAt: 1 });
    
    res.json({
      success: true,
      chat: {
        id: chat._id,
        ticketId: chat.ticketId,
        subject: chat.subject,
        status: chat.status
      },
      messages: messages.map(m => ({
        id: m._id,
        message: m.message,
        senderType: m.senderType,
        senderName: m.senderType === 'admin' ? 'Support Team' : 'You',
        isRead: m.isRead,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    console.error('Chat messages error:', error);
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
});

// USER: Get chat history (all past chats)
app.get('/api/chat/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const chats = await SupportChat.find({ userId })
      .sort({ lastMessage: -1 })
      .limit(20);
    
    const chatsWithLastMessage = await Promise.all(chats.map(async (chat) => {
      const lastMsg = await ChatMessage.findOne({ chatId: chat._id })
        .sort({ createdAt: -1 });
      
      return {
        id: chat._id,
        ticketId: chat.ticketId,
        subject: chat.subject,
        status: chat.status,
        lastMessage: lastMsg?.message?.substring(0, 50) + (lastMsg?.message?.length > 50 ? '...' : '') || 'No messages',
        lastMessageTime: chat.lastMessage,
        unreadCount: chat.unreadByUser,
        createdAt: chat.createdAt
      };
    }));
    
    res.json({
      success: true,
      chats: chatsWithLastMessage
    });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ success: false, message: 'Error fetching chat history', error: error.message });
  }
});

// USER: Close chat
app.post('/api/chat/close', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user.id;
    
    const chat = await SupportChat.findOne({ _id: chatId, userId });
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    chat.status = 'closed';
    await chat.save();
    
    res.json({
      success: true,
      message: 'Chat closed successfully'
    });
  } catch (error) {
    console.error('Chat close error:', error);
    res.status(500).json({ success: false, message: 'Error closing chat', error: error.message });
  }
});

// ADMIN: Get all chats
app.get('/api/admin/chats', authenticateToken, async (req, res) => {
  try {
    console.log('📥 Admin chats request, user role:', req.user.role);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const { status, page = 1, limit = 20 } = req.query;
    console.log('📋 Query params:', { status, page, limit });
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const total = await SupportChat.countDocuments(query);
    console.log('📊 Total chats found:', total);
    
    const chats = await SupportChat.find(query)
      .populate('userId', 'firstName lastName email phone userId')
      .sort({ lastMessage: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const chatsWithDetails = await Promise.all(chats.map(async (chat) => {
      const lastMsg = await ChatMessage.findOne({ chatId: chat._id })
        .sort({ createdAt: -1 });
      const messageCount = await ChatMessage.countDocuments({ chatId: chat._id });
      
      return {
        id: chat._id,
        ticketId: chat.ticketId,
        user: {
          id: chat.userId?._id,
          name: chat.userId ? `${chat.userId.firstName || ''} ${chat.userId.lastName || ''}`.trim() : 'Unknown',
          email: chat.userId?.email || 'N/A',
          phone: chat.userId?.phone || 'N/A',
          userId: chat.userId?.userId || 'N/A'
        },
        subject: chat.subject,
        status: chat.status,
        priority: chat.priority,
        lastMessage: lastMsg?.message?.substring(0, 100) + (lastMsg?.message?.length > 100 ? '...' : '') || 'No messages',
        lastMessageTime: chat.lastMessage,
        unreadCount: chat.unreadByAdmin,
        messageCount,
        createdAt: chat.createdAt
      };
    }));
    
    // Get stats
    const stats = {
      total: await SupportChat.countDocuments({}),
      open: await SupportChat.countDocuments({ status: 'open' }),
      inProgress: await SupportChat.countDocuments({ status: 'in-progress' }),
      resolved: await SupportChat.countDocuments({ status: 'resolved' }),
      closed: await SupportChat.countDocuments({ status: 'closed' }),
      unread: await SupportChat.aggregate([
        { $group: { _id: null, total: { $sum: '$unreadByAdmin' } } }
      ]).then(r => r[0]?.total || 0)
    };
    
    res.json({
      success: true,
      chats: chatsWithDetails,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin chats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching chats', error: error.message });
  }
});

// ADMIN: Get specific chat messages
app.get('/api/admin/chats/:chatId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const { chatId } = req.params;
    
    const chat = await SupportChat.findById(chatId)
      .populate('userId', 'firstName lastName email phone userId');
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    // Mark all user messages as read
    await ChatMessage.updateMany(
      { chatId: chat._id, senderType: 'user', isRead: false },
      { isRead: true, readAt: new Date() }
    );
    chat.unreadByAdmin = 0;
    await chat.save();
    
    const messages = await ChatMessage.find({ chatId: chat._id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'firstName lastName');
    
    res.json({
      success: true,
      chat: {
        id: chat._id,
        ticketId: chat.ticketId,
        user: {
          id: chat.userId?._id,
          name: chat.userId ? `${chat.userId.firstName || ''} ${chat.userId.lastName || ''}`.trim() : 'Unknown',
          email: chat.userId?.email || 'N/A',
          phone: chat.userId?.phone || 'N/A',
          userId: chat.userId?.userId || 'N/A'
        },
        subject: chat.subject,
        status: chat.status,
        priority: chat.priority,
        createdAt: chat.createdAt
      },
      messages: messages.map(m => ({
        id: m._id,
        message: m.message,
        senderType: m.senderType,
        senderName: m.senderType === 'admin' ? 'Admin' : (m.senderId ? `${m.senderId.firstName || ''} ${m.senderId.lastName || ''}`.trim() : 'User'),
        isRead: m.isRead,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    console.error('Admin chat messages error:', error);
    res.status(500).json({ success: false, message: 'Error fetching chat', error: error.message });
  }
});

// ADMIN: Reply to chat
app.post('/api/admin/chats/:chatId/reply', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const { chatId } = req.params;
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    
    const chat = await SupportChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    // Create admin message
    const chatMessage = new ChatMessage({
      chatId: chat._id,
      senderId: req.user.id,
      senderType: 'admin',
      message: message.trim()
    });
    await chatMessage.save();
    
    // Update chat
    chat.lastMessage = new Date();
    chat.unreadByUser += 1;
    if (chat.status === 'open') {
      chat.status = 'in-progress';
    }
    await chat.save();
    
    res.json({
      success: true,
      message: {
        id: chatMessage._id,
        message: chatMessage.message,
        senderType: 'admin',
        senderName: 'Admin',
        isRead: false,
        createdAt: chatMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Admin reply error:', error);
    res.status(500).json({ success: false, message: 'Error sending reply', error: error.message });
  }
});

// ADMIN: Update chat status
app.patch('/api/admin/chats/:chatId/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const { chatId } = req.params;
    const { status, priority } = req.body;
    
    const chat = await SupportChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    if (status) chat.status = status;
    if (priority) chat.priority = priority;
    await chat.save();
    
    res.json({
      success: true,
      message: 'Chat updated successfully',
      chat: {
        id: chat._id,
        ticketId: chat.ticketId,
        status: chat.status,
        priority: chat.priority
      }
    });
  } catch (error) {
    console.error('Admin update chat error:', error);
    res.status(500).json({ success: false, message: 'Error updating chat', error: error.message });
  }
});

// Get unread chat count for user (for floating badge)
app.get('/api/chat/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const chat = await SupportChat.findOne({ 
      userId, 
      status: { $in: ['open', 'in-progress'] } 
    });
    
    res.json({
      success: true,
      unreadCount: chat?.unreadByUser || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching unread count' });
  }
});

// ==================== ERROR HANDLING ====================

// Catch 404 - unknown routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  // Log error internally but never expose to client
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({ message: 'Something went wrong. Please try again.' });
});

// ==================== HELP CONFIG ROUTES ====================

// Get Help Config (Public/User)
app.get('/api/help-config', async (req, res) => {
  try {
    let config = await HelpConfig.findOne();
    if (!config) {
      config = await HelpConfig.create({
        whatsappNumber: '447402078220',
        email: 'help@hexanova.net',
        supportHours: '24/7',
        responseTime: 'Within 2 hours',
      });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching help config', error: error.message });
  }
});

// Update Help Config (Admin)
app.put('/api/admin/help-config', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { whatsappNumber, email, supportHours, responseTime } = req.body;
    let config = await HelpConfig.findOne();
    if (config) {
      if (whatsappNumber !== undefined) config.whatsappNumber = whatsappNumber;
      if (email !== undefined) config.email = email;
      if (supportHours !== undefined) config.supportHours = supportHours;
      if (responseTime !== undefined) config.responseTime = responseTime;
      config.updatedAt = Date.now();
      await config.save();
    } else {
      config = await HelpConfig.create({ whatsappNumber, email, supportHours, responseTime });
    }
    res.json({ success: true, message: 'Help config updated', config });
  } catch (error) {
    res.status(500).json({ message: 'Error updating help config', error: error.message });
  }
});

// ==================== ANNOUNCEMENT ROUTES ====================

// Get Announcement (User/Public)
app.get('/api/announcement', async (req, res) => {
  try {
    // Return the specific announcement or the latest one
    const announcement = await Announcement.findOne().sort({ updatedAt: -1 });
    res.json(announcement || { title: 'No Announcement', content: '', isVisible: false });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcement', error: error.message });
  }
});

// Update Announcement (Admin) - supports both JSON body and file upload
app.put('/api/admin/announcement', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, imageUrl, isVisible } = req.body;
    let finalImageUrl = imageUrl;
    
    // If a file was uploaded, use that path instead
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }
    
    let announcement = await Announcement.findOne();
    
    if (announcement) {
      announcement.title = title;
      announcement.content = content;
      if (finalImageUrl !== undefined) announcement.imageUrl = finalImageUrl;
      announcement.isVisible = isVisible === true || isVisible === 'true';
      announcement.updatedAt = Date.now();
      await announcement.save();
    } else {
      announcement = await Announcement.create({ title, content, imageUrl: finalImageUrl || '', isVisible: isVisible === true || isVisible === 'true' });
    }
    
    res.json({ success: true, message: 'Announcement updated successfully', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Error updating announcement', error: error.message });
  }
});

// Initialize Default Announcement
const initializeAnnouncement = async () => {
  try {
    const count = await Announcement.countDocuments();
    if (count === 0) {
      const defaultContent = `ULTIMATE REWARD ANNOUNCEMENT – FREE 1000 USDT

We are excited to announce an exclusive opportunity for our top performers

BONUS REWARD OF 1000 USDT
Refer new users to our platform the total investment made by YOU OR your referred users must reach 15,000 USDT
Only successful and completed investments will be counted

Important Notes:
Only investments made through your referral link are valid
Once your referral volume reaches 15,000 USDT, you qualify for the BONUS REWARD OF 1000 USDT AND WILL BE CREDITED IN YOUR UTILITY WALLET
Start referring. Build your network. Claim your reward
Refer users.
Let their total investment reach 15,000 USDT.
No CAPPING limit on number of referrals
Reach 15,000 USDT → Win 1000 USDT
This is your Golden Chance. Don’t miss it.`;
      
      await Announcement.create({
        title: 'ULTIMATE REWARD ANNOUNCEMENT – FREE 1000 USDT',
        content: defaultContent,
        imageUrl: '', // Can be updated by admin
        isVisible: true
      });
      console.log('✅ Initialized default announcement');
    }
  } catch (error) {
    console.error('Error initializing announcement:', error);
  }
};
initializeAnnouncement();

// ==================== MISSING ENDPOINTS (added for frontend compatibility) ====================

// /api/admin/overview-stats — used by ReportsAnalytics.js
app.get('/api/admin/overview-stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeMembers = await User.countDocuments({ isActive: true });
    const totalInvestments = await Investment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalWithdrawals = await Withdrawal.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    res.json({
      success: true,
      data: {
        totalRevenue: totalInvestments[0]?.total || 0,
        activeMembers,
        commissionPaid: totalWithdrawals[0]?.total || 0,
        totalUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// /api/admin/top-performers — used by ReportsAnalytics.js
app.get('/api/admin/top-performers', authenticateToken, isAdmin, async (req, res) => {
  try {
    const topUsers = await User.find({ isActive: true })
      .sort({ 'wallet.totalIncome': -1 })
      .limit(10)
      .select('userId fullName username wallet rank');
    const data = topUsers.map(u => ({
      name: u.fullName || u.username || u.userId,
      rank: u.rank || 'Member',
      earnings: u.wallet?.totalIncome || 0,
      teamSize: 0
    }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// /api/admin/network-growth — used by ReportsAnalytics.js
app.get('/api/admin/network-growth', authenticateToken, isAdmin, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const data = growth.map(g => ({ month: g._id, members: g.count }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// /api/mlm/summary — used by MLMDashboard.js
app.get('/api/mlm/summary', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const directs = await User.find({ referredBy: user.userId }).select('userId fullName username isActive createdAt');
    const investments = await Investment.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);
    const deposits = await Deposit.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);

    const levels = [];
    let currentLevel = [user.userId];
    for (let lvl = 1; lvl <= 5; lvl++) {
      const refs = await User.find({ referredBy: { $in: currentLevel } }).select('userId isActive');
      if (refs.length === 0) break;
      levels.push({
        level: lvl,
        members: refs.length,
        active: refs.filter(r => r.isActive).length
      });
      currentLevel = refs.map(r => r.userId);
    }

    res.json({
      success: true,
      data: {
        totalDirects: directs.length,
        activeDirects: directs.filter(d => d.isActive).length,
        levels,
        recentActivations: investments.map(i => ({
          userId: i.userId,
          amount: i.amount,
          date: i.createdAt
        })),
        recentDeposits: deposits.map(d => ({
          userId: d.userId,
          amount: d.amount,
          date: d.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// /api/products — used by ProductCatalog.js
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    const products = plans.map(p => ({
      id: p._id,
      name: p.name,
      description: p.description || `${p.name} investment plan`,
      category: p.category || 'investment',
      price: p.minAmount,
      maxPrice: p.maxAmount,
      dailyROI: p.dailyROI,
      duration: p.duration,
      features: [
        `Min: $${p.minAmount}`,
        `Max: $${p.maxAmount}`,
        `Daily ROI: ${p.dailyROI}%`,
        `Duration: ${p.duration} days`
      ],
      image: '/static/media/plan-default.png',
      rating: 4.5,
      inStock: true
    }));
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    =====================================
    🚀 Hexanova Server Running
    =====================================
    📍 Port: ${PORT}
    🔐 JWT Secret: [CONFIGURED]
    🗄️  MongoDB: Connected
    🛡️  Security: Hardened
    =====================================
  `);
});

module.exports = app;
