/**
 * Bookings API Routes
 * Handle booking creation and management
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { authenticate, requireHost } = require('../middleware/auth');
const { emailService, stripeService } = require('../services');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

// POST /api/bookings - Create a new booking
router.post('/', authenticate, [
  body('serviceId').isUUID().withMessage('Valid service ID required'),
  body('scheduledDate').isDate().withMessage('Valid date required'),
  body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time required (HH:MM)'),
  body('notes').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { serviceId, scheduledDate, scheduledTime, notes } = req.body;
    
    // Get service details
    const service = await Service.findByPk(serviceId, {
      include: [{ model: User, as: 'provider' }]
    });
    
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    // Calculate fees
    const fees = stripeService.calculateFees(service.price);
    
    // Create booking
    const booking = await Booking.create({
      customerId: req.userId,
      serviceId,
      providerId: service.providerId,
      scheduledDate,
      scheduledTime,
      duration: service.duration,
      price: fees.total,
      platformFee: fees.platformFee,
      totalAmount: fees.total,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    // Send notification emails
    const customer = await User.findByPk(req.userId);
    
    emailService.sendBookingConfirmation(customer.email, {
      service,
      provider: service.provider,
      booking,
      customer
    }).catch(console.error);
    
    emailService.sendBookingNotification(service.provider.email, {
      service,
      customer,
      booking
    }).catch(console.error);
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings - Get user's bookings
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = {
      [require('sequelize').Op.or]: [
        { customerId: req.userId },
        { providerId: req.userId }
      ]
    };
    
    if (status) where.status = status;
    
    const bookings = await Booking.findAndCountAll({
      where,
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'provider', attributes: ['id', 'firstName', 'lastName'] }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['scheduledDate', 'DESC']]
    });
    
    res.json({
      success: true,
      data: bookings.rows,
      pagination: {
        total: bookings.count,
        page: parseInt(page),
        pages: Math.ceil(bookings.count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'provider', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check authorization
    if (booking.customerId !== req.userId && booking.providerId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/bookings/:id/status - Update booking status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Check authorization
    const isCustomer = booking.customerId === req.userId;
    const isProvider = booking.providerId === req.userId;
    
    if (!isCustomer && !isProvider) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Status-specific validations
    if (status === 'confirmed' && !isProvider) {
      return res.status(403).json({ success: false, message: 'Only provider can confirm' });
    }
    
    if (status === 'completed' && !isProvider) {
      return res.status(403).json({ success: false, message: 'Only provider can mark as completed' });
    }
    
    const updateData = { status };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      // Process refund if paid
      if (booking.paymentStatus === 'paid' && booking.stripePaymentIntentId) {
        // Handle refund logic here
      }
    }
    
    await booking.update(updateData);
    
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
