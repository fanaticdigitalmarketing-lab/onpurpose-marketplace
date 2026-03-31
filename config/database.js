const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL environment variable is not set');
  console.warn('The application will start but database features will not work');
}

const sequelize = new Sequelize(databaseUrl || 'sqlite::memory:', {
  dialect: databaseUrl ? 'postgres' : 'sqlite',
  protocol: databaseUrl ? 'postgres' : undefined,
  logging: false,
  ...(databaseUrl && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })
});

module.exports = sequelize;
