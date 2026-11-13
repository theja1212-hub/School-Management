const router = require('express').Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { date, records } = req.body;
    const ops = records.map((r) => ({
      updateOne: {
        filter: { student: r.student, date },
        update: { $set: { status: r.status, markedBy: req.user.id } },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    res.json({ message: 'Attendance saved' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/date/:date', authorize('admin', 'teacher'), async (req, res) => {
  const data = await Attendance.find({ date: req.params.date });
  res.json(data);
});

router.get('/student/:id', async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.id }).sort({ date: -1 });
    const present = records.filter((r) => r.status !== 'absent').length;
    const percentage = records.length ? ((present / records.length) * 100).toFixed(1) : 0;
    res.json({ total: records.length, present, percentage, records });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;