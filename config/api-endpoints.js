// API Endpoints Configuration
const API_ENDPOINTS = {
  // Railway API (Backend)
  RAILWAY_API: process.env.API_URL || 'https://your-api.up.railway.app',
  
  // Railway Frontend
  RAILWAY_FRONTEND: process.env.FRONTEND_URL || 'https://your-app.up.railway.app',
  
  // Netlify API (Serverless Functions)
  NETLIFY_API: process.env.NETLIFY_URL || 'https://onpurpose.earth',
  
  // Local Development
  LOCAL_API: process.env.LOCAL_API || 'http://localhost:3000',
  
  // API Paths
  ENDPOINTS: {
    HEALTH: '/health',
    API_INFO: '/api',
    HOSTS: '/api/hosts',
    USERS: '/api/users',
    BOOKINGS: '/api/bookings',
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      VERIFY: '/api/auth/verify'
    },
    PAYMENTS: {
      WEBHOOK: '/api/payment/webhook',
      STRIPE_CONNECT: '/api/payment/connect'
    }
  }
};

// Get current environment API base URL
const getApiBaseUrl = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'production':
      return API_ENDPOINTS.RAILWAY_API;
    case 'development':
      return API_ENDPOINTS.LOCAL_API;
    default:
      return API_ENDPOINTS.LOCAL_API;
  }
};

// Get frontend URL
const getFrontendUrl = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'production':
      return API_ENDPOINTS.RAILWAY_FRONTEND;
    case 'development':
      return API_ENDPOINTS.LOCAL_API;
    default:
      return API_ENDPOINTS.LOCAL_API;
  }
};

// Build full endpoint URLs
const buildEndpointUrl = (path) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path}`;
};

// Build frontend URLs
const buildFrontendUrl = (path) => {
  const baseUrl = getFrontendUrl();
  return `${baseUrl}${path}`;
};

module.exports = {
  API_ENDPOINTS,
  getApiBaseUrl,
  getFrontendUrl,
  buildEndpointUrl,
  buildFrontendUrl
};
