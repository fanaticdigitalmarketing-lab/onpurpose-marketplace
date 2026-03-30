const { Sequelize } = require('sequelize');
require('dotenv').config();

// Resolve connection string: prefer DATABASE_URL (Railway/production),
// fall back to individual DB_* variables (local development).
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DIALECT } = process.env;

  if (DB_NAME && DB_USER && DB_PASSWORD && DB_HOST && DB_PORT) {
    const dialect = DB_DIALECT || 'postgres';
    connectionString = `${dialect}://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  } else {
    console.error(
      '[database] No database configuration found. ' +
      'Set DATABASE_URL for production or DB_NAME / DB_USER / DB_PASSWORD / DB_HOST / DB_PORT for development.'
    );
    process.exit(1);
  }
}

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: isProduction ? false : console.log,
  dialectOptions: isProduction
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
