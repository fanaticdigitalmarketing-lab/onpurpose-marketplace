const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { body, validationResult } = require('express-validator');
// const User = require('../models/User'); // Disabled for development
// const auth = require('../middleware/auth'); // Disabled for development
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Development endpoints
router.get('/profile', (req, res) => {
  res.json({ message: 'User profile endpoint - development mode' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update profile endpoint - development mode' });
});

router.post('/profile/photo', (req, res) => {
  res.json({ message: 'Upload photo endpoint - development mode' });
});

router.delete('/account', (req, res) => {
  res.json({ message: 'Delete account endpoint - development mode' });
});

module.exports = router;
