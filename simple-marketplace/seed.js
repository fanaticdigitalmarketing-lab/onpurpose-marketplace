require('dotenv').config();
const db = require('./models');
const { Service } = db;

async function seed() {
  await db.sequelize.sync({ force: true });

  await Service.bulkCreate([
    {
      title: 'Resume Review',
      description: 'Professional resume feedback',
      price: 50
    },
    {
      title: 'Career Coaching',
      description: '1-on-1 career guidance',
      price: 100
    }
  ]);

  console.log('Seeded!');
  process.exit();
}

seed();
