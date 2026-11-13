const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rollNo: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    dob: Date,
    parentName: String,
    parentPhone: String,
    contact: String,
  },
  { timestamps: true }
);

studentSchema.index({ rollNo: 1, className: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);