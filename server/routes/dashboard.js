const router = require('express').Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const [students, teachers, paidFees, pendingFees, att] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Fee.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, t: { $sum: '$amount' } } }]),
      Fee.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, t: { $sum: '$amount' } } }]),
      Attendance.find(),
    ]);
    const present = att.filter((a) => a.status !== 'absent').length;
    const weekly = await Attendance.aggregate([
      {
        $group: {
          _id: '$date',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $ne: ['$status', 'absent'] }, 1, 0] } },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },]);
    res.json({
      totalStudents: students,
      totalTeachers: teachers,
      feeCollected: paidFees[0]?.t || 0,
      feePending: pendingFees[0]?.t || 0,
      attendancePercentage: att.length ? +((present / att.length) * 100).toFixed(1) : 0,
      weekly: weekly.reverse().map((w) => ({
        date: w._id.slice(5),
        percentage: Math.round((w.present / w.total) * 100),
      })),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;