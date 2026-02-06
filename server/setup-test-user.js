const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/crypto-mlm').then(async () => {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // Update test user password and ensure role is user
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'arvindersaini2523@gmail.com' }, 
    { $set: { password: hashedPassword, role: 'user' } }
  );
  
  console.log('✅ Updated test user: arvindersaini2523@gmail.com');
  console.log('   Password: 123456');
  console.log('   Role: user');
  console.log('   Modified count:', result.modifiedCount);
  mongoose.disconnect();
});
