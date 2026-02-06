const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const userSchema = new mongoose.Schema({
      userId: String,
      firstName: String,
      lastName: String,
      email: { type: String, lowercase: true },
      password: String,
      phone: String,
      country: String,
      referralCode: String,
      role: String,
      status: String,
      balance: { type: Number, default: 0 },
      totalInvested: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }, { strict: false });
    
    const User = mongoose.model('User', userSchema);
    
    // Delete existing user if exists
    await User.deleteOne({ email: 'arvindersaini2523@gmail.com' });
    console.log('Cleared any existing user with this email');
    
    // Create new admin
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const adminUser = new User({
      userId: 'ARV' + Date.now(),
      firstName: 'Arvinder',
      lastName: 'Saini',
      email: 'arvindersaini2523@gmail.com',
      password: hashedPassword,
      phone: '+919876543210',
      country: 'India',
      referralCode: 'ARVREF' + Date.now(),
      role: 'admin',
      status: 'active',
      balance: 0,
      totalInvested: 0,
      totalEarned: 0
    });
    
    await adminUser.save();
    
    console.log('');
    console.log('=================================');
    console.log('✅ Admin Account Created!');
    console.log('=================================');
    console.log('Email: arvindersaini2523@gmail.com');
    console.log('Password: 123456');
    console.log('Role: admin');
    console.log('=================================');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
