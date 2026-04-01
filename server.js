const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (main website)
app.use(express.static(path.join(__dirname)));

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check (API only)
app.get('/api', (req, res) => {
  res.json({ message: 'OnPurpose API is running! Booking people, not places.' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    providers: '50+',
    bookings: '100+', 
    countries: '12+'
  });
});

// Early access endpoint
app.post('/api/early-access', (req, res) => {
  const { email } = req.body;
  console.log('Early access signup:', email);
  res.json({ success: true, message: 'Welcome to the early access list!' });
});

// Catch all route - must be last
app.get('*', (req, res) => {
  res.json({ message: 'OnPurpose API - Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
