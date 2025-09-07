const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Report = require('../models/Report');

// GET /api/admin/reports - ดูรีพอร์ตทั้งหมด
router.get('/reports', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.query; // กรองสถานะได้
  const filter = status ? { status } : {};
  const reports = await Report.find(filter).sort({ created_at: -1 });
  res.json(reports);
});

// PATCH /api/admin/reports/:id/status - อัปเดตสถานะรีพอร์ต
router.patch('/reports/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!['new','in-progress','done'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json(report);
});

// GET /api/admin/reports/statistics - summary (dashboard)
router.get('/reports/statistics', authenticateToken, requireAdmin, async (req, res) => {
  const counts = await Report.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  // แปลงให้อ่านง่าย
  const summary = { new: 0, 'in-progress': 0, done: 0 };
  counts.forEach(c => { summary[c._id] = c.count; });
  res.json(summary);
});

module.exports = router;