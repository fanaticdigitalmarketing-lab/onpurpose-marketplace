const express = require('express');
const { Service, Booking } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// My services
router.get('/services', auth, async (req, res) => {
  const services = await Service.findAll({
    where: { providerId: req.user.id }
  });

  res.json(services);
});

// Bookings for my services
router.get('/bookings', auth, async (req, res) => {
  const services = await Service.findAll({
    where: { providerId: req.user.id }
  });

  const serviceIds = services.map(s => s.id);

  const bookings = await Booking.findAll({
    where: { serviceId: serviceIds }
  });

  res.json(bookings);
});

module.exports = router;
