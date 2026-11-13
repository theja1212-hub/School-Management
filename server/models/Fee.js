const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { type: String, enum: ['tuition', 'transport', 'hostel'], required: true },
    amount: { type: Number, required: true },
    dueDate: Date,
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', feeSchema);