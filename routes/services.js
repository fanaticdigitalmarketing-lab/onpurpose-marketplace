const express = require('express');
const { body, validationResult } = require('express-validator');
const { Service, User } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user's services
router.get('/my-services', authMiddleware, async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['username'] }]
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create service (protected)
router.post('/', authMiddleware, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price } = req.body;
    
    const service = await Service.create({
      title,
      description,
      price,
      userId: req.user.id
    });

    const serviceWithUser = await Service.findByPk(service.id, {
      include: [{ model: User, attributes: ['username'] }]
    });

    res.status(201).json(serviceWithUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update service (protected)
router.put('/:id', authMiddleware, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user owns the service
    if (service.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const { title, description, price } = req.body;
    
    await service.update({ title, description, price });

    const updatedService = await Service.findByPk(service.id, {
      include: [{ model: User, attributes: ['username'] }]
    });

    res.json(updatedService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete service (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user owns the service
    if (service.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    await service.destroy();
    
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
