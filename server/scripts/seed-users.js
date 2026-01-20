const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm');
    console.log('Connected to MongoDB');

    const userSchema = new mongoose.Schema({
      userId: String,
      firstName: String,
      lastName: String,
      email: { type: String, unique: true, lowercase: true },
      password: String,
      phone: String,
      referralCode: String,
      role: { type: String, default: 'user' },
      status: { type: String, default: 'active' },
      balance: { type: Number, default: 0 },
      totalInvested: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      totalWithdrawn: { type: Number, default: 0 },
      kycStatus: { type: String, default: 'not_submitted' },
      kycLevel: { type: Number, default: 0 },
      directReferrals: [],
      downlineUsers: [],
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Create Admin
    const adminExists = await User.findOne({ email: 'admin@mlm.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await User.create({
        userId: 'ADM' + Date.now(),
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@mlm.com',
        password: hashedPassword,
        referralCode: 'ADMIN001',
        role: 'admin',
        status: 'active',
        balance: 10000,
        kycStatus: 'approved',
        kycLevel: 3
      });
      console.log('✅ Admin created: admin@mlm.com / Admin123!');
    } else {
      console.log('Admin already exists');
    }

    // Create Test User
    const userExists = await User.findOne({ email: 'user@mlm.com' });
    if (!userExists) {
      const hashedPassword = await bcrypt.hash('User123!', 10);
      await User.create({
        userId: 'USR' + Date.now(),
        firstName: 'Test',
        lastName: 'User',
        email: 'user@mlm.com',
        password: hashedPassword,
        referralCode: 'TEST001',
        role: 'user',
        status: 'active',
        balance: 1000,
        kycStatus: 'approved',
        kycLevel: 2
      });
      console.log('✅ Test user created: user@mlm.com / User123!');
    } else {
      console.log('Test user already exists');
    }

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedUsers();
