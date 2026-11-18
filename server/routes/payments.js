const router = require('express').Router();
const Payment = require('../models/Payment');
const Fee = require('../models/Fee');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Recalculate how much of a fee is paid, from its payment records
const recalc = async (feeId) => {
  const fee = await Fee.findById(feeId);
  if (!fee) return;
  const agg = await Payment.aggregate([
    { $match: { fee: fee._id } },
    { $group: { _id: null, t: { $sum: '$amount' } } },
  ]);
  const paid = agg[0]?.t || 0;
  fee.paidAmount = paid;
  fee.status = paid >= fee.amount ? 'paid' : paid > 0 ? 'partial' : 'pending';
  fee.paidDate = paid >= fee.amount ? new Date() : undefined;
  await fee.save();
};

const populateAll = (q) =>
  q.populate('student', 'name rollNo className section').populate('fee', 'type amount');

// Payment history (optional ?student=ID)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    const data = await populateAll(
      Payment.find(filter).sort({ paidDate: -1, createdAt: -1 }).limit(200)
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Add a payment
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { fee: feeId, amount, method, note } = req.body;
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    if (fee.status === 'paid') {
      return res.status(400).json({ message: 'This fee is already fully paid' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount' });
    }
    const balance = fee.amount - (fee.paidAmount || 0);
    if (amount > balance) {
      return res.status(400).json({ message: `Amount is more than the balance (₹${balance})` });
    }

    const payment = await Payment.create({
      fee: fee._id,
      student: fee.student,
      amount,
      method,
      note,
    });
    payment.receiptNo = 'RCPT-' + payment._id.toString().slice(-6).toUpperCase();
    await payment.save();
    await recalc(fee._id);

    res.status(201).json(await populateAll(Payment.findById(payment._id)));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Delete a payment
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    await recalc(payment.fee);
    res.json({ message: 'Payment deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;