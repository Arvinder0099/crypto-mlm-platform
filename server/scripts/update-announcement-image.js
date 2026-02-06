const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb://localhost:27017/crypto-mlm');
    console.log('Connected to MongoDB');

    const schema = new mongoose.Schema({}, { strict: false });
    const Announcement = mongoose.model('Announcement', schema);

    const result = await Announcement.updateMany({}, {
      $set: { imageUrl: '/announcement.png' }
    });

    console.log('Update Result:', result);
    console.log('✅ Announcement configured to use /announcement.png');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

run();
