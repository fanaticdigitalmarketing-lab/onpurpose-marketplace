const sequelize = require('../config/database');

const User = require('./User');
const Service = require('./Service');
const Booking = require('./Booking');

// Relationships
User.hasMany(Booking);
Booking.belongsTo(User);

Service.hasMany(Booking);
Booking.belongsTo(Service);

const db = {
  sequelize,
  User,
  Service,
  Booking
};

module.exports = db;
