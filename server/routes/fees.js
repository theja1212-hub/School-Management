const crudRouter = require('../utils/crudRouter');
const Fee = require('../models/Fee');
const { authorize } = require('../middleware/auth');

const router = crudRouter(Fee, {
  populate: 'student',
  readRoles: ['admin', 'teacher', 'student'],
  writeRoles: ['admin'],
});

router.post('/:id/pay', authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidDate: new Date() },
      { new: true }
    ).populate('student');
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    res.json({
      receiptNo: 'RCPT-' + fee._id.toString().slice(-6).toUpperCase(),
      student: fee.student.name,
      rollNo: fee.student.rollNo,
      feeType: fee.type,
      amount: fee.amount,
      paidDate: fee.paidDate,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;