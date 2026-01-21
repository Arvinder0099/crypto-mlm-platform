/**
 * Create Admin User for Production
 * Run this locally to create admin in MongoDB Atlas
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://arvindersaini2523_db_user:wB1phvIEEVXjlDp2@crypto-mlm-cluster.n5u0d7k.mongodb.net/crypto-mlm?retryWrites=true&w=majority';

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, lowercase: true },
  phone: String,
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, default: 'active' },
  referralCode: String,
  walletBalance: { type: Number, default: 0 },
  isEmailVerified: { type: Boolean, default: true },
  isPhoneVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas!\n');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@crypto-mlm.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Email: admin@crypto-mlm.com');
      console.log('   Resetting password to: Admin@123');
      
      // Reset password
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('✅ Password reset successfully!\n');
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      const admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@crypto-mlm.com',
        phone: '+911234567890',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        referralCode: 'ADMIN001',
        walletBalance: 0,
        isEmailVerified: true,
        isPhoneVerified: true,
      });

      await admin.save();
      console.log('✅ Admin user created successfully!\n');
    }

    console.log('═══════════════════════════════════════');
    console.log('   ADMIN LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('   Email:    admin@crypto-mlm.com');
    console.log('   Password: Admin@123');
    console.log('═══════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
