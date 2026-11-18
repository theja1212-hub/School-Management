const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    fee: { type: mongoose.Schema.Types.ObjectId, ref: 'Fee', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true, min: 1 },
    method: { type: String, enum: ['cash', 'upi', 'card', 'bank'], default: 'cash' },
    note: String,
    receiptNo: String,
    paidDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);