const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
// Railway redeploy trigger - 2024-04-01-15-05

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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

// Ideas generation endpoint
app.post('/api/ideas/generate', (req, res) => {
  const { skill, niche } = req.body;
  console.log('Generating ideas for:', skill, niche);
  
  const ideas = [
    {
      title: `${skill} Consulting for ${niche}`,
      description: `Provide expert ${skill.toLowerCase()} consulting services tailored specifically for ${niche.toLowerCase()} to help them achieve their goals.`,
      category: 'Consulting',
      price: '$75-150/hour'
    },
    {
      title: `${skill} Coaching Program`,
      description: `Create a comprehensive coaching program that teaches ${niche.toLowerCase()} how to master ${skill.toLowerCase()} through personalized guidance.`,
      category: 'Coaching', 
      price: '$50-100/session'
    },
    {
      title: `Done-for-You ${skill} Service`,
      description: `Offer a complete ${skill.toLowerCase()} service where you handle everything from strategy to execution for busy ${niche.toLowerCase()}.`,
      category: 'Service',
      price: '$200-500/project'
    }
  ];
  
  res.json({
    success: true,
    data: { ideas }
  });
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
