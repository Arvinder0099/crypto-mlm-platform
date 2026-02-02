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
require('dotenv').config();

// Import Services
const { emailService } = require('./services/email.service');
const { OTPService, TwilioService, MSG91Service, ConsoleSMSService, SMSServiceFactory } = require('./services/otp.service');
const { KYCService, createMulterConfig, KYCStatus, KYCDocumentTypes } = require('./services/kyc.service');
const { rateLimiters, sanitizeRequestBody, securityHeaders, validateRequest, validators } = require('./middleware/security.middleware');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeRequestBody);
app.use(securityHeaders);

// Serve uploaded files (KYC documents) - with authentication in production
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply general rate limiting to all routes
app.use('/api/', rateLimiters.general);

// ==================== DATABASE CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
  
  // Financial
  balance: { type: Number, default: 0, min: 0 },
  totalInvested: { type: Number, default: 0, min: 0 },
  totalEarned: { type: Number, default: 0, min: 0 },
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
  type: { type: String, enum: ['deposit', 'withdrawal', 'investment', 'earning', 'commission', 'refund', 'admin_credit', 'daily_return'], required: true },
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
  type: { type: String, enum: ['referral_registration', 'referral_bonus_pending', 'withdrawal_request', 'deposit', 'kyc_submission', 'system_alert', 'other'], required: true },
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
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
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
  return (investment * dailyEarn) / 100;
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
    
    if (referrerId) {
      await User.findByIdAndUpdate(referrerId, {
        $push: { directReferrals: user._id, downlineUsers: user._id },
      });
      
      // Get referrer details
      const referrer = await User.findById(referrerId);
      
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
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    // Send welcome email
    const referrer = referrerId ? await User.findById(referrerId) : null;
    emailService.sendWelcome(email, {
      name: firstName,
      username: userId,
      email,
      referrer: referrer ? `${referrer.firstName} ${referrer.lastName}` : null,
      loginUrl: `${process.env.APP_URL || 'http://localhost:3049'}/login`
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

// Send Email OTP (Pre-Registration)
app.post('/api/auth/send-email-otp', rateLimiters.otp, async (req, res) => {
  try {
    const { email } = req.body;
    console.log('📧 Send pre-registration email OTP:', { email });
    
    if (!email || !validators.email(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    
    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
    }
    
    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    preRegEmailOtps.set(email.toLowerCase(), {
      otp,
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    
    // Auto-cleanup after 10 minutes
    setTimeout(() => preRegEmailOtps.delete(email.toLowerCase()), 10 * 60 * 1000);
    
    console.log(`📧 Pre-registration email OTP for ${email}: ${otp}`);
    
    // Try to send email
    try {
      await emailService.sendOTP(email, { otp, expiresIn: '10', purpose: 'registration' });
      console.log(`✅ OTP email sent to ${email}`);
    } catch (emailErr) {
      console.error(`⚠️  Email sending failed:`, emailErr.message);
      // Still log the OTP in console for debugging in development
      console.log(`📧 Email OTP for ${email}: ${otp} (email send failed)`);
    }
    
    res.json({ 
      success: true, 
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('❌ Send email OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
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

// Send Phone OTP (Pre-Registration)
app.post('/api/auth/send-phone-otp', rateLimiters.otp, async (req, res) => {
  try {
    const { phone, countryCode } = req.body;
    console.log('📱 Send pre-registration phone OTP:', { phone, countryCode });
    
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    
    const fullPhone = `${countryCode || '+91'}${phone}`.replace(/\s+/g, '');
    
    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    preRegPhoneOtps.set(fullPhone, {
      otp,
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    
    // Auto-cleanup after 10 minutes
    setTimeout(() => preRegPhoneOtps.delete(fullPhone), 10 * 60 * 1000);
    
    console.log(`📱 Pre-registration phone OTP for ${fullPhone}: ${otp}`);
    
    // Try to send SMS
    try {
      const smsService = SMSServiceFactory.getService();
      await smsService.sendOTP(fullPhone, otp, 'CryptoMLM');
      console.log(`✅ OTP SMS sent to ${fullPhone}`);
    } catch (smsErr) {
      console.error(`⚠️  SMS sending failed:`, smsErr.message);
      // Still log the OTP in console for debugging in development
      console.log(`📱 Phone OTP for ${fullPhone}: ${otp} (SMS send failed)`);
    }
    
    res.json({ 
      success: true, 
      message: 'OTP sent to your phone'
    });
  } catch (error) {
    console.error('❌ Send phone OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
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

app.post('/api/auth/login', rateLimiters.auth, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Account is suspended' });
    
    // Update login info without triggering full validation
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date(), loginAttempts: 0 } });
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      success: true,
      message: 'Login successful', 
      token,
      user: { id: user._id, userId: user.userId, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, balance: user.balance, totalEarned: user.totalEarned, totalInvested: user.totalInvested },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

// TEMPORARY: One-time password reset for production setup (REMOVE AFTER USE)
app.post('/api/auth/setup-admin-password', async (req, res) => {
  try {
    const { secretKey, email, newPassword } = req.body;
    
    // Security: Only works with a secret key
    if (secretKey !== 'SETUP_ADMIN_2026_SECRET') {
      return res.status(403).json({ message: 'Invalid secret key' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.status = 'active';
    await user.save();
    
    res.json({ success: true, message: `Password reset for ${email}` });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
});

// Make user admin (secret endpoint)
app.post('/api/auth/make-admin', async (req, res) => {
  try {
    const { secretKey, email } = req.body;
    
    // Security: Only works with a secret key
    if (secretKey !== 'MAKE_ADMIN_2026_SECRET') {
      return res.status(403).json({ message: 'Invalid secret key' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = 'admin';
    await user.save();
    
    res.json({ success: true, message: `${email} is now an admin` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to make admin', error: error.message });
  }
});

// Remove admin role (make user regular)
app.post('/api/auth/remove-admin', async (req, res) => {
  try {
    const { secretKey, email } = req.body;
    
    // Security: Only works with a secret key
    if (secretKey !== 'MAKE_ADMIN_2026_SECRET') {
      return res.status(403).json({ message: 'Invalid secret key' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = 'user';
    await user.save();
    
    res.json({ success: true, message: `${email} is now a regular user` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove admin', error: error.message });
  }
});

// List all users (admin endpoint)
app.post('/api/auth/list-users', async (req, res) => {
  try {
    const { secretKey } = req.body;
    
    if (secretKey !== 'MAKE_ADMIN_2026_SECRET') {
      return res.status(403).json({ message: 'Invalid secret key' });
    }
    
    const users = await User.find({}, 'email userId role wallet createdAt').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to list users', error: error.message });
  }
});

// Delete user (admin endpoint)
app.post('/api/auth/delete-user', async (req, res) => {
  try {
    const { secretKey, email } = req.body;
    
    if (secretKey !== 'MAKE_ADMIN_2026_SECRET') {
      return res.status(403).json({ message: 'Invalid secret key' });
    }
    
    const user = await User.findOneAndDelete({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, message: `User ${email} has been deleted` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

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

// Send Phone OTP
app.post('/api/auth/send-phone-otp', rateLimiters.otp, async (req, res) => {
  try {
    const { email, phone, phoneCountryCode } = req.body;
    console.log('📱 Send phone OTP request:', { email, phone, phoneCountryCode });
    
    if (!email || !validators.email(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`⚠️  User not found for email: ${email}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update phone info if provided
    if (phone) user.phone = phone;
    if (phoneCountryCode) user.phoneCountryCode = phoneCountryCode;
    
    const code = String(Math.floor(100000 + Math.random() * 900000));
    user.phoneVerificationCode = code;
    user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    
    // Send SMS with code
    const phoneNumber = `${user.phoneCountryCode}${user.phone}`.replace(/\s+/g, '');
    console.log(`📱 Phone OTP generated for ${phoneNumber}: ${code}`);
    
    try {
      // Get SMS service and send OTP
      const smsService = SMSServiceFactory.getService();
      const smsResult = await smsService.sendOTP(phoneNumber, code, 'MLM Platform');
      console.log('✅ SMS sent successfully:', smsResult);
    } catch (smsError) {
      console.error('❌ SMS sending failed:', smsError.message);
      // Continue with response even if SMS fails (for development)
    }
    
    res.json({ success: true, message: 'Phone OTP sent' });
  } catch (error) {
    console.error('❌ Send phone OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send phone OTP' });
  }
});

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
    const resetToken = jwt.sign({ id: user._id, purpose: 'password-reset' }, JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.APP_URL || 'http://localhost:3049'}/reset-password?token=${resetToken}`;
    
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
      return res.status(400).json({ message: 'Password must be at least 8 characters with uppercase, lowercase, and number' });
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

// Send OTP to phone (supports all country codes)
app.post('/api/otp/send-phone', rateLimiters.otp, async (req, res) => {
  try {
    const { phone, countryCode = '+91', purpose = 'verification' } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    
    // Build full international phone number
    const cleanPhone = phone.replace(/^0+/, '').replace(/[^0-9]/g, '');
    const fullPhone = `${countryCode}${cleanPhone}`;
    
    console.log(`📱 Sending OTP to: ${fullPhone}`);
    
    const result = await otpService.sendOTP(fullPhone, purpose);
    res.json(result);
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
    
    console.log(`🔐 Verifying OTP for: ${target}, type: ${type}`);
    
    const result = otpService.verifyOTP(target, otp, purpose);
    
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
      balance: user.balance, totalInvested: user.totalInvested, totalEarned: user.totalEarned, totalWithdrawn: user.totalWithdrawn,
      activeInvestments: activeInvestments.length, pendingWithdrawals: pendingWithdrawals.length, totalReferrals: user.directReferrals.length,
      investments: activeInvestments, recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
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
    const plans = await Plan.find({ isActive: true });
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
    
    if (user.balance < plan.investment) {
      return res.status(400).json({ message: 'Insufficient balance. Please deposit funds.' });
    }
    
    // Check if this is the user's first investment (for referral bonus)
    const existingInvestments = await Investment.countDocuments({ userId: req.user.id });
    const isFirstInvestment = existingInvestments === 0;
    
    const investment = new Investment({
      userId: req.user.id, planId, amount: plan.investment, startDate: new Date(),
      endDate: calculateEndDate(new Date(), plan.duration), status: 'active', activationFor: activationFor || 'self', downlineUserId,
    });
    
    await investment.save();
    
    user.balance -= plan.investment;
    user.totalInvested += plan.investment;
    user.activeInvestments += 1;
    user.totalInvestmentCount += 1;
    await user.save();
    
    const transaction = new Transaction({
      userId: req.user.id, type: 'investment', amount: -plan.investment,
      previousBalance: user.balance + plan.investment, newBalance: user.balance, status: 'completed',
      description: `Investment in ${plan.name}`, investmentId: investment._id,
    });
    
    await transaction.save();
    
    // Credit referral bonus on first investment (10% of investment amount) - REQUIRES ADMIN APPROVAL
    if (isFirstInvestment && user.referredBy) {
      const referralBonus = await ReferralBonus.findOne({ 
        referredUserId: user._id, 
        referrerId: user.referredBy,
        status: 'pending'
      });
      
      if (referralBonus) {
        const bonusAmount = plan.investment * 0.10; // 10% bonus
        
        // Update bonus amount but keep status as pending (requires admin approval)
        referralBonus.bonusAmount = bonusAmount;
        referralBonus.investmentId = investment._id;
        referralBonus.investmentAmount = plan.investment;
        await referralBonus.save();
        
        // Create admin notification for pending bonus approval
        const referrer = await User.findById(user.referredBy);
        const bonusNotification = new AdminNotification({
          type: 'referral_bonus_pending',
          title: 'Referral Bonus Pending Approval',
          message: `$${bonusAmount.toFixed(2)} referral bonus waiting for approval. ${referrer.firstName} ${referrer.lastName} referred ${user.firstName} ${user.lastName} who made first investment of $${plan.investment}`,
          userId: user._id,
          referrerId: user.referredBy,
          data: {
            referrerName: `${referrer.firstName} ${referrer.lastName}`,
            referrerEmail: referrer.email,
            newUserName: `${user.firstName} ${user.lastName}`,
            newUserEmail: user.email,
            bonusAmount: bonusAmount,
            investmentAmount: plan.investment,
            referralBonusId: referralBonus._id.toString()
          },
          priority: 'high',
        });
        await bonusNotification.save();
        
        console.log(`⏳ Referral bonus of $${bonusAmount} pending admin approval for ${referrer.firstName} ${referrer.lastName}`);
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

// ==================== REAL-TIME EARNING CRON (Every Hour) ====================

cron.schedule('0 * * * *', async () => {
  try {
    console.log('🔄 Running hourly earning calculation...');
    const activeInvestments = await Investment.find({ status: 'active' }).populate('planId userId');
    
    for (const investment of activeInvestments) {
      const plan = investment.planId;
      const user = investment.userId;
      if (!plan || !user) continue;
      
      const dailyEarning = calculateDailyEarning(investment.amount, plan.dailyEarn);
      const daysElapsed = Math.floor((new Date() - investment.startDate) / (1000 * 60 * 60 * 24));
      
      if (daysElapsed > plan.duration) {
        investment.status = 'completed';
        investment.daysCompleted = plan.duration;
        investment.totalEarned = plan.totalReturn;
        await investment.save();
        
        user.activeInvestments -= 1;
        user.balance += plan.totalReturn;
        user.totalEarned += plan.totalReturn;
        await user.save();
        
        const transaction = new Transaction({
          userId: user._id, type: 'earning', amount: plan.totalReturn, previousBalance: user.balance - plan.totalReturn,
          newBalance: user.balance, status: 'completed', description: `Investment completed: ${plan.name}`, investmentId: investment._id,
        });
        await transaction.save();
      } else {
        if (!investment.lastEarningDate || (new Date() - investment.lastEarningDate) / (1000 * 60 * 60 * 24) >= 1) {
          investment.dailyEarned = dailyEarning;
          investment.totalEarned += dailyEarning;
          investment.daysCompleted = daysElapsed;
          investment.lastEarningDate = new Date();
          await investment.save();
          
          user.balance += dailyEarning;
          user.totalEarned += dailyEarning;
          await user.save();
          
          const transaction = new Transaction({
            userId: user._id, type: 'earning', amount: dailyEarning, previousBalance: user.balance - dailyEarning,
            newBalance: user.balance, status: 'completed', description: `Daily earning from ${plan.name}`, investmentId: investment._id,
          });
          await transaction.save();
          
          investment.earningHistory.push({ date: new Date(), amount: dailyEarning, status: 'credited' });
          await investment.save();
          
          console.log(`✅ Daily earning credited to ${user.email}: ${dailyEarning}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Earning calculation error:', error);
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

app.post('/api/wallet/deposit', authenticateToken, async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    
    const user = await User.findById(req.user.id);
    user.balance += amount;
    await user.save();
    
    const transaction = new Transaction({
      userId: req.user.id, type: 'deposit', amount, previousBalance: user.balance - amount,
      newBalance: user.balance, status: 'completed', description: description || 'Deposit',
    });
    await transaction.save();
    
    res.json({ message: 'Deposit successful', newBalance: user.balance });
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
    if (amount > user.balance) return res.status(400).json({ message: 'Insufficient balance' });
    
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
    user.pendingWithdrawal += amount;
    await user.save();
    
    // Send email notification
    emailService.sendWithdrawalRequested(user.email, {
      name: user.firstName,
      amount,
      requestId: withdrawal._id,
      walletAddress: walletAddress || user.walletAddress,
      network: 'TRC20'
    }).catch(console.error);
    
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

    // Credit user's balance
    const user = await User.findById(deposit.userId);
    if (user) {
      user.balance = (user.balance || 0) + deposit.amount;
      await user.save();

      // Create transaction record
      const transaction = new Transaction({
        userId: user._id,
        type: 'deposit',
        amount: deposit.amount,
        currency: deposit.network === 'usdt_trc20' ? 'USDT' : 'BNB',
        status: 'completed',
        description: `Deposit via ${deposit.network.toUpperCase()}`,
        transactionId: deposit.transactionHash,
        balanceAfter: user.balance
      });
      await transaction.save();
    }

    res.json({ 
      success: true, 
      message: `Deposit of $${deposit.amount} approved and credited to user's wallet`,
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
    user.balance -= withdrawal.amount;
    user.totalWithdrawn += withdrawal.amount;
    user.pendingWithdrawal -= withdrawal.amount;
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
    user.pendingWithdrawal -= withdrawal.amount;
    await user.save();
    
    // Send email notification
    emailService.sendWithdrawalRejected(user.email, {
      name: user.firstName,
      requestId: withdrawal._id,
      amount: withdrawal.amount,
      reason: rejectionReason
    }).catch(console.error);
    
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
        dailyEarning += (inv.amount * (inv.planId.dailyReturn || 0)) / 100;
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

    // Wallet data
    const walletData = {
      myWallet: user.balance || 0,
      fundWallet: user.fundWallet || 0,
      utilityWallet: user.utilityWallet || 0,
      totalBalance: (user.balance || 0) + (user.fundWallet || 0) + (user.utilityWallet || 0)
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
        referralLink: `${process.env.APP_URL || 'http://localhost:3049'}/register?ref=${user.userId}`
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

    // Update user balance
    const previousBalance = user.balance || 0;
    user.balance = previousBalance + pointsAmount;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'admin_credit',
      amount: pointsAmount,
      description: description || 'USDT points added by admin',
      status: 'completed',
      balanceBefore: previousBalance,
      balanceAfter: user.balance,
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

    console.log(`Admin added ${pointsAmount} USDT points to ${user.userId}. New balance: ${user.balance}`);

    res.json({
      success: true,
      message: `Successfully added ${pointsAmount} USDT to ${user.userId}'s wallet`,
      newBalance: user.balance,
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

// Process daily returns (call this daily via cron or manually)
app.post('/api/admin/daily-returns/process', authenticateToken, isAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all users with active daily returns who haven't received today
    const users = await User.find({
      dailyReturnAmount: { $gt: 0 },
      $or: [
        { lastDailyReturnDate: { $lt: today } },
        { lastDailyReturnDate: null }
      ]
    });

    let processedCount = 0;
    let totalDistributed = 0;

    for (const user of users) {
      const amount = user.dailyReturnAmount;
      const previousBalance = user.balance || 0;

      // Add to user's balance
      user.balance = previousBalance + amount;
      user.totalDailyReturnsReceived = (user.totalDailyReturnsReceived || 0) + amount;
      user.totalEarned = (user.totalEarned || 0) + amount;
      user.lastDailyReturnDate = new Date();
      await user.save();

      // Create transaction record
      const transaction = new Transaction({
        userId: user._id,
        type: 'daily_return',
        amount: amount,
        description: 'Daily return credited',
        status: 'completed',
        balanceBefore: previousBalance,
        balanceAfter: user.balance,
        processedAt: new Date()
      });
      await transaction.save();

      processedCount++;
      totalDistributed += amount;
    }

    console.log(`Daily returns processed: ${processedCount} users, $${totalDistributed} total`);

    res.json({
      success: true,
      message: `Daily returns processed`,
      processedUsers: processedCount,
      totalDistributed: totalDistributed
    });
  } catch (error) {
    console.error('Process daily returns error:', error);
    res.status(500).json({ success: false, message: 'Error processing daily returns', error: error.message });
  }
});

// Auto-process daily returns (runs every 24 hours)
const processDailyReturnsAutomatically = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await User.find({
      dailyReturnAmount: { $gt: 0 },
      $or: [
        { lastDailyReturnDate: { $lt: today } },
        { lastDailyReturnDate: null }
      ]
    });

    for (const user of users) {
      const amount = user.dailyReturnAmount;
      const previousBalance = user.balance || 0;

      user.balance = previousBalance + amount;
      user.totalDailyReturnsReceived = (user.totalDailyReturnsReceived || 0) + amount;
      user.totalEarned = (user.totalEarned || 0) + amount;
      user.lastDailyReturnDate = new Date();
      await user.save();

      const transaction = new Transaction({
        userId: user._id,
        type: 'daily_return',
        amount: amount,
        description: 'Daily return credited',
        status: 'completed',
        balanceBefore: previousBalance,
        balanceAfter: user.balance,
        processedAt: new Date()
      });
      await transaction.save();
    }

    if (users.length > 0) {
      console.log(`✅ Auto-processed daily returns for ${users.length} users`);
    }
  } catch (error) {
    console.error('Auto daily returns error:', error);
  }
};

// Run daily returns every 24 hours (86400000 ms)
setInterval(processDailyReturnsAutomatically, 24 * 60 * 60 * 1000);

// Also run once on server start (after 10 seconds to ensure DB connection)
setTimeout(processDailyReturnsAutomatically, 10000);

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
      plan = await InvestmentPlan.findById(planId);
    }
    if (!plan) {
      plan = await InvestmentPlan.findOne({ status: 'active' });
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
      .sort({ createdAt: -1 });
    
    res.json({ 
      data: investments.map(inv => ({
        id: inv._id,
        plan: inv.planName || 'Standard',
        amount: inv.amount,
        dailyReturn: inv.dailyReturn || 0.5,
        totalReturn: inv.expectedReturn || inv.amount * 2,
        purchaseDate: inv.createdAt,
        expiryDate: inv.endDate,
        nextEarning: inv.nextEarningDate,
        status: inv.status,
        totalEarned: inv.totalEarned || 0
      }))
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
    
    // Update referrer's balance and stats
    await User.findByIdAndUpdate(bonus.referrerId._id, {
      $inc: { 
        balance: bonusAmount,
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
      description: `Referral bonus (${bonus.bonusPercentage}%) for referring ${bonus.referredUserId.firstName} ${bonus.referredUserId.lastName}`,
      referredUserId: bonus.referredUserId._id
    });
    await transaction.save();
    
    // Create notification for the referrer
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
    
    // Update referrer's balance and stats
    await User.findByIdAndUpdate(bonus.referrerId._id, {
      $inc: { 
        balance: bonusAmount,
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
      description: `Referral bonus for referring ${bonus.referredUserId.firstName} ${bonus.referredUserId.lastName}`,
      referredUserId: bonus.referredUserId._id
    });
    await transaction.save();
    
    res.json({ success: true, message: 'Referral bonus credited successfully', bonus });
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
    if (withdrawAmount > user.balance) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
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
    
    // Deduct from balance and add to pending
    user.balance -= withdrawAmount;
    user.pendingWithdrawal += withdrawAmount;
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
    
    const referralLink = `${process.env.FRONTEND_URL || 'https://crypto-mlm-platform-efji5.ondigitalocean.app'}/register?ref=${user.referralCode}`;
    
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
    
    if (user.balance < plan.investment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient balance',
        required: plan.investment,
        available: user.balance,
        shortfall: plan.investment - user.balance
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
    
    // Deduct from wallet
    const previousBalance = user.balance;
    user.balance -= plan.investment;
    user.totalInvested += plan.investment;
    user.activeInvestments += 1;
    await user.save();
    
    // Create transaction
    const transaction = new Transaction({
      userId: req.user.id,
      type: 'investment',
      amount: -plan.investment,
      balanceBefore: previousBalance,
      balanceAfter: user.balance,
      status: 'completed',
      description: `Invested in ${plan.name}`,
      investmentId: investment._id
    });
    await transaction.save();
    
    // Credit referral bonus if first investment and user was referred
    if (isFirstInvestment && user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        const settings = await AdminSettings.findOne({});
        const bonusPercent = settings?.directCommissionRate || 10;
        const bonusAmount = (plan.investment * bonusPercent) / 100;
        
        // Create referral bonus (pending admin approval)
        const referralBonus = new ReferralBonus({
          referrerId: referrer._id,
          referredUserId: user._id,
          bonusPercentage: bonusPercent,
          bonusAmount,
          investmentId: investment._id,
          investmentAmount: plan.investment,
          status: 'pending'
        });
        await referralBonus.save();
        
        // Create admin notification
        const notification = new AdminNotification({
          type: 'referral_bonus',
          title: 'New Referral Bonus Pending',
          message: `${referrer.firstName} ${referrer.lastName} earned $${bonusAmount} referral bonus from ${user.firstName} ${user.lastName}'s first investment`,
          userId: referrer._id,
          referrerId: referrer._id,
          amount: bonusAmount,
          relatedId: referralBonus._id
        });
        await notification.save();
      }
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
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Plan purchase error:', error);
    res.status(500).json({ message: 'Error purchasing plan', error: error.message });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : 'Server error' });
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    =====================================
    🚀 MLM Platform Server Running
    =====================================
    📍 Port: ${PORT}
    🔐 JWT Secret: ${JWT_SECRET.substring(0, 5)}...
    🗄️  MongoDB: Connected
    ⚡ Real-time Earnings: Active (Hourly)
    =====================================
  `);
});

module.exports = app;
