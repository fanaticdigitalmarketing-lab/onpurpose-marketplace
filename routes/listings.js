const express = require('express');
const { body, validationResult } = require('express-validator');
const { Listing, User } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user's listings
router.get('/my-listings', authMiddleware, async (req, res) => {
  try {
    const listings = await Listing.findAll({
      where: { userId: req.user.id },
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.findAll({
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['username'] }]
    });
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create listing (protected)
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
    
    const listing = await Listing.create({
      title,
      description,
      price,
      userId: req.user.id
    });

    const listingWithUser = await Listing.findByPk(listing.id, {
      include: [{ model: User, attributes: ['username'] }]
    });

    res.status(201).json(listingWithUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update listing (protected)
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

    const listing = await Listing.findByPk(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const { title, description, price } = req.body;
    
    await listing.update({ title, description, price });

    const updatedListing = await Listing.findByPk(listing.id, {
      include: [{ model: User, attributes: ['username'] }]
    });

    res.json(updatedListing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete listing (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await listing.destroy();
    
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
