const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// FORCE HTTPS (important for production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
  }
  next();
});

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint with environment status
app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: process.env.DATABASE_URL ? 'configured' : 'missing',
      jwt: process.env.JWT_SECRET ? 'configured' : 'missing',
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
      email: process.env.EMAIL_HOST ? 'configured' : 'missing'
    }
  };
  
  console.log('Health check requested:', healthData);
  res.status(200).json(healthData);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'OnPurpose Hospitality Marketplace',
    tagline: 'Connection, not dating',
    status: 'operational',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      hosts: '/api/hosts',
      bookings: '/api/bookings'
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'OnPurpose API Server',
    version: '1.0.0',
    status: 'operational',
    endpoints: [
      'GET / - Welcome message',
      'GET /health - Health check',
      'GET /api - This endpoint',
      'POST /api/auth/register - User registration',
      'POST /api/auth/login - User login',
      'GET /api/hosts - Browse hosts',
      'POST /api/bookings - Create booking'
    ],
    environment_status: {
      database: process.env.DATABASE_URL ? '✅ Ready' : '❌ Not configured',
      authentication: process.env.JWT_SECRET ? '✅ Ready' : '❌ Not configured',
      payments: process.env.STRIPE_SECRET_KEY ? '✅ Ready' : '❌ Not configured',
      email: process.env.EMAIL_HOST ? '✅ Ready' : '❌ Not configured'
    }
  });
});

// Simple auth endpoints (without database for now)
app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Mock registration response
  res.status(201).json({
    message: 'Registration endpoint ready',
    note: 'Database connection required for full functionality',
    received: {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    }
  });
});

app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Mock login response
  res.json({
    message: 'Login endpoint ready',
    note: 'Database connection required for full functionality',
    received: {
      email: req.body.email
    }
  });
});

// Mock hosts endpoint
app.get('/api/hosts', (req, res) => {
  res.json({
    message: 'Hosts endpoint ready',
    note: 'Database connection required for real host data',
    sample_hosts: [
      {
        id: 1,
        name: 'Sarah Chen',
        category: 'Local Expert',
        location: 'Manhattan, NYC',
        rating: 4.9,
        price: 45
      },
      {
        id: 2,
        name: 'Marcus Johnson',
        category: 'Cultural Guide',
        location: 'Brooklyn, NYC',
        rating: 4.8,
        price: 35
      }
    ]
  });
});

// Mock bookings endpoint
app.post('/api/bookings', (req, res) => {
  res.json({
    message: 'Bookings endpoint ready',
    note: 'Stripe and database connections required for real bookings',
    received: req.body
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ message: 'Internal server error' });
  } else {
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    available_routes: ['/', '/health', '/api', '/api/auth/register', '/api/auth/login', '/api/hosts', '/api/bookings']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OnPurpose Production Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API info: http://localhost:${PORT}/api`);
  
  // Environment check
  console.log('\n📋 Environment Status:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ configured' : '❌ missing'}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ configured' : '❌ missing'}`);
  console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ configured' : '❌ missing'}`);
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST ? '✅ configured' : '❌ missing'}`);
  
  if (!process.env.DATABASE_URL) {
    console.log('\n⚠️  Add environment variables to enable full functionality');
  } else {
    console.log('\n✅ Ready for OnPurpose pilot launch!');
  }
});

module.exports = app;
