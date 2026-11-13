const express = require('express');
const { protect, authorize } = require('../middleware/auth');

module.exports = (Model, { populate = '', readRoles, writeRoles }) => {
  const router = express.Router();
  router.use(protect);

  router.get('/', authorize(...readRoles), async (req, res) => {
    try {
      const { search, page = 1, limit = 20, ...filters } = req.query;
      if (search) filters.name = { $regex: search, $options: 'i' };
      let q = Model.find(filters).sort({ createdAt: -1 });
      if (populate) q = q.populate(populate);
      const data = await q.skip((page - 1) * limit).limit(Number(limit));
      res.json(data);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  router.get('/:id', authorize(...readRoles), async (req, res) => {
    try {
      let q = Model.findById(req.params.id);
      if (populate) q = q.populate(populate);
      const item = await q;
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  router.post('/', authorize(...writeRoles), async (req, res) => {
    try {
      res.status(201).json(await Model.create(req.body));
    } catch (e) {
      const msg = e.code === 11000 ? 'Duplicate record already exists' : e.message;
      res.status(400).json({ message: msg });
    }
  });

  router.put('/:id', authorize(...writeRoles), async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ message: 'Deleted' });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  return router;
};