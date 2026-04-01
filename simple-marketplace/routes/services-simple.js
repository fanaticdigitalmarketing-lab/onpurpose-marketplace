const express = require('express');
const { Service } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET ALL SERVICES
router.get('/', async (req, res) => {
  const services = await Service.findAll();
  res.json(services);
});

// CREATE SERVICE (PROVIDER ONLY)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, price } = req.body;

    const service = await Service.create({
      title,
      description,
      price,
      providerId: req.user.id // 🔥 KEY FIX
    });

    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
