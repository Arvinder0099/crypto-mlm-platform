const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm')
.then(async () => {
  console.log('Connected to MongoDB');
  
  const userSchema = new mongoose.Schema({
    firstName: String, lastName: String, email: { type: String, unique: true },
    password: String, phone: String, country: String, 
    username: String, userId: String,
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    directReferrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downlineUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    role: { type: String, default: 'user' }, status: { type: String, default: 'active' },
    balance: { type: Number, default: 0 }, totalInvested: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 }
  }, { timestamps: true, strict: false });
  
  const User = mongoose.model('User', userSchema);
  
  // Find the main user
  const mainUser = await User.findOne({ email: 'user@crypto-mlm.com' });
  if (!mainUser) {
    console.log('Main user not found!');
    process.exit(1);
  }
  console.log('Main User:', mainUser.firstName, mainUser.lastName, 'Code:', mainUser.referralCode);
  
  const hashedPassword = await bcrypt.hash('test123', 10);
  const timestamp = Date.now();
  
  // Create Direct Referrals (Level 1)
  const directUsers = [];
  for (let i = 1; i <= 3; i++) {
    const existingUser = await User.findOne({ email: `direct${i}@test.com` });
    if (existingUser) {
      console.log(`Direct ${i} already exists, skipping...`);
      directUsers.push(existingUser);
      continue;
    }
    const user = new User({
      firstName: `Direct${i}`, lastName: 'User', email: `direct${i}@test.com`,
      username: `direct${i}_${timestamp}`, userId: `D${i}_${timestamp}`,
      password: hashedPassword, phone: `+1000000000${i}`, country: 'USA',
      referralCode: `DIRECT${i}${timestamp}`, referredBy: mainUser._id,
      totalInvested: 1000 * i, totalEarned: 100 * i
    });
    await user.save();
    directUsers.push(user);
    console.log(`Created Direct ${i}: ${user.email}`);
  }
  
  // Create Level 2 users (referred by Direct1)
  for (let i = 1; i <= 2; i++) {
    const existingUser = await User.findOne({ email: `level2user${i}@test.com` });
    if (existingUser) {
      console.log(`Level 2 User ${i} already exists, skipping...`);
      continue;
    }
    const user = new User({
      firstName: `Level2User${i}`, lastName: 'Test', email: `level2user${i}@test.com`,
      username: `level2user${i}_${timestamp}`, userId: `L2_${i}_${timestamp}`,
      password: hashedPassword, phone: `+120000000${i}`, country: 'USA',
      referralCode: `L2USER${i}${timestamp}`, referredBy: directUsers[0]._id,
      totalInvested: 500 * i, totalEarned: 50 * i
    });
    await user.save();
    console.log(`Created Level 2 User ${i}: ${user.email}`);
  }
  
  // Create Level 3 user
  const level2user = await User.findOne({ email: 'level2user1@test.com' });
  if (level2user) {
    const existingL3 = await User.findOne({ email: 'level3user@test.com' });
    if (!existingL3) {
      const l3user = new User({
        firstName: 'Level3User', lastName: 'Deep', email: 'level3user@test.com',
        username: `level3user_${timestamp}`, userId: `L3_${timestamp}`,
        password: hashedPassword, phone: '+1300000001', country: 'USA',
        referralCode: `L3USER${timestamp}`, referredBy: level2user._id,
        totalInvested: 250, totalEarned: 25
      });
      await l3user.save();
      console.log(`Created Level 3 User: ${l3user.email}`);
    }
  }
  
  console.log('\n=== NETWORK STRUCTURE ===');
  console.log(`${mainUser.firstName} ${mainUser.lastName} (${mainUser.email})`);
  console.log('|-- Direct1 User (direct1@test.com)');
  console.log('|   |-- Level2User1 Test (level2user1@test.com)');
  console.log('|   |   +-- Level3User Deep (level3user@test.com)');
  console.log('|   +-- Level2User2 Test (level2user2@test.com)');
  console.log('|-- Direct2 User (direct2@test.com)');
  console.log('+-- Direct3 User (direct3@test.com)');
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
