const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
// Railway redeploy trigger - 2024-04-01-13-15

const authRoutes = require('./routes/auth');
const authSimpleRoutes = require('./routes/auth-simple');
const serviceRoutes = require('./routes/services');
const simpleBookingRoutes = require('./routes/simple-booking');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth-simple', authSimpleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/simple-booking', simpleBookingRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'OnPurpose API is running! Booking people, not places.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
