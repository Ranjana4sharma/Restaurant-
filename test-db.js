const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb+srv://Ranjana:PIYeCkFU6ORVYA8d@backend.aa3mmeq.mongodb.net/restaurant', { bufferCommands: false });
  const schema = new mongoose.Schema(
    {
      name: { type: String, trim: true, required: true },
      email: { type: String, trim: true, required: true, unique: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
      gender: { type: String, enum: ["male", "female", "other"] },
      birthDate: { type: String },
      password: { type: String, required: true },
    },
    { timestamps: true }
  );
  const Customer = mongoose.models.Customer || mongoose.model('Customer', schema);

  try {
    const existing = await Customer.findOne({ email: 'sharma04ranjana@gmail.com' });
    console.log("existing:", existing);
    if (!existing) {
       const customer = await Customer.create({
         email: 'sharma04ranjana@gmail.com',
         password: 'hashed123',
         name: 'Ranjana',
         phone: "",
         address: 'vbnm,'
       });
       console.log("created", customer);
    }
  } catch (err) {
    console.error("error:", err);
  }
  process.exit(0);
}
test();
