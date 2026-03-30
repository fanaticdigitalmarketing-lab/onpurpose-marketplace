const express = require('express');
const router = express.Router();
const { Booking } = require('../models');

// Create booking
router.post('/', async (req, res) => {
  try {
    const { userId, serviceId, date } = req.body;

    const booking = await Booking.create({
      userId,
      serviceId,
      date,
      status: 'pending'
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
