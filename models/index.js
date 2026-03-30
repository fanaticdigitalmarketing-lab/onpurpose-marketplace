/**
 * OnPurpose Models Index
 * Defines all model associations
 * © 2025 OnPurpose Inc. All rights reserved.
 */

const User = require('./User');
const Service = require('./Service');
const Booking = require('./Booking');
const Review = require('./Review');
const Availability = require('./Availability');
const BlockedDate = require('./BlockedDate');
const { sequelize } = require('../config/database');

// User associations
User.hasMany(Service, { foreignKey: 'providerId', as: 'services' });
User.hasMany(Booking, { foreignKey: 'userId', as: 'customerBookings' });
User.hasMany(Booking, { foreignKey: 'providerId', as: 'providerBookings' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
User.hasMany(Availability, { foreignKey: 'providerId', as: 'availability' });
User.hasMany(BlockedDate, { foreignKey: 'providerId', as: 'blockedDates' });

// Service associations
Service.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });
Service.hasMany(Booking, { foreignKey: 'serviceId', as: 'bookings' });
Service.hasMany(Review, { foreignKey: 'serviceId', as: 'reviews' });

// Booking associations
Booking.belongsTo(User, { foreignKey: 'userId', as: 'customer' });
Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });

// Review associations
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Review.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// Availability associations
Availability.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

// BlockedDate associations
BlockedDate.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

const models = {
  User,
  Service,
  Booking,
  Review,
  Availability,
  BlockedDate,
  sequelize
};

module.exports = models;
