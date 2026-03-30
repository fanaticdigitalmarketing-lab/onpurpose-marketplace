const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Security middleware configuration
const securityMiddleware = {
  // Helmet configuration for security headers
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),

  // Rate limiting configurations
  rateLimits: {
    // General API rate limit: 100/15min
    general: rateLimit({
      windowMs: 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      message: {
        success: false,
        message: 'Too many requests, please try again later'
      },
      standardHeaders: true,
      legacyHeaders: false
    }),

    // Auth routes: 10/15min
    auth: rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: {
        success: false,
        message: 'Too many auth attempts, please try again later'
      }
    }),

    // Booking routes: 20/hour
    booking: rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 20,
      message: {
        success: false,
        message: 'Booking limit reached, please try again later'
      }
    })
  },

  // Input sanitization
  sanitize: (req, res, next) => {
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }
    next();
  },

  // HTTPS redirect for production
  httpsRedirect: (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  },

  // Central error handler — suppresses error.message in production
  handleError: (err, req, res, _next) => {
    console.error('Error:', err);
    const status = err.status || 500;
    if (process.env.NODE_ENV === 'production') {
      return res.status(status).json({
        success: false,
        message: status >= 500 ? 'Internal server error' : (err.expose ? err.message : 'Internal server error')
      });
    }
    res.status(status).json({
      success: false,
      message: err.message,
      stack: err.stack
    });
  }
};

// Validation rules
const validationRules = {
  register: [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['customer', 'provider'])
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  forgotPassword: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required')
  ],
  resetPassword: [
    body('token').notEmpty().withMessage('Token required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  createService: [
    body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
    body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('price').isFloat({ min: 1 }).withMessage('Price must be > 0'),
    body('category').trim().notEmpty().withMessage('Category required'),
    body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be 15-480 minutes'),
    body('location').optional().trim().isLength({ max: 200 }),
    body('isOnline').optional().isBoolean()
  ],
  updateService: [
    body('title').optional().trim().isLength({ min: 2, max: 200 }),
    body('description').optional().trim().isLength({ min: 10, max: 2000 }),
    body('price').optional().isFloat({ min: 1 }),
    body('duration').optional().isInt({ min: 15, max: 480 }),
    body('isActive').optional().isBoolean()
  ],
  createBooking: [
    body('serviceId').isUUID().withMessage('Valid service ID required'),
    body('date').isDate().withMessage('Valid date required'),
    body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time required (HH:MM)'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes max 500 characters')
  ],
  updateBookingStatus: [
    body('status').isIn(['confirmed', 'cancelled', 'completed']).withMessage('Invalid status')
  ],
  createReview: [
    body('bookingId').isUUID().withMessage('Valid booking ID required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment max 1000 chars')
  ],
  updateProfile: [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('bio').optional().trim().isLength({ max: 1000 }),
    body('location').optional().trim().isLength({ max: 200 }),
    body('avatar').optional().trim().isURL().withMessage('Avatar must be a valid URL')
  ],
  createAvailability: [
    body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day must be 0-6'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required')
  ],
  blockDate: [
    body('date').isDate().withMessage('Valid date required'),
    body('reason').optional().trim().isLength({ max: 200 })
  ],
  earlyAccess: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required')
  ],
  createCheckout: [
    body('bookingId').isUUID().withMessage('Valid booking ID required')
  ],
  checkinGenerate: [
    body('bookingId').isUUID().withMessage('Valid booking ID required')
  ],
  checkinScan: [
    body('token').notEmpty().withMessage('QR token required')
  ],
  checkinComplete: [
    body('bookingId').isUUID().withMessage('Valid booking ID required')
  ]
};

// Validate request middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Sanitize SQL LIKE wildcards
const sanitizeLikeQuery = (query) => {
  if (!query || typeof query !== 'string') return '';
  if (query.length > 100) query = query.substring(0, 100);
  return query.replace(/[%_\\]/g, '\\$&');
};

module.exports = {
  securityMiddleware,
  validationRules,
  validateRequest,
  sanitizeLikeQuery
};
