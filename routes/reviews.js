/**
 * Reviews API Routes
 * Handle service reviews and ratings
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

// POST /api/reviews - Create a review
router.post('/', authenticate, [
  body('bookingId').isUUID().withMessage('Valid booking ID required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').trim().isLength({ min: 10 }).withMessage('Comment must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { bookingId, rating, comment, title } = req.body;
    
    // Verify booking exists and belongs to user
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.customerId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({ where: { bookingId } });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already exists for this booking' });
    }
    
    const review = await Review.create({
      bookingId,
      customerId: req.userId,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      rating,
      comment,
      title
    });
    
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reviews/service/:serviceId - Get reviews for a service
router.get('/service/:serviceId', async (req, res) => {
  try {
    const reviews = await Review.findAndCountAll({
      where: { 
        serviceId: req.params.serviceId,
        isPublic: true
      },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate average rating
    const avgRating = reviews.rows.length > 0
      ? reviews.rows.reduce((sum, r) => sum + r.rating, 0) / reviews.rows.length
      : 0;
    
    res.json({
      success: true,
      data: reviews.rows,
      meta: {
        total: reviews.count,
        averageRating: parseFloat(avgRating.toFixed(1)),
        ratingCounts: {
          5: reviews.rows.filter(r => r.rating === 5).length,
          4: reviews.rows.filter(r => r.rating === 4).length,
          3: reviews.rows.filter(r => r.rating === 3).length,
          2: reviews.rows.filter(r => r.rating === 2).length,
          1: reviews.rows.filter(r => r.rating === 1).length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reviews/:id/response - Provider response to review
router.post('/:id/response', authenticate, [
  body('response').trim().isLength({ min: 5 }).withMessage('Response must be at least 5 characters')
], async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    if (review.providerId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await review.update({
      response: req.body.response,
      respondedAt: new Date()
    });
    
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
