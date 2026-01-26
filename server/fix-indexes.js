const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-mlm')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Drop the problematic indexes
  const db = mongoose.connection.db;
  const collection = db.collection('users');
  
  try {
    await collection.dropIndex('walletAddress_1');
    console.log('Dropped walletAddress_1 index');
  } catch (e) {
    console.log('walletAddress_1 index not found or already dropped');
  }
  
  try {
    await collection.dropIndex('username_1');
    console.log('Dropped username_1 index');
  } catch (e) {
    console.log('username_1 index not found or already dropped');
  }
  
  // List remaining indexes
  const indexes = await collection.indexes();
  console.log('\nRemaining indexes:');
  indexes.forEach(idx => console.log(' -', idx.name, Object.keys(idx.key)));
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
