const express = require('express');
const { body, validationResult } = require('express-validator');
const { Booking, Service, User } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Create booking request
router.post('/', authMiddleware, [
  body('serviceId').isUUID().withMessage('Service ID must be valid'),
  body('date').isISO8601().withMessage('Date must be a valid date')
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
      return res.status(400).json({ 
        status: "error",
        message: "Cannot book your own service",
        code: 400
      });
    }

    // Validate date is not in the past
    const bookingDate = new Date(date);
    const now = new Date();
    if (bookingDate < now) {
      return res.status(400).json({
        status: "error",
        message: "Cannot book for a past date",
        code: 400
      });
    }

    // Combine date and time to create datetime
    const bookingDateTime = new Date(`${date}T${time || '12:00:00'}`);

    // Check for double booking conflicts
    const conflictBooking = await Booking.findOne({
      where: {
        serviceId,
        status: 'confirmed',
        date: bookingDateTime
      }
    });

    if (conflictBooking) {
      return res.status(409).json({ 
        status: "error",
        message: "This service is already booked for the selected date and time",
        code: 409,
        details: {
          date: conflictBooking.date,
          serviceId: serviceId
        }
      });
    }

    // Calculate total price
    const totalPrice = service.price;

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      serviceId,
      date: bookingDateTime,
      totalPrice,
      status: 'pending'
    });

    // Return booking with related data
    const bookingWithDetails = await Booking.findByPk(booking.id);

    res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      data: bookingWithDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: "error",
      message: 'Server error',
      code: 500
    });
  }
});

// Get user's bookings
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Service, attributes: ['title', 'price'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({
      status: "success",
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: "error",
      message: 'Server error',
      code: 500
    });
  }
});

// Get bookings for a service (provider only)
router.get('/service/:serviceId', authMiddleware, async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Check if user owns the service
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ 
        status: "error",
        message: 'Service not found',
        code: 404
      });
    }

    if (service.userId !== req.user.id) {
      return res.status(403).json({ 
        status: "error",
        message: 'Not authorized to view these bookings',
        code: 403
      });
    }

    const bookings = await Booking.findAll({
      where: { serviceId },
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Service, attributes: ['title', 'price'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: "success",
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: "error",
      message: 'Server error',
      code: 500
    });
  }
});

// Update booking status (provider only)
router.put('/:id', authMiddleware, [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Status must be pending, confirmed, completed, or cancelled')
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
      return res.status(404).json({ 
        status: "error",
        message: 'Booking not found',
        code: 404
      });
    }

    // Check if user owns the service
    if (booking.Service.userId !== req.user.id) {
      return res.status(403).json({ 
        status: "error",
        message: 'Not authorized to update this booking',
        code: 403
      });
    }

    await booking.update({ status });

    res.json({
      status: "success",
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: "error",
      message: 'Server error',
      code: 500
    });
  }
});

// Delete booking (user or provider)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Service }]
    });

    if (!booking) {
      return res.status(404).json({ 
        status: "error",
        message: 'Booking not found',
        code: 404
      });
    }

    // Check if user owns the booking or the service
    if (booking.userId !== req.user.id && booking.Service.userId !== req.user.id) {
      return res.status(403).json({ 
        status: "error",
        message: 'Not authorized to delete this booking',
        code: 403
      });
    }

    await booking.destroy();

    res.json({
      status: "success",
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      status: "error",
      message: 'Server error',
      code: 500
    });
  }
});

module.exports = router;
