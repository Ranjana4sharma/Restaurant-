const mongoose = require('mongoose');

async function drop() {
  await mongoose.connect('mongodb+srv://Ranjana:PIYeCkFU6ORVYA8d@backend.aa3mmeq.mongodb.net/restaurant', { bufferCommands: false });
  try {
     await mongoose.connection.collection('customers').dropIndex('phone_1');
     console.log('Index dropped');
  } catch(e) {
     console.log('Error dropping index (maybe it does not exist?):', e.message);
  }
  process.exit(0);
}
drop();
