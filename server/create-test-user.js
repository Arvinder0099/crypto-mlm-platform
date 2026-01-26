const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/crypto-mlm').then(async () => {
  const hashedPassword = await bcrypt.hash('user123', 10);
  
  // Update existing user password
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'user@crypto-mlm.com' }, 
    { $set: { password: hashedPassword } }
  );
  
  console.log('Updated password for user@crypto-mlm.com');
  console.log('Modified count:', result.modifiedCount);
  
  // Show all users
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('\nAll users in database:');
  users.forEach(u => {
    console.log(`  Email: ${u.email} | Role: ${u.role}`);
  });
  
  mongoose.disconnect();
});
