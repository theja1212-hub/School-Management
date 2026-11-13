const router = require('express').Router();
const Result = require('../models/Result');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

const gradeFor = (p) =>
  p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B' : p >= 60 ? 'C' : p >= 40 ? 'D' : 'F';

router.post('/', authorize('admin', 'teacher'), async (req, res) => {
  try {
    res.status(201).json(await Result.create(req.body));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/student/:id', async (req, res) => {
  try {
    const filter = { student: req.params.id };
    if (req.query.exam) filter.examName = req.query.exam;
    const results = await Result.find(filter);

    const totalMarks = results.reduce((s, r) => s + r.marks, 0);
    const maxMarks = results.reduce((s, r) => s + r.maxMarks, 0);
    const percentage = maxMarks ? +((totalMarks / maxMarks) * 100).toFixed(2) : 0;

    res.json({
      subjects: results.map((r) => ({
        subject: r.subject,
        exam: r.examName,
        marks: r.marks,
        maxMarks: r.maxMarks,
        grade: gradeFor((r.marks / r.maxMarks) * 100),
      })),
      totalMarks,
      maxMarks,
      percentage,
      grade: gradeFor(percentage),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;