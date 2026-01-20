/**
 * Create Demo Users for MLM Platform
 * Run this script to create demo admin and user accounts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const allowDemoSeed = process.env.ALLOW_DEMO_SEED === 'true';
if (!allowDemoSeed) {
  console.log('⚠️  Demo user creation is disabled. Set ALLOW_DEMO_SEED=true to run this script.');
  process.exit(0);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema (same as server)
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  country: String,
  address: String,
  referralCode: { type: String, unique: true, required: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  directReferrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downlineUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
  kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  balance: { type: Number, default: 0, min: 0 },
  totalInvested: { type: Number, default: 0, min: 0 },
  totalEarned: { type: Number, default: 0, min: 0 },
  totalWithdrawn: { type: Number, default: 0, min: 0 },
  totalCommissions: { type: Number, default: 0, min: 0 },
  rank: { type: String, default: 'Bronze' },
  walletAddress: String,
  loginAttempts: { type: Number, default: 0 },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createDemoUsers() {
  try {
    console.log('🔄 Creating demo users...\n');

    // Check if demo users exist
    const existingAdmin = await User.findOne({ email: 'admin@demo.com' });
    const existingUser = await User.findOne({ email: 'user@demo.com' });

    // Create Admin
    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        userId: 'ADM001',
        firstName: 'Admin',
        lastName: 'Demo',
        email: 'admin@demo.com',
        password: adminPassword,
        phone: '+1234567890',
        country: 'USA',
        referralCode: 'ADMIN001',
        role: 'admin',
        status: 'active',
        kycStatus: 'approved',
        balance: 10000,
        totalEarned: 5000,
        rank: 'Diamond',
      });
      await admin.save();
      console.log('✅ Admin account created:');
      console.log('   Email: admin@demo.com');
      console.log('   Password: admin123\n');
    } else {
      console.log('ℹ️  Admin account already exists (admin@demo.com)\n');
    }

    // Create Demo User
    if (!existingUser) {
      const userPassword = await bcrypt.hash('user123', 10);
      const user = new User({
        userId: 'USR001',
        firstName: 'Demo',
        lastName: 'User',
        email: 'user@demo.com',
        password: userPassword,
        phone: '+1987654321',
        country: 'UK',
        referralCode: 'DEMO001',
        role: 'user',
        status: 'active',
        kycStatus: 'approved',
        balance: 1000,
        totalInvested: 500,
        totalEarned: 100,
        rank: 'Silver',
      });
      await user.save();
      console.log('✅ Demo user account created:');
      console.log('   Email: user@demo.com');
      console.log('   Password: user123\n');
    } else {
      console.log('ℹ️  Demo user already exists (user@demo.com)\n');
    }

    console.log('════════════════════════════════════════');
    console.log('  DEMO CREDENTIALS');
    console.log('════════════════════════════════════════');
    console.log('  ADMIN LOGIN:');
    console.log('    Email:    admin@demo.com');
    console.log('    Password: admin123');
    console.log('');
    console.log('  USER LOGIN:');
    console.log('    Email:    user@demo.com');
    console.log('    Password: user123');
    console.log('════════════════════════════════════════\n');

    console.log('✅ Demo users ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo users:', error.message);
    process.exit(1);
  }
}

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connected\n');
  createDemoUsers();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
