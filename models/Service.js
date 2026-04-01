const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: DataTypes.FLOAT,
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  category: DataTypes.STRING,
  duration: DataTypes.INTEGER,
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    {
      fields: ['userId']
    }
  ],
  underscored: false
});

module.exports = Service;
