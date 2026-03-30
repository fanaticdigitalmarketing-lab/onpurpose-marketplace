const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    jwt_secret: process.env.JWT_SECRET ? 'configured' : 'not configured',
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
    email: process.env.EMAIL_HOST ? 'configured' : 'not configured'
  };
  
  console.log('Health check requested:', healthData);
  res.status(200).json(healthData);
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'OnPurpose API Server - Debug Mode',
    version: '1.0.0-debug',
    status: 'running',
    endpoints: [
      '/health - Health check with environment status',
      '/api - This endpoint',
      '/test - Simple test endpoint'
    ],
    environment_check: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'missing',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing',
      EMAIL_HOST: process.env.EMAIL_HOST ? 'configured' : 'missing'
    }
  });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'OnPurpose test endpoint working!',
    timestamp: new Date().toISOString(),
    server_status: 'operational'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'OnPurpose Hospitality Marketplace',
    tagline: 'Connection, not dating',
    status: 'debug mode',
    version: '1.0.0-debug',
    endpoints: {
      health: '/health',
      api: '/api',
      test: '/test'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Hidden' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    available_routes: ['/', '/health', '/api', '/test']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OnPurpose Debug Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API info: http://localhost:${PORT}/api`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  
  // Environment check
  console.log('\n📋 Environment Check:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ configured' : '❌ missing'}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ configured' : '❌ missing'}`);
  console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ configured' : '❌ missing'}`);
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST ? '✅ configured' : '❌ missing'}`);
});

module.exports = app;
