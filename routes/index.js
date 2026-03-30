/**
 * API Routes Index
 * Export all route modules
 */

const authRoutes = require('./auth');
const serviceRoutes = require('./services');
const bookingRoutes = require('./bookings');
const reviewRoutes = require('./reviews');
const paymentRoutes = require('./payments');
const userRoutes = require('./users');

module.exports = {
  authRoutes,
  serviceRoutes,
  bookingRoutes,
  reviewRoutes,
  paymentRoutes,
  userRoutes
};
