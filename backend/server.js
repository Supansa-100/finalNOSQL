

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const app = express();
app.use(cors());
app.use(express.json());


// Connect MongoDB
mongoose.connect('mongodb://localhost:27017/hotel', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
});

// Report Schema
const reportSchema = new mongoose.Schema({
	user_id: String,
	room_id: String,
	facility: String,
	description: String,
	image_url: String,
	status: { type: String, enum: ['new', 'in-progress', 'done'], default: 'new' },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', reportSchema);

// GET /api/reports/summary
app.get('/api/reports/summary', async (req, res) => {
    try {
        const newCount = await Report.countDocuments({ status: 'new' });
        const inProgressCount = await Report.countDocuments({ status: 'in-progress' });
        const doneCount = await Report.countDocuments({ status: 'done' });
        res.json({ new: newCount, inProgress: inProgressCount, done: doneCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Room Schema
const roomSchema = new mongoose.Schema({
	room_number: String,
	floor: Number,
});
const Room = mongoose.model('Room', roomSchema);

// User Schema
const userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['user', 'admin'], default: 'user' },
	roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
	name: String // Optional, for compatibility
});
const User = mongoose.model('User', userSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
// POST /api/register
// REGISTER (รับ room_number ไม่ใช่ room_id)
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, role = 'user', room_number, name } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        if (role !== 'user' && role !== 'admin') {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        let room_id = undefined;
        if (role === 'user') {
            if (!room_number) {
                return res.status(400).json({ message: 'Missing room_number' });
            }
            const room = await Room.findOne({ room_number: room_number });
            if (!room) {
                return res.status(400).json({ message: 'Room not found' });
            }
            room_id = room._id;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            username,
            password: hashedPassword,
            role,
            name
        };
        if (room_id) {
            userData.room_id = room_id;
        }

        const user = new User(userData);
        await user.save();

        res.status(201).json({
            message: 'User registered',
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                name: user.name,
                room_id: user.room_id || null
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ message: 'Invalid username or password' });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid username or password' });
		}
		const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
		res.json({
			token,
			user: {
				id: user._id,
				username: user.username,
				role: user.role,
				name: user.name
			}
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});


// GET /api/reports
app.get('/api/reports', async (req, res) => {
	try {
		const { floor, room, status } = req.query;
		let roomFilter = {};
		if (floor) roomFilter.floor = Number(floor);
		if (room) roomFilter.room_number = room;
		let rooms = [];
		if (floor || room) {
			rooms = await Room.find(roomFilter).select('_id');
		}
		let filter = {};
		if (status) filter.status = status;
		if (rooms.length > 0) filter.room_id = { $in: rooms.map(r => r._id) };
		const reports = await Report.find(filter)
			.populate({ path: 'user_id', select: 'name' })
			.populate({ path: 'room_id', select: 'room_number floor' })
			.sort({ created_at: -1 });
		const result = reports.map(r => ({
			id: r._id,
			room: r.room_id ? {
				room_number: r.room_id.room_number,
				floor: r.room_id.floor
			} : null,
			user: r.user_id ? {
				name: r.user_id.name
			} : null,
			facility: r.facility,
			description: r.description,
			status: r.status,
			createdAt: r.created_at
		}));
		res.json(result);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// GET /api/reports/:id
app.get('/api/reports/:id', async (req, res) => {
	try {
		const report = await Report.findById(req.params.id)
			.populate({ path: 'user_id', select: 'name' })
			.populate({ path: 'room_id', select: 'room_number floor' });
		if (!report) return res.status(404).json({ message: 'Report not found' });
		res.json({
			id: report._id,
			room: report.room_id ? {
				room_number: report.room_id.room_number,
				floor: report.room_id.floor
			} : null,
			user: report.user_id ? {
				name: report.user_id.name
			} : null,
			facility: report.facility,
			description: report.description,
			image_url: report.image_url,
			status: report.status,
			createdAt: report.created_at,
			updatedAt: report.updated_at
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// PATCH /api/reports/:id
app.patch('/api/reports/:id', async (req, res) => {
	try {
		const { status } = req.body;
		const report = await Report.findByIdAndUpdate(
			req.params.id,
			{ status, updated_at: new Date() },
			{ new: true }
		)
			.populate({ path: 'user_id', select: 'name' })
			.populate({ path: 'room_id', select: 'room_number floor' });
		if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
		res.json({
			success: true,
			message: 'updated',
			data: {
				id: report._id,
				room: report.room_id ? {
					room_number: report.room_id.room_number,
					floor: report.room_id.floor
				} : null,
				user: report.user_id ? {
					name: report.user_id.name
				} : null,
				facility: report.facility,
				description: report.description,
				image_url: report.image_url,
				status: report.status,
				createdAt: report.created_at,
				updatedAt: report.updated_at
			}
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

// GET /api/rooms
app.get('/api/rooms', async (req, res) => {
	try {
		const rooms = await Room.find();
		const result = rooms.map(r => ({
			id: r._id,
			room_number: r.room_number,
			floor: r.floor,
			facilities: r.facilities || []
		}));
		res.json(result);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// POST /api/rooms
app.post('/api/rooms', async (req, res) => {
	try {
		const { room_number, floor, facilities } = req.body;
		const newRoom = new Room({ room_number, floor, facilities });
		await newRoom.save();
		res.status(201).json({ success: true, message: 'Room created', room: {
			id: newRoom._id,
			room_number: newRoom.room_number,
			floor: newRoom.floor,
			facilities: newRoom.facilities
		}});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

// PUT /api/rooms/:id
app.put('/api/rooms/:id', async (req, res) => {
	try {
		const { room_number, floor, facilities } = req.body;
		const update = {};
		if (room_number !== undefined) update.room_number = room_number;
		if (floor !== undefined) update.floor = floor;
		if (facilities !== undefined) update.facilities = facilities;
		const room = await Room.findByIdAndUpdate(req.params.id, update, { new: true });
		if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
		res.json({ success: true, message: 'Room updated', room: {
			id: room._id,
			room_number: room.room_number,
			floor: room.floor,
			facilities: room.facilities
		}});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

// DELETE /api/rooms/:id
app.delete('/api/rooms/:id', async (req, res) => {
	try {
		const room = await Room.findByIdAndDelete(req.params.id);
		if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
		res.json({ success: true, message: 'Room deleted' });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});




// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});