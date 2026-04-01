const express = require('express');
const { body, validationResult } = require('express-validator');
const { Booking, Service, User } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Create booking request
router.post('/', authMiddleware, [
  body('serviceId').isUUID().withMessage('Service ID must be valid'),
  body('date').isISO8601().withMessage('Date must be a valid date'),
  body('time').optional().isISO8601().withMessage('Time must be a valid time')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceId, date, time } = req.body;

    // Check if service exists
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user is not booking their own service
    if (service.userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot book your own service' });
    }

    // Combine date and time to create datetime
    const bookingDateTime = new Date(`${date}T${time || '12:00:00'}`);

    // Check for double booking conflicts
    const conflictBooking = await Booking.findOne({
      where: {
        serviceId,
        status: 'accepted',
        [Op.or]: [
          {
            date: {
              [Op.lt]: bookingDateTime
            }
          }
        ]
      }
    });

    if (conflictBooking) {
      return res.status(409).json({ 
        status: "error",
        message: "This service is already booked for the selected date and time",
        code: 409,
        details: {
          date: conflictBooking.date,
          time: conflictBooking.time
        }
      });
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      serviceId,
      date: bookingDateTime,
      status: 'pending'
    });

    // Return booking with related data
    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        { model: User, attributes: ['username', 'email'] },
        { model: Service, attributes: ['title', 'price'] }
      ]
    });

    res.status(201).json(bookingWithDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Listing, attributes: ['title', 'price'], include: [{ model: User, attributes: ['username'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bookings for a service (host only)
router.get('/service/:serviceId', authMiddleware, async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Check if user owns the service
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view these bookings' });
    }

    const bookings = await Booking.findAll({
      where: { serviceId },
      include: [
        { model: User, attributes: ['username', 'email'] },
        { model: Service, attributes: ['title', 'price'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (host only)
router.put('/:id', authMiddleware, [
  body('status').isIn(['accepted', 'rejected']).withMessage('Status must be accepted or rejected')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Find booking with service
    const booking = await Booking.findByPk(id, {
      include: [{ model: Service }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the service
    if (booking.Service.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Check if booking is still pending
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking has already been ' + booking.status });
    }

    // Update booking status
    await booking.update({ status });

    // Return updated booking with details
    const updatedBooking = await Booking.findByPk(id, {
      include: [
        { model: User, attributes: ['username', 'email'] },
        { model: Service, attributes: ['title', 'price'] }
      ]
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
