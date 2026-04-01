const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subscriber = sequelize.define('Subscriber', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('customer', 'provider'),
      allowNull: false,
    },
    signedUpAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      // Note: NOT a foreign key constraint - survives user deletion
    },
  }, {
    tableName: 'subscribers',
    // IMPORTANT: No onDelete: 'CASCADE' - preserves subscriber data even if user is deleted
    // No paranoid: true - we want to keep all subscriber records permanently
  });

  return Subscriber;
};
