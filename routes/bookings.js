const express = require('express');
const { body, validationResult } = require('express-validator');
const { Booking, Listing, User } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Create booking request
router.post('/', authMiddleware, [
  body('listingId').isInt().withMessage('Listing ID must be an integer'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { listingId, startDate, endDate } = req.body;

    // Check if listing exists
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is not booking their own listing
    if (listing.userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot book your own listing' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Check for double booking conflicts
    const conflictBooking = await Booking.findOne({
      where: {
        listingId,
        status: 'accepted',
        [Op.or]: [
          {
            startDate: {
              [Op.lt]: end
            },
            endDate: {
              [Op.gt]: start
            }
          }
        ]
      }
    });

    if (conflictBooking) {
      return res.status(409).json({ 
        status: "error",
        message: "This service is already booked for the selected dates",
        code: 409,
        details: {
          startDate: conflictBooking.startDate,
          endDate: conflictBooking.endDate
        }
      });
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      listingId,
      startDate: start,
      endDate: end,
      status: 'pending'
    });

    // Return booking with related data
    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        { model: User, attributes: ['username', 'email'] },
        { model: Listing, attributes: ['title', 'price'] }
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

// Get bookings for a listing (host only)
router.get('/listing/:listingId', authMiddleware, async (req, res) => {
  try {
    const { listingId } = req.params;

    // Check if user owns the listing
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view these bookings' });
    }

    const bookings = await Booking.findAll({
      where: { listingId },
      include: [
        { model: User, attributes: ['username', 'email'] }
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

    // Find booking with listing
    const booking = await Booking.findByPk(id, {
      include: [{ model: Listing }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the listing
    if (booking.Listing.userId !== req.user.id) {
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
        { model: Listing, attributes: ['title', 'price'] }
      ]
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
