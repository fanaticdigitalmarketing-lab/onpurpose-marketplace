/**
 * Services Index
 * Export all services
 */

const emailService = require('./emailService');
const stripeService = require('./stripeService');
const trustScore = require('./trustScore');

module.exports = {
  emailService,
  stripeService,
  trustScore
};
