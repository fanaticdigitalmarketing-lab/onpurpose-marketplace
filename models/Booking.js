const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  date: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed'),
    defaultValue: 'pending'
  },
  totalPrice: DataTypes.FLOAT
}, {
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['serviceId']
    }
  ],
  underscored: false
});

module.exports = Booking;
