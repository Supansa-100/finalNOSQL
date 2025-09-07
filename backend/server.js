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

// Create uploads folder if not exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

mongoose.connect('mongodb://localhost:27017/hotel', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Room Schema
const roomSchema = new mongoose.Schema({
    room_number: { type: String, required: true, unique: true },
    floor: Number,
    facilities: [String]
});
const Room = mongoose.model('Room', roomSchema);

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    room_number: { type: String },
    name: String
});
const User = mongoose.model('User', userSchema);

// Report Schema
const reportSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room_number: { type: String, required: true },
    facility: String,
    description: String,
    image_url: String,
    status: { type: String, enum: ['new', 'in-progress', 'done'], default: 'new' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', reportSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// --------- AUTH MIDDLEWARE ---------
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
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }
    next();
}

// --------- AUTH API ---------

// REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name, room_id } = req.body;
        if (!username || !password || !name || !room_id) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }
        const exists = await User.findOne({ username });
        if (exists) return res.status(400).json({ message: 'Username ซ้ำ' });
        const hash = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hash,
            name,
            role: 'user',
            room_number: room_id,
        });
        await user.save();
        res.json({ message: 'สมัครสมาชิกสำเร็จ!', user: { username, name, role: 'user', room_number: room_id } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'รหัสผ่านผิด' });

        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '2d' });
        res.json({ 
            message: 'Login success', 
            token,
            user: { username: user.username, name: user.name, role: user.role, room_number: user.room_number }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------- ROOM API ---------
app.get('/api/rooms', async (req, res) => {
    try {
        const { floor } = req.query;
        let filter = {};
        if (floor) filter.floor = Number(floor);
        const rooms = await Room.find(filter);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get('/api/rooms/:room_number', async (req, res) => {
    try {
        const room = await Room.findOne({ room_number: req.params.room_number });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------- REPORT API (user) ---------
app.post('/api/report', upload.single('image'), authenticateToken, async (req, res) => {
    try {
        const { room_number, facility, description } = req.body;
        let image_url = null;
        if (req.file) {
            image_url = '/uploads/' + req.file.filename;
        }
        // ตรวจสอบว่าห้องมีอยู่จริง
        const room = await Room.findOne({ room_number });
        if (!room) return res.status(400).json({ message: 'Room not found' });

        const report = new Report({
            user_id: req.user.id,
            room_number,
            facility,
            description,
            image_url
        });
        await report.save();
        res.status(201).json({ message: 'Report created', report });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// เสิร์ฟไฟล์อัปโหลด
app.use('/uploads', express.static(uploadDir));

// GET รายการรีพอร์ต
// ผู้ใช้: ดูเฉพาะห้องตัวเอง, แอดมิน: ดูทั้งหมด
app.get('/api/reports', authenticateToken, async (req, res) => {
    try {
        const { status, room_number } = req.query;
        let filter = {};
        if (req.user.role === 'user') {
            filter.room_number = req.user.room_number;
        } else if (room_number) {
            filter.room_number = room_number;
        }
        if (status) filter.status = status;

        const reports = await Report.find(filter)
            .populate({ path: 'user_id', select: 'name username room_number' })
            .sort({ created_at: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH อัปเดตสถานะรีพอร์ต (admin รับงาน/สำเร็จ)
app.patch('/api/reports/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status, updated_at: new Date() },
            { new: true }
        );
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json({ message: 'Status updated', report });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --------- ADMIN API (ตัวอย่าง) ---------
app.get('/api/admin/reports/statistics', authenticateToken, requireAdmin, async (req, res) => {
    // รายงานสถิติ
    try {
        const counts = await Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const summary = { new: 0, 'in-progress': 0, done: 0 };
        counts.forEach(c => { summary[c._id] = c.count; });
        res.json(summary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ... เพิ่ม endpoint อื่น ๆ ได้ตามที่ต้องการ ...

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});