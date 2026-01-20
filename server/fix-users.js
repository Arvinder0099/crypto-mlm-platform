const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAndTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check current admin user
    const admin = await db.collection('users').findOne({ email: 'admin@crypto-mlm.com' });
    console.log('\nCurrent admin user:');
    console.log('  Email:', admin?.email);
    console.log('  Has password:', !!admin?.password);
    console.log('  Password length:', admin?.password?.length);
    console.log('  Status:', admin?.status);
    
    // Test password
    if (admin?.password) {
      const testResult = await bcrypt.compare('Admin@123', admin.password);
      console.log('  Password "Admin@123" matches:', testResult);
    }
    
    // If password doesn't match, reset it
    console.log('\n--- Resetting password ---');
    const newHash = await bcrypt.hash('Admin@123', 10);
    console.log('New hash generated:', newHash.substring(0, 20) + '...');
    
    // Verify hash works
    const verifyHash = await bcrypt.compare('Admin@123', newHash);
    console.log('Verify new hash works:', verifyHash);
    
    // Update directly in MongoDB
    const result = await db.collection('users').updateOne(
      { email: 'admin@crypto-mlm.com' },
      { 
        $set: { 
          password: newHash,
          status: 'active',
          userId: 'ADM001',
          firstName: 'Admin',
          lastName: 'User',
          referralCode: 'ADMIN001',
          role: 'admin'
        } 
      }
    );
    console.log('Update result:', result.modifiedCount > 0 ? 'SUCCESS' : 'No changes');
    
    // Verify update
    const updatedAdmin = await db.collection('users').findOne({ email: 'admin@crypto-mlm.com' });
    const finalTest = await bcrypt.compare('Admin@123', updatedAdmin.password);
    console.log('\nFinal verification:');
    console.log('  Password matches after update:', finalTest);
    console.log('  Status:', updatedAdmin.status);
    console.log('  Role:', updatedAdmin.role);
    
    // Also fix regular user
    const userHash = await bcrypt.hash('User@123', 10);
    await db.collection('users').updateOne(
      { email: 'user@crypto-mlm.com' },
      { 
        $set: { 
          password: userHash,
          status: 'active',
          userId: 'USR001',
          firstName: 'Demo',
          lastName: 'User',
          referralCode: 'USER001',
          role: 'user'
        } 
      }
    );
    console.log('\nUser account also fixed');
    
    console.log('\n✅ Login Credentials:');
    console.log('  Admin: admin@crypto-mlm.com / Admin@123');
    console.log('  User:  user@crypto-mlm.com / User@123');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAndTest();
