require('dotenv').config();
const { Sequelize } = require('sequelize');

// Use SQLite for development, PostgreSQL for production
const isDevelopment = process.env.NODE_ENV !== 'production';

let sequelize;

if (isDevelopment) {
  // Development: Use SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './dev.sqlite',
    logging: console.log
  });
} else {
  // Production: Use PostgreSQL with environment variable fallback
  const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL or NETLIFY_DATABASE_URL environment variable is required in production');
  }

  sequelize = new Sequelize(databaseUrl, {
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
}

module.exports = sequelize;
