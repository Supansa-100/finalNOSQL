// --------- UPDATE STALL IMAGE API ---------
// อัปเดตรูปแผงตลาด (หลังอัปโหลดรูปแล้ว)


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');



const app = express();
app.use(cors());
app.use(express.json());

// เปิด static file สำหรับรูปใน uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// เชื่อมต่อ MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/market';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    role: { type: String, default: 'user' }
});
const User = mongoose.model('User', userSchema);
// Start server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// --------- AUTH API ---------
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}
// REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'อีเมลนี้ถูกใช้แล้ว' });
        const hash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, phone, password: hash });
        await user.save();
        res.json({ message: 'สมัครสมาชิกสำเร็จ!', user: { name, email, phone } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'รหัสผ่านผิด' });
        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '2d' });
        res.json({ message: 'Login success', token, user: { name: user.name, email: user.email, phone: user.phone, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------- PROFILE API ---------
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email phone role');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Stall Schema
const stallSchema = new mongoose.Schema({
    stall_number: { type: String, required: true, unique: true },
    size: String,
    price_per_day: Number,
    status: { type: String, enum: ['Available', 'Booked', 'Occupied'], default: 'Available' },
    image: String
});
const Stall = mongoose.model('Stall', stallSchema);
// --------- UPLOAD IMAGE API ---------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, filename);
    }
});
const upload = multer({ storage });
app.patch('/api/stalls/:id/image', authenticateToken, async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ message: 'No image path provided' });
        const stall = await Stall.findByIdAndUpdate(
            req.params.id,
            { image },
            { new: true }
        );
        if (!stall) return res.status(404).json({ message: 'Stall not found' });
        res.json({ message: 'อัปเดตรูปแผงสำเร็จ', stall });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// อัปโหลดรูปแผงตลาด
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        // คืน path สำหรับเก็บใน database
        const filePath = '/uploads/' + req.file.filename;
        res.json({ message: 'Upload success', path: filePath });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stall_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Stall' },
    start_date: String,
    end_date: String,
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
});
const Booking = mongoose.model('Booking', bookingSchema);

// --------- STALL API ---------
// เพิ่มแผงตลาดใหม่ (แนบรูปภาพได้)
app.post('/api/stalls', authenticateToken, async (req, res) => {
    try {
        const { stall_number, size, price_per_day, image } = req.body;
        if (!stall_number || !size || !price_per_day) {
            return res.status(400).json({ message: 'ข้อมูลไม่ครบ' });
        }
        const stall = new Stall({ stall_number, size, price_per_day, image });
        await stall.save();
        res.status(201).json({ message: 'เพิ่มแผงตลาดสำเร็จ', stall });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// แก้ไขข้อมูลแผงตลาด (แนบรูปภาพได้)
app.put('/api/stalls/:id', authenticateToken, async (req, res) => {
    try {
        const { stall_number, size, price_per_day, image } = req.body;
        const stall = await Stall.findByIdAndUpdate(
            req.params.id,
            { stall_number, size, price_per_day, image },
            { new: true }
        );
        if (!stall) return res.status(404).json({ message: 'Stall not found' });
        res.json({ message: 'แก้ไขแผงตลาดสำเร็จ', stall });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/stalls', async (req, res) => {
    try {
        const stalls = await Stall.find();
        res.json(stalls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get('/api/stalls/:id', async (req, res) => {
    try {
        const stall = await Stall.findById(req.params.id);
        if (!stall) return res.status(404).json({ message: 'Stall not found' });
        res.json(stall);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------- BOOKING API ---------
// --------- ADMIN BOOKING API ---------
// ดูรายการจองทั้งหมด (admin)
app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
    try {
        // ตรวจสอบสิทธิ์ admin
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
        const bookings = await Booking.find().populate('user_id stall_id');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// เปลี่ยนสถานะการจองเป็น confirmed (สำเร็จ)
app.patch('/api/admin/bookings/:id/confirm', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'เฉพาะผู้ดูแลระบบเท่านั้น' });
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'confirmed' },
            { new: true }
        ).populate('user_id stall_id');
        if (!booking) return res.status(404).json({ message: 'ไม่พบการจองนี้' });
        res.json({ message: 'อนุมัติการจองสำเร็จ', booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get('/api/bookings/me', authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ user_id: req.user.id }).populate('stall_id');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { stall_id, start_date, end_date } = req.body;
        if (!stall_id || !start_date || !end_date) {
            return res.status(400).json({ message: 'ข้อมูลไม่ครบ' });
        }
        const booking = new Booking({ user_id: req.user.id, stall_id, start_date, end_date, status: 'pending' });
        await booking.save();
        await Stall.findByIdAndUpdate(stall_id, { status: 'Booked' });
        res.status(201).json({ message: 'จองแผงสำเร็จ', booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/bookings/:id/delete', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
        if (!booking) return res.status(404).json({ message: 'ไม่พบการจองนี้' });
        await Stall.findByIdAndUpdate(booking.stall_id, { status: 'Available' });
        res.json({ message: 'ยกเลิกการจองสำเร็จ' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Start server (ประกาศ PORT แค่ครั้งเดียว)
if (typeof PORT === 'undefined') {
    // ...existing code...
}
app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
});