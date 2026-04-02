const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM('customer', 'provider'),
    defaultValue: 'customer'
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Password comparison method
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
