const express = require('express');
const crudRouter = require('../utils/crudRouter');
const Fee = require('../models/Fee');
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Payment.deleteMany({ fee: req.params.id });
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.use(
  crudRouter(Fee, {
    populate: 'student',
    readRoles: ['admin', 'teacher', 'student'],
    writeRoles: ['admin'],
  })
);

module.exports = router;