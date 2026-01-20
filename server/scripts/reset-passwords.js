const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Update admin password and status
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const adminResult = await db.collection('users').updateOne(
      { email: 'admin@crypto-mlm.com' },
      { 
        $set: { 
          password: adminPassword, 
          status: 'active',
          kycStatus: 'approved',
          kycLevel: 3
        } 
      }
    );
    console.log('Admin updated:', adminResult.modifiedCount > 0 ? 'success' : 'no change');
    console.log('✅ Admin: admin@crypto-mlm.com / Admin123!');
    
    // Update test user
    const userPassword = await bcrypt.hash('User123!', 10);
    const userResult = await db.collection('users').updateOne(
      { email: 'user@crypto-mlm.com' },
      { 
        $set: { 
          password: userPassword, 
          status: 'active',
          kycStatus: 'approved',
          kycLevel: 2
        } 
      }
    );
    console.log('User updated:', userResult.modifiedCount > 0 ? 'success' : 'no change');
    console.log('✅ User: user@crypto-mlm.com / User123!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPasswords();
