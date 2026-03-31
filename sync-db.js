require('dotenv').config();
const { Sequelize } = require('sequelize');

const dbUrl = process.env.DATABASE_URL || 'sqlite:./dev.sqlite';
const sequelize = new Sequelize(dbUrl, {
  logging: console.log,
  dialect: dbUrl.startsWith('sqlite') ? 'sqlite' : 'postgres',
  storage: dbUrl.startsWith('sqlite') ? dbUrl.replace('sqlite:', '') : undefined,
  define: { underscored: false, timestamps: true }
});

// Define User model with all fields
const User = sequelize.define('User', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING, allowNull: false, unique: true },
  password: { type: Sequelize.STRING, allowNull: false },
  role: { type: Sequelize.ENUM('customer', 'provider', 'admin'), defaultValue: 'customer' },
  isVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
  isSuspended: { type: Sequelize.BOOLEAN, defaultValue: false },
  bio: { type: Sequelize.TEXT },
  location: { type: Sequelize.STRING },
  avatar: { type: Sequelize.STRING },
  verifyToken: { type: Sequelize.STRING },
  verifyTokenExpiry: { type: Sequelize.DATE },
  resetToken: { type: Sequelize.STRING },
  resetTokenExpiry: { type: Sequelize.DATE },
  refreshTokenHash: { type: Sequelize.STRING },
  stripeAccountId: { type: Sequelize.STRING },
  stripeCustomerId: { type: Sequelize.STRING },
  trustScore: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
  verifiedCredential: { type: Sequelize.BOOLEAN, defaultValue: false },
  phone: { type: Sequelize.STRING },
  cashApp: { type: Sequelize.STRING }
});

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Sync with alter:true to add missing columns
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Unable to sync database:', error);
    process.exit(1);
  }
}

syncDatabase();
