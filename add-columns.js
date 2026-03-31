require('dotenv').config();
const { Sequelize } = require('sequelize');

const dbUrl = process.env.DATABASE_URL || 'sqlite:./dev.sqlite';
const sequelize = new Sequelize(dbUrl, {
  logging: console.log,
  dialect: 'sqlite',
  storage: 'dev.sqlite'
});

async function addMissingColumns() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Add phone column if it doesn't exist
    try {
      await sequelize.getQueryInterface().addColumn('Users', 'phone', {
        type: Sequelize.STRING,
        allowNull: true
      });
      console.log('Added phone column');
    } catch (err) {
      if (!err.message.includes('duplicate column name')) {
        console.log('Phone column might already exist:', err.message);
      }
    }
    
    // Add cashApp column if it doesn't exist
    try {
      await sequelize.getQueryInterface().addColumn('Users', 'cashApp', {
        type: Sequelize.STRING,
        allowNull: true
      });
      console.log('Added cashApp column');
    } catch (err) {
      if (!err.message.includes('duplicate column name')) {
        console.log('CashApp column might already exist:', err.message);
      }
    }
    
    console.log('Database columns updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Unable to update database:', error);
    process.exit(1);
  }
}

addMissingColumns();
