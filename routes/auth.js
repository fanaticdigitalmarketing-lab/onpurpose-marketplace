const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, generateTokens, verifyRefreshToken, hashRefreshToken } = require('../middleware/auth');
const { emailService } = require('../services');
const User = require('../models/User');
const router = express.Router();

// Register endpoint
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('role').optional().isIn(['customer', 'provider']).withMessage('Role must be customer or provider')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, name, role, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user (password hashed in model hook)
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'customer',
      location
    });

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Save refresh token hash
    await user.update({ refreshTokenHash: hashRefreshToken(refreshToken) });

    // Send welcome email
    emailService.sendWelcomeEmail(user.email, {
      firstName: user.name.split(' ')[0],
      isHost: user.role === 'provider'
    }).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password using model method
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Save refresh token hash
    await user.update({ refreshTokenHash: hashRefreshToken(refreshToken) });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    
    // Update refresh token hash in database
    await User.update(
      { refreshTokenHash: hashRefreshToken(tokens.refreshToken) },
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
    // Clear refresh token hash
    await User.update(
      { refreshTokenHash: null },
      { where: { id: req.userId } }
    );
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user profile
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
