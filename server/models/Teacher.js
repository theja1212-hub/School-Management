const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subject: String,
    qualification: String,
    experience: Number,
    contact: String,
    classes: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);