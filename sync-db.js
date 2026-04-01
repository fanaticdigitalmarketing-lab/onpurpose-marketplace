const { sequelize } = require('./models');

async function syncDatabase() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully!');
    
    // Test the Service model
    const { Service } = require('./models');
    const services = await Service.findAll();
    console.log(`Found ${services.length} services in database`);
    
    process.exit(0);
  } catch (error) {
    console.error('Database sync failed:', error);
    process.exit(1);
  }
}

syncDatabase();
