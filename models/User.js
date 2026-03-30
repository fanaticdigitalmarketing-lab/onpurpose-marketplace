const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('customer', 'provider', 'admin'),
    defaultValue: 'customer',
    allowNull: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  verifyToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  verifyTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resetToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refreshTokenHash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  stripeAccountId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  stripeCustomerId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  trustScore: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 5.00
  },
  verifiedCredential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  credits: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  referralCode: {
    type: DataTypes.STRING,
    unique: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    afterCreate: async (user) => {
      // Generate unique referral code
      const code = 'FRIEND' + user.id.slice(0, 6).toUpperCase();
      await user.update({ referralCode: code });
    },
    beforeCreate: async (user) => {
      if (user.password) {
        const pepper = process.env.BCRYPT_PEPPER || '';
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password + pepper, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const pepper = process.env.BCRYPT_PEPPER || '';
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password + pepper, salt);
      }
    }
  }
});

// Instance method to verify password
User.prototype.verifyPassword = async function(password) {
  const pepper = process.env.BCRYPT_PEPPER || '';
  return await bcrypt.compare(password + pepper, this.password);
};

// Class method to find by email
User.findByEmail = async function(email) {
  return await this.findOne({ where: { email } });
};

module.exports = User;
