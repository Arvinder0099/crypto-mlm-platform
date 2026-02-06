const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crypto-mlm';

// Use the EXACT same schema as server-complete.js
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  country: String,
  referralCode: { type: String, unique: true, required: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  directReferrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downlineUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
  kycStatus: { type: String, default: 'not_submitted' },
  phoneVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  balance: { type: Number, default: 0, min: 0 },
  myWallet: { type: Number, default: 0, min: 0 },
  fundWallet: { type: Number, default: 0, min: 0 },
  utilityWallet: { type: Number, default: 0, min: 0 },
  totalInvested: { type: Number, default: 0, min: 0 },
  totalEarned: { type: Number, default: 0, min: 0 },
  todayEarning: { type: Number, default: 0, min: 0 },
  totalWithdrawn: { type: Number, default: 0, min: 0 },
  walletAddress: String,
  walletType: { type: String, enum: ['usdt_trc20', 'bnb_bep20'], default: 'usdt_trc20' },
  activatedAt: Date,
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function fixTempUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'arvindersaini2523@gmail.com';
    const plainPassword = '123456';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Verify bcrypt works correctly
    const testMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(`🔐 bcrypt self-test: ${testMatch ? 'PASS' : 'FAIL'}`);

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      console.log(`📋 Found user: ${user.email} (status: ${user.status}, role: ${user.role})`);
      console.log(`📋 Current password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'MISSING'}`);
      
      // Test current password
      if (user.password) {
        const currentMatch = await bcrypt.compare(plainPassword, user.password);
        console.log(`🔐 Current password matches '123456': ${currentMatch}`);
      }

      // Force update password and status using raw MongoDB (bypass mongoose validation)
      await User.collection.updateOne(
        { email },
        { 
          $set: { 
            password: hashedPassword, 
            status: 'active',
            role: 'user',
            updatedAt: new Date()
          } 
        }
      );
      console.log(`✅ Password reset and status set to active`);

      // Verify the update
      const updated = await User.findOne({ email });
      const verifyMatch = await bcrypt.compare(plainPassword, updated.password);
      console.log(`✅ Verification after update - password matches: ${verifyMatch}, status: ${updated.status}`);
    } else {
      console.log('❌ User not found - creating new user...');
      
      // Generate unique referral code
      const referralCode = 'REF-TEMP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newUser = new User({
        userId: 'TEMP-USER-0001',
        firstName: 'Temp',
        lastName: 'User',
        email,
        password: hashedPassword,
        phone: '+919999999999',
        country: 'India',
        referralCode,
        role: 'user',
        status: 'active',
        emailVerified: true,
        phoneVerified: true,
      });
      
      await newUser.save();
      console.log(`✅ Created new user: ${email} with password: ${plainPassword}`);
    }

    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${plainPassword}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixTempUser();
