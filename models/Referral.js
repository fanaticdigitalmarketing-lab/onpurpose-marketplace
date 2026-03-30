/**
 * Referral Model
 * Tracks referrals and credits
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  referrerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  referredId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'Users', key: 'id' }
  },
  referralCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'expired'),
    defaultValue: 'pending'
  },
  creditAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 10.00
  },
  creditedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Referral;
