const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

async function setupAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Admin credentials
    const adminEmail = 'arvindersaini163@gmail.com';
    const adminPassword = '252300';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Check if admin exists
    const existingAdmin = await db.collection('users').findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update existing admin
      await db.collection('users').updateOne(
        { email: adminEmail },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin',
            status: 'active',
            emailVerified: true,
            isAdmin: true,
            updatedAt: new Date()
          } 
        }
      );
      console.log('✅ Admin account updated successfully!');
    } else {
      // Create new admin account
      await db.collection('users').insertOne({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Arvinder',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        isAdmin: true,
        userId: 'ADM' + Date.now(),
        referralCode: 'ADMIN' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ New admin account created successfully!');
    }
    
    // Also update any existing admin@crypto-mlm.com to point to new credentials or deactivate
    await db.collection('users').updateMany(
      { role: 'admin', email: { $ne: adminEmail } },
      { $set: { role: 'user' } }
    );
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('\n✅ You can now login with these credentials!');
    
    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
