const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sql } = require('../../config/database');

const app = express();

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
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const [result] = await sql`SELECT NOW() as timestamp`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'OnPurpose API',
    version: '1.0.0',
    description: 'Connection, not dating - NYC hospitality marketplace',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      hosts: '/api/hosts',
      bookings: '/api/bookings',
      users: '/api/users'
    },
    status: 'active',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Hosts endpoint
app.get('/api/hosts', async (req, res) => {
  try {
    const hosts = await sql`
      SELECT h.*, u."firstName", u."lastName", u.email
      FROM "Hosts" h
      JOIN "Users" u ON h."userId" = u.id
      WHERE h."isApproved" = true
      ORDER BY h."createdAt" DESC
    `;
    
    res.json({
      success: true,
      count: hosts.length,
      data: hosts
    });
  } catch (error) {
    console.error('Error fetching hosts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hosts'
    });
  }
});

// Users endpoint
app.get('/api/users', async (req, res) => {
  try {
    const users = await sql`
      SELECT id, email, "firstName", "lastName", "isHost", "isVerified", "createdAt"
      FROM "Users"
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to OnPurpose API',
    tagline: 'Connection, not dating',
    description: 'NYC hospitality marketplace connecting guests with local hosts',
    version: '1.0.0',
    status: 'live',
    endpoints: {
      health: '/health',
      api: '/api',
      hosts: '/api/hosts',
      users: '/api/users'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

module.exports.handler = serverless(app);
