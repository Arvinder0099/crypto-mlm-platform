
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Import Models
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Investment = require('./models/Investment');
const Withdrawal = require('./models/Withdrawal');
const ROI = require('./models/ROI');
const Referral = require('./models/Referral');
const ReferralBonus = require('./models/ReferralBonus');
const AdminNotification = require('./models/AdminNotification');

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin Middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      country, 
      referralCode 
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique user ID
    const userId = 'USR' + Date.now() + Math.floor(Math.random() * 1000);

    // Generate referral code
    const userReferralCode = firstName.substring(0, 3).toUpperCase() + 
                            Math.floor(Math.random() * 10000);

    // Find referrer if referral code provided
    let referrerId = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referrerId = referrer._id;
      }
    }

    // Create user
    const user = new User({
      userId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      country,
      referralCode: userReferralCode,
      referredBy: referrerId,
      role: 'user',
      status: 'active',
      balance: 0,
      totalInvested: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    });

    await user.save();

    // Create referral record if referred
    if (referrerId) {
      const referral = new Referral({
        referrerId,
        referredUserId: user._id,
        status: 'active',
        commission: 0,
      });
      await referral.save();
      
      // Get referrer details for notification
      const referrer = await User.findById(referrerId);
      
      // Create referral bonus record (10% bonus - will be credited when user makes first deposit)
      const referralBonus = new ReferralBonus({
        referrerId,
        referredUserId: user._id,
        bonusPercentage: 10, // 10% bonus
        bonusAmount: 0, // Will be calculated on first deposit
        status: 'pending',
        description: `Referral bonus for inviting ${firstName} ${lastName}`,
      });
      await referralBonus.save();
      
      // Create admin notification
      const adminNotification = new AdminNotification({
        type: 'referral_registration',
        title: 'New Referral Registration',
        message: `${firstName} ${lastName} registered using referral link of ${referrer.firstName} ${referrer.lastName}`,
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
      
      // Update referrer's direct referrals array
      await User.findByIdAndUpdate(referrerId, {
        $push: { directReferrals: user._id }
      });
      
      console.log(`✅ Referral registration: ${firstName} ${lastName} referred by ${referrer.firstName} ${referrer.lastName}`);
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        referralCode: user.referralCode,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
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

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is suspended or inactive' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        balance: user.balance,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// ==================== USER ROUTES ====================

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update User Profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, country, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, country, address },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get User Dashboard Stats
app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get active investments
    const activeInvestments = await Investment.find({
      userId: req.user.id,
      status: 'active',
    });

    // Get pending withdrawals
    const pendingWithdrawals = await Withdrawal.find({
      userId: req.user.id,
      status: 'pending',
    });

    // Get referrals
    const referrals = await Referral.find({
      referrerId: req.user.id,
    }).populate('referredUserId', 'firstName lastName email');

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      balance: user.balance,
      totalInvested: user.totalInvested,
      totalEarned: user.totalEarned,
      totalWithdrawn: user.totalWithdrawn,
      activeInvestments: activeInvestments.length,
      pendingWithdrawals: pendingWithdrawals.length,
      totalReferrals: referrals.length,
      recentTransactions,
      investments: activeInvestments,
      withdrawals: pendingWithdrawals,
      referrals,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

// ==================== INVESTMENT ROUTES ====================

// Get Investment Plans
app.get('/api/plans', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json({ plans });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
});

// Create Investment
app.post('/api/investments', authenticateToken, async (req, res) => {
  try {
    const { planId, amount, paymentMethod, transactionHash } = req.body;

    const user = await User.findById(req.user.id);

    // Validate
