const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const allowDemoSeed = process.env.ALLOW_DEMO_SEED === 'true';

if (!allowDemoSeed) {
  console.log('⚠️  Demo account seeding is disabled. Set ALLOW_DEMO_SEED=true to run this script.');
  process.exit(0);
}

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/crypto-mlm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

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
  referralCode: { type: String, unique: true, required: true },
  referredBy: mongoose.Schema.Types.ObjectId,
  directReferrals: [mongoose.Schema.Types.ObjectId],
  downlineUsers: [mongoose.Schema.Types.ObjectId],
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
  balance: { type: Number, default: 0, min: 0 },
  totalInvested: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Demo credentials
const demoUsers = [
  {
    userId: 'ADMIN001',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@demo.com',
    password: '123456',
    phone: '+1234567890',
    country: 'USA',
    referralCode: 'ADMIN001',
    role: 'admin',
    status: 'active',
    balance: 10000,
    totalInvested: 5000,
    totalEarned: 500
  },
  {
    userId: 'USER001',
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@demo.com',
    password: '123456',
    phone: '+1234567891',
    country: 'USA',
    referralCode: 'DEMO001',
    role: 'user',
    status: 'active',
    balance: 1000,
    totalInvested: 500,
    totalEarned: 50
  },
  {
    userId: 'TEST001',
    firstName: 'Test',
    lastName: 'Account',
    email: 'test@demo.com',
    password: '123456',
    phone: '+1234567892',
    country: 'USA',
    referralCode: 'TEST001',
    role: 'user',
    status: 'active',
    balance: 2000,
    totalInvested: 1000,
    totalEarned: 100
  }
];

async function createDemoUsers() {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create demo users with hashed passwords
    const createdUsers = [];
    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push({
        email: user.email,
        plainPassword: userData.password,
        role: user.role
      });
      console.log(`✅ Created: ${user.email} (Password: ${userData.password})`);
    }

    console.log('\n========================================');
    console.log('📝 DEMO CREDENTIALS');
    console.log('========================================');
    createdUsers.forEach(user => {
      console.log(`📧 ${user.email}`);
      console.log(`🔑 Password: ${user.plainPassword}`);
      console.log(`👤 Role: ${user.role}`);
      console.log('---');
    });
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo users:', error.message);
    process.exit(1);
  }
}

createDemoUsers();
