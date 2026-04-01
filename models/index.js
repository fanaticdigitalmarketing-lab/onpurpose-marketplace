const sequelize = require('../config/database');

const User = require('./User');
const Service = require('./Service');
const Booking = require('./Booking');
const Subscriber = require('./Subscriber');

// No automatic relationships - using manual foreign keys

const db = {
  sequelize,
  User,
  Service,
  Booking,
  Subscriber
};

module.exports = db;
