const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Reset admin password and fix missing fields
    const adminHash = await bcrypt.hash('Admin@123', 10);
    await db.collection('users').updateOne(
      { email: 'admin@crypto-mlm.com' },
      { $set: { 
        password: adminHash, 
        status: 'active',
        userId: 'ADM' + Date.now(),
        firstName: 'Admin',
        lastName: 'User',
        referralCode: 'ADMIN001'
      } }
    );
    console.log('✅ Admin password reset to: Admin@123');
    
    // Reset user password and fix missing fields
    const userHash = await bcrypt.hash('User@123', 10);
    await db.collection('users').updateOne(
      { email: 'user@crypto-mlm.com' },
      { $set: { 
        password: userHash, 
        status: 'active',
        userId: 'USR' + Date.now(),
        firstName: 'Demo',
        lastName: 'User',
        referralCode: 'USER001'
      } }
    );
    console.log('✅ User password reset to: User@123');
    
    // Fix undefined status for other users
    await db.collection('users').updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );
    await db.collection('users').updateMany(
      { status: null },
      { $set: { status: 'active' } }
    );
    console.log('✅ Fixed status for all users');
    
    // Show all users
    const users = await db.collection('users').find({}).toArray();
    console.log('\n📋 All Users:');
    users.forEach(u => {
      console.log(`  - ${u.email} (${u.role}) - Status: ${u.status}`);
    });
    
    console.log('\n🔐 Login Credentials:');
    console.log('  Admin: admin@crypto-mlm.com / Admin@123');
    console.log('  User:  user@crypto-mlm.com / User@123');
    
    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetPasswords();
