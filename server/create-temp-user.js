const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm';

const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const User = mongoose.model('User', userSchema);

const generateReferralCode = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TEMP${rand}`;
};

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const email = 'arvindersaini2523@gmail.com';
    const plainPassword = '123456';
    const userId = 'TEMP-USER-0001';
    const now = new Date();

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const existing = await User.findOne({ email });
    if (existing) {
      await User.updateOne(
        { email },
        {
          $set: {
            userId,
            firstName: existing.firstName || 'Temp',
            lastName: existing.lastName || 'User',
            password: hashedPassword,
            role: 'user',
            status: 'active',
            emailVerified: true,
            phoneVerified: false,
            updatedAt: now,
          },
          $setOnInsert: {
            referralCode: existing.referralCode || generateReferralCode(),
            createdAt: now,
          },
        },
        { upsert: true }
      );
      console.log('Updated existing temp user:', email);
    } else {
      await User.create({
        userId,
        firstName: 'Temp',
        lastName: 'User',
        email,
        password: hashedPassword,
        role: 'user',
        status: 'active',
        referralCode: generateReferralCode(),
        emailVerified: true,
        phoneVerified: false,
        createdAt: now,
        updatedAt: now,
        balance: 0,
        myWallet: 0,
        fundWallet: 0,
        utilityWallet: 0,
        totalInvested: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        pendingWithdrawal: 0,
      });
      console.log('Created temp user:', email);
    }
  } catch (err) {
    console.error('Failed to create temp user:', err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
