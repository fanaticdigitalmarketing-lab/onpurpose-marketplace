/**
 * Updated Auth Routes
 * JWT authentication with access/refresh tokens
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { authenticate, generateTokens, verifyRefreshToken } = require('../middleware/auth');
const { emailService } = require('../services');
const User = require('../models/User');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

// POST /api/auth/register
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { email, password, firstName, lastName, phone, isHost } = req.body;
    
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      isHost: isHost || false
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Save refresh token
    await user.update({ refreshToken });
    
    // Send welcome email
    emailService.sendWelcomeEmail(user.email, {
      firstName: user.firstName,
      isHost: user.isHost
    }).catch(console.error);
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isHost: user.isHost,
          isVerified: user.isVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Save refresh token and update last login
    await user.update({
      refreshToken,
      lastLogin: new Date()
    });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isHost: user.isHost,
          isVerified: user.isVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/refresh - Get new access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }
    
    // Verify refresh token
    const userId = await verifyRefreshToken(refreshToken);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    
    // Generate new tokens
    const tokens = generateTokens(userId);
    
    // Update refresh token in database
    await User.update(
      { refreshToken: tokens.refreshToken },
      { where: { id: userId } }
    );
    
    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Clear refresh token
    await User.update(
      { refreshToken: null },
      { where: { id: req.userId } }
    );
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
