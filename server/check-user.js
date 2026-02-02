require('dotenv').config();
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  uniqueId: String
});

const User = mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const user = await User.findOne({ email: 'arvindersaini163@gmail.com' });
  
  if (user) {
    console.log('✅ User found:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.firstName);
    console.log('  ID:', user.uniqueId);
    console.log('  Has password:', !!user.password);
  } else {
    console.log('❌ User NOT found - you need to register first');
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err.message);
});
