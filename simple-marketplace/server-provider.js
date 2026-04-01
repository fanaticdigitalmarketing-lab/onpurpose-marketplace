require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/provider', require('./routes/providers'));

app.get('/', (req, res) => {
  res.json({ message: 'OnPurpose API LIVE 🚀' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    await sequelize.sync();

    app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
      console.log('🚀 Server running');
    });
  } catch (err) {
    console.error('❌ DB error:', err);
  }
};

start();
