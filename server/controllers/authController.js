const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const makeToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Wrong email or password' });
    }
    res.json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};