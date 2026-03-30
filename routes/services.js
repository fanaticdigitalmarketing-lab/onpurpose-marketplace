/**
 * Services API Routes
 * CRUD operations for services with trust score ranking
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const router = express.Router();

const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');
const { rankServicesByTrust } = require('../services/trustScore');
const Service = require('../models/Service');
const User = require('../models/User');
const Review = require('../models/Review');

// Validation rules
const serviceValidation = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be at least $0'),
  body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be 15-480 minutes'),
  body('category').trim().notEmpty().withMessage('Category is required')
];

// GET /api/services - List all services with trust score ranking
router.get('/', optionalAuth, [
  query('category').optional().isString(),
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { category, search, lat, lng, page = 1, limit = 20 } = req.query;
    
    const where = { isActive: true };
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (search) {
      const { sanitizeLikeQuery } = require('../middleware/security');
      const sanitizedSearch = sanitizeLikeQuery(search);
      where.title = { [require('sequelize').Op.iLike]: `%${sanitizedSearch}%` };
    }
    
    // Fetch services with provider info
    let services = await Service.findAll({
      where,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'bio', 'avatar', 'trustScore', 'verifiedCredential', 'isVerified']
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['id', 'rating', 'comment', 'createdAt']
        }
      ],
      limit: parseInt(limit) * 2, // Fetch more for ranking
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    // Apply trust score ranking
    const customerOpts = {
      location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
    };
    
    const rankedServices = rankServicesByTrust(services, customerOpts);
    
    // Paginate ranked results
    const paginatedServices = rankedServices.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedServices,
      pagination: {
        total: rankedServices.length,
        page: parseInt(page),
        pages: Math.ceil(rankedServices.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/services/my-services - Get provider's services
router.get('/my-services', authenticate, requireRole('provider'), async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { providerId: req.userId },
      include: [
        {
          model: Review,
          as: 'reviews',
          attributes: ['id', 'rating', 'comment']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching my services:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/services/:id - Get single service
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'bio', 'avatar', 'trustScore', 'verifiedCredential', 'isVerified', 'location']
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'avatar']
            }
          ]
        }
      ]
    });
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    if (!service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not available' });
    }
    
    res.json({ success: true, data: service });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/services - Create new service (provider only)
router.post('/', authenticate, requireRole('provider'), serviceValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { title, description, price, category, duration, location, isOnline } = req.body;
    
    const service = await Service.create({
      title,
      description,
      price,
      category,
      duration,
      location,
      isOnline: isOnline || false,
      providerId: req.userId
    });
    
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/services/:id - Update service
router.patch('/:id', authenticate, requireRole('provider'), async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    if (service.providerId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const { title, description, price, category, duration, location, isOnline, isActive } = req.body;
    
    await service.update({
      title,
      description,
      price,
      category,
      duration,
      location,
      isOnline,
      isActive
    });
    
    res.json({ success: true, data: service });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/services/:id - Delete service (soft delete)
router.delete('/:id', authenticate, requireRole('provider'), async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    if (service.providerId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await service.update({ isActive: false });
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
