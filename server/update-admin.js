const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/crypto-mlm').then(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Update admin password
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'arvindersaini163@gmail.com' }, 
    { $set: { password: hashedPassword, role: 'admin' } }
  );
  
  console.log('Updated admin password. Modified count:', result.modifiedCount);
  mongoose.disconnect();
});
