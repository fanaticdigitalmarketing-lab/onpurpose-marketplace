const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Database configuration
const config = {
  development: {
    dialect: 'sqlite',
    storage: './database/onpurpose_dev.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'onpurpose',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
};

const env = isProduction ? 'production' : 'development';
const sequelize = new Sequelize(config[env]);

// Test connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connected (${env})`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Sync database (DO NOT use force: true in production)
async function syncDatabase(alter = false) {
  try {
    if (isProduction) {
      // In production, use migrations instead of sync
      console.log('⚠️ Production: Run migrations manually');
      return;
    }
    
    await sequelize.sync({ alter });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  isProduction
};
