const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use DATABASE_URL for production (Render) or individual variables for development
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 
  (process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST && process.env.DB_PORT
    ? `${process.env.DB_DIALECT || 'postgres'}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    : 'onpurpose'),
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
