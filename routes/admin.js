const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Development endpoints
router.post('/login', (req, res) => {
  const token = jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ message: 'Admin login - development mode', token });
});

router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard endpoint - development mode' });
});

router.get('/hosts', (req, res) => {
  res.json({ message: 'Admin hosts endpoint - development mode', hosts: [] });
});

router.get('/users', (req, res) => {
  res.json({ message: 'Admin users endpoint - development mode', users: [] });
});

module.exports = router;
