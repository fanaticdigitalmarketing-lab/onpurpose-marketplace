const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  date: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed'),
    defaultValue: 'pending'
  }
});

module.exports = Booking;
