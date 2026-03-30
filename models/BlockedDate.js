const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlockedDate = sequelize.define('BlockedDate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  providerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'blocked_dates',
  timestamps: true
});

module.exports = BlockedDate;
