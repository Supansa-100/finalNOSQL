const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/market';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, default: 'user' }
});
const stallSchema = new mongoose.Schema({
  stall_number: { type: String, required: true, unique: true },
  size: String,
  price_per_day: Number,
  status: { type: String, enum: ['Available','Booked','Occupied'], default: 'Available' },
  image: String
});
const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stall_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stall' },
  start_date: String,
  end_date: String,
  status: { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' }
});

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  const User = mongoose.model('User', userSchema);
  const Stall = mongoose.model('Stall', stallSchema);
  const Booking = mongoose.model('Booking', bookingSchema);

  // 1) Create admin and sample user if not exists
  const users = [
    { name: 'Admin', email: 'admin@example.com', phone: '', password: 'admin1234', role: 'admin' },
    { name: 'User One', email: 'user1@example.com', phone: '0812345678', password: 'user1234', role: 'user' }
  ];

  for (const u of users) {
    let exist = await User.findOne({ email: u.email });
    if (!exist) {
      const hash = await bcrypt.hash(u.password, 10);
      exist = new User({ name: u.name, email: u.email, phone: u.phone, password: hash, role: u.role });
      await exist.save();
      console.log('Created user:', u.email);
    } else {
      console.log('User exists:', u.email);
    }
  }

  // 2) Create stalls using files in backend/uploads (fallback images if missing)
  const uploadsDir = path.join(__dirname, 'uploads');
  const sampleStalls = [
    { stall_number: 'A1', size: '2x2', price_per_day: 100, imageFile: '/uploads/1.jpg' },
    { stall_number: 'A2', size: '2x2', price_per_day: 120, imageFile: '/uploads/2.jpg' },
    { stall_number: 'B1', size: '3x2', price_per_day: 150, imageFile: '/uploads/3.jpg' },
    { stall_number: 'C1', size: '2x3', price_per_day: 130, imageFile: '/uploads/4.jpg' },
    { stall_number: 'C2', size: '2x3', price_per_day: 140, imageFile: '/uploads/5.jpg' }
  ];

  for (const s of sampleStalls) {
    let exist = await Stall.findOne({ stall_number: s.stall_number });
    if (!exist) {
      let imagePath = null;
      const candidate = path.join(uploadsDir, s.imageFile);
      if (fs.existsSync(candidate)) {
        imagePath = `/uploads/${path.basename(s.imageFile)}`;
      } else {
        // ถ้าไฟล์ไม่มี จะไม่ใส่ field image
        console.log(`Image not found, skipping image field for ${s.stall_number}: ${s.imageFile}`);
      }
      exist = new Stall({
        stall_number: s.stall_number,
        size: s.size,
        price_per_day: s.price_per_day,
        image: imagePath
      });
      await exist.save();
      console.log('Created stall:', s.stall_number);
    } else {
      console.log('Stall exists:', s.stall_number);
    }
  }

  // 3) Create a sample booking for user1 for stall A1 if not exists
  const user = await User.findOne({ email: 'user1@example.com' });
  const stall = await Stall.findOne({ stall_number: 'A1' });
  if (user && stall) {
    const existingBooking = await Booking.findOne({ user_id: user._id, stall_id: stall._id });
    if (!existingBooking) {
      const booking = new Booking({
        user_id: user._id,
        stall_id: stall._id,
        start_date: '2025-10-01',
        end_date: '2025-10-07',
        status: 'pending'
      });
      await booking.save();
      console.log('Created booking for user1 on stall A1');
    } else {
      console.log('Booking already exists for user1 on stall A1');
    }
  } else {
    console.log('User or stall missing, skipping booking creation');
  }

  await mongoose.disconnect();
  console.log('Seeding finished.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});