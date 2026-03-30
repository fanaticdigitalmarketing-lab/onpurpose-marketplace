const sequelize = require('./config/sequelize');
const bcrypt = require('bcryptjs');

async function quickSeed() {
  try {
    console.log('🌱 Starting quick database seeding...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');
    
    // Simple User model
    const User = sequelize.define('User', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      firstName: { type: Sequelize.STRING, allowNull: false },
      lastName: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      isHost: { type: Sequelize.BOOLEAN, defaultValue: false },
      isVerified: { type: Sequelize.BOOLEAN, defaultValue: true }
    });
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    await User.create({
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah@onpurpose.app',
      password: hashedPassword,
      isHost: true,
      isVerified: true
    });
    
    console.log('✅ Demo user created');
    console.log('🎉 Quick seeding complete!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

quickSeed();
