const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    examName: { type: String, required: true },
    subject: { type: String, required: true },
    marks: { type: Number, required: true },
    maxMarks: { type: Number, default: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);