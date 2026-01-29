const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm').then(async () => {
  console.log('Connected to MongoDB');
  
  const hashedPassword = await bcrypt.hash('user123', 10);
  
  // Update user password
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'user@crypto-mlm.com' },
    { $set: { password: hashedPassword, status: 'active' } }
  );
  console.log('✅ Password reset for user@crypto-mlm.com');
  
  // Also reset admin password
  const adminHash = await bcrypt.hash('admin123', 10);
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'arvindersaini163@gmail.com' },
    { $set: { password: adminHash, status: 'active' } }
  );
  console.log('✅ Password reset for arvindersaini163@gmail.com');
  
  console.log('\n========================================');
  console.log('        LOGIN CREDENTIALS');
  console.log('========================================');
  console.log('USER PANEL:');
  console.log('  Email: user@crypto-mlm.com');
  console.log('  Password: user123');
  console.log('');
  console.log('ADMIN PANEL:');
  console.log('  Email: arvindersaini163@gmail.com');
  console.log('  Password: admin123');
  console.log('========================================');
  
  mongoose.disconnect();
}).catch(err => console.error('Error:', err));
