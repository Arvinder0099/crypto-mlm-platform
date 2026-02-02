require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  uniqueId: String
});

const User = mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const email = 'arvindersaini163@gmail.com';
  const newPassword = '252300';
  
  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update user's password
  const result = await User.updateOne(
    { email: email },
    { $set: { password: hashedPassword } }
  );
  
  if (result.modifiedCount > 0) {
    console.log('✅ Password reset successfully!');
    console.log('  Email:', email);
    console.log('  New Password:', newPassword);
  } else {
    console.log('❌ User not found or password not changed');
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err.message);
});
