const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  platformFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  providerAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  stripeSessionId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  qrTokenHash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  sessionStartTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sessionEndTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sessionDurationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  escrowReleaseScheduled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  escrowReleaseAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringGroupId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  timestamps: true
});

module.exports = Booking;
