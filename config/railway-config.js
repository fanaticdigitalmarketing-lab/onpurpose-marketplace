// Railway Deployment Configuration
const RAILWAY_CONFIG = {
  // Railway URLs
  BACKEND_URL: process.env.API_URL || 'https://your-api.up.railway.app',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://your-app.up.railway.app',
  
  // Railway Environment Variables
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN,
  
  // Deployment Settings
  DEPLOYMENT: {
    BUILD_COMMAND: 'npm install && npm run build',
    START_COMMAND: 'npm start',
    HEALTH_CHECK_PATH: '/health',
    
    // Required Environment Variables for Railway
    REQUIRED_VARS: [
      'NODE_ENV',
      'DATABASE_URL',
      'JWT_SECRET',
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'EMAIL_HOST',
      'EMAIL_USER',
      'EMAIL_PASS'
    ],
    
    // Optional Environment Variables
    OPTIONAL_VARS: [
      'API_URL',
      'FRONTEND_URL',
      'CORS_ORIGIN',
      'RATE_LIMIT_MAX',
      'LOG_LEVEL'
    ]
  },
  
  // Stripe Webhook Configuration
  STRIPE: {
    WEBHOOK_URL: process.env.API_URL ? 
      `${process.env.API_URL}/api/payment/webhook` : 
      'https://your-api.up.railway.app/api/payment/webhook',
    
    REQUIRED_EVENTS: [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'checkout.session.completed'
    ]
  },
  
  // CORS Configuration for Railway
  CORS: {
    ALLOWED_ORIGINS: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : [
        'https://your-app.up.railway.app',
        'https://onpurpose.earth',
        'https://onpurpose.app'
      ],
    CREDENTIALS: true
  }
};

// Validate Railway configuration
const validateRailwayConfig = () => {
  const missing = [];
  
  RAILWAY_CONFIG.DEPLOYMENT.REQUIRED_VARS.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.warn('⚠️ Missing required Railway environment variables:', missing);
    return false;
  }
  
  console.log('✅ Railway configuration validated');
  return true;
};

// Get Railway deployment URLs
const getRailwayUrls = () => {
  return {
    backend: RAILWAY_CONFIG.BACKEND_URL,
    frontend: RAILWAY_CONFIG.FRONTEND_URL,
    health: `${RAILWAY_CONFIG.BACKEND_URL}${RAILWAY_CONFIG.DEPLOYMENT.HEALTH_CHECK_PATH}`,
    webhook: RAILWAY_CONFIG.STRIPE.WEBHOOK_URL
  };
};

module.exports = {
  RAILWAY_CONFIG,
  validateRailwayConfig,
  getRailwayUrls
};
