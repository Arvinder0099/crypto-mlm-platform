require('dotenv').config();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: String,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  status: String,
  balance: Number,
  createdAt: Date
}, { strict: false });

const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  const users = await User.find({}, 'userId firstName lastName email role status balance createdAt').limit(20);
  console.log('Found', users.length, 'users:');
  users.forEach((user, i) => {
    console.log(`${i+1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - Balance: $${user.balance || 0}`);
  });
  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});