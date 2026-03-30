const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('your_railway_postgres_url', {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

module.exports = sequelize;
