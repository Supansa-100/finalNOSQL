require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // import model User ของคุณ

async function createAdmin() {
  try {
    // เชื่อมต่อ MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // เช็คว่ามี admin อยู่แล้วหรือยัง
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists:', existingAdmin.username);
      process.exit(0);
    }

    // กำหนดค่าของ admin คนแรก
    const username = 'admin';
    const password = 'admin123'; // แนะนำให้แก้ใน production
    const name = 'System Administrator';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้าง admin
    const admin = new User({
      username,
      password: hashedPassword,
      role: 'admin',
      name
    });

    await admin.save();
    console.log('🎉 Admin created successfully');
    console.log('👉 Username:', username);
    console.log('👉 Password:', password);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
