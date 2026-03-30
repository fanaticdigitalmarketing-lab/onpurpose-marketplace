// ========================================
// ONPURPOSE MARKETPLACE - WINDSURF SECURED SERVER
// ========================================
// Complete secured backend with all security enhancements
// ========================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Import security middleware
const { securityMiddleware, validationRules } = require('./middleware/security');
const auth = require('./middleware/auth');
const EmailService = require('./services/emailService');

// Database setup
const sequelize = require('./config/sequelize');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== SECURITY MIDDLEWARE ====================
// Apply helmet security headers
app.use(securityMiddleware.helmet);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Apply general rate limiting
app.use(securityMiddleware.rateLimits.general);

// Input sanitization
app.use(securityMiddleware.sanitize);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ==================== DATABASE MODELS ====================
const User = sequelize.define('User', {
  id: {
    type: require('sequelize').DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: { type: require('sequelize').DataTypes.STRING, allowNull: false },
  lastName: { type: require('sequelize').DataTypes.STRING, allowNull: false },
  email: { type: require('sequelize').DataTypes.STRING, allowNull: false, unique: true },
  password: { type: require('sequelize').DataTypes.STRING, allowNull: false },
  phone: { type: require('sequelize').DataTypes.STRING },
  isHost: { type: require('sequelize').DataTypes.BOOLEAN, defaultValue: false },
  isVerified: { type: require('sequelize').DataTypes.BOOLEAN, defaultValue: false },
  bio: { type: require('sequelize').DataTypes.TEXT },
  location: { type: require('sequelize').DataTypes.STRING }
}, { timestamps: true });

const Host = sequelize.define('Host', {
  id: {
    type: require('sequelize').DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: { type: require('sequelize').DataTypes.INTEGER, allowNull: false },
  category: { type: require('sequelize').DataTypes.STRING, allowNull: false },
  hourlyRate: { type: require('sequelize').DataTypes.DECIMAL(10, 2), allowNull: false },
  experience: { type: require('sequelize').DataTypes.TEXT, allowNull: false },
  skills: { type: require('sequelize').DataTypes.JSON },
  languages: { type: require('sequelize').DataTypes.JSON },
  location: { type: require('sequelize').DataTypes.STRING, allowNull: false },
  isActive: { type: require('sequelize').DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

const Booking = sequelize.define('Booking', {
  id: {
    type: require('sequelize').DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: { type: require('sequelize').DataTypes.INTEGER, allowNull: false },
  hostId: { type: require('sequelize').DataTypes.INTEGER, allowNull: false },
  startTime: { type: require('sequelize').DataTypes.DATE, allowNull: false },
  endTime: { type: require('sequelize').DataTypes.DATE, allowNull: false },
  notes: { type: require('sequelize').DataTypes.TEXT },
  totalPrice: { type: require('sequelize').DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: require('sequelize').DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending'
  }
}, { timestamps: true });

// Relationships
User.hasMany(Host, { foreignKey: 'userId' });
Host.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Host.hasMany(Booking, { foreignKey: 'hostId' });
Booking.belongsTo(Host, { foreignKey: 'hostId', as: 'host' });

// ==================== AUTHENTICATION ROUTES ====================
app.post('/api/auth/register', 
  validationRules.userRegistration,
  securityMiddleware.handleValidationErrors,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, phone } = req.body;
      
      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }
      
      // Hash password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        isVerified: false
      });
      
      // Generate JWT
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Registration failed', 
        error: error.message 
      });
    }
  }
);

app.post('/api/auth/login',
  securityMiddleware.rateLimits.auth,
  validationRules.userLogin,
  securityMiddleware.handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Check password
      const bcrypt = require('bcryptjs');
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Generate JWT
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isHost: user.isHost,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Login failed', 
        error: error.message 
      });
    }
  }
);

// ==================== HOST APPLICATION ROUTE ====================
app.post('/api/hosts/apply',
  auth,
  validationRules.hostApplication,
  securityMiddleware.handleValidationErrors,
  async (req, res) => {
    try {
      const { category, hourlyRate, experience, skills, languages, location } = req.body;
      
      // Check if user already has a host application
      const existingHost = await Host.findOne({ 
        where: { userId: req.user.id } 
      });
      
      if (existingHost) {
        return res.status(400).json({
          success: false,
          message: 'You already have a host application'
        });
      }
      
      // Create host application
      const hostApplication = await Host.create({
        userId: req.user.id,
        category,
        hourlyRate,
        experience,
        skills,
        languages,
        location
      });
      
      // Send confirmation email
      const user = await User.findByPk(req.user.id);
      await EmailService.sendBookingConfirmation(user.email, {
        userName: `${user.firstName} ${user.lastName}`,
        hostTitle: `${category} Host Application`,
        location,
        totalPrice: hourlyRate,
        bookingId: `HOST-${hostApplication.id}`
      });
      
      res.status(201).json({
        success: true,
        message: 'Host application submitted successfully',
        application: hostApplication
      });
    } catch (error) {
      console.error('Host application error:', error);
      res.status(500).json({
        success: false,
        message: 'Host application failed',
        error: error.message
      });
    }
  }
);

// ==================== BOOKING ROUTES ====================
app.post('/api/bookings',
  auth,
  securityMiddleware.rateLimits.booking,
  validationRules.bookingCreation,
  securityMiddleware.handleValidationErrors,
  async (req, res) => {
    try {
      const { hostId, startTime, endTime, notes } = req.body;
      
      // Find host
      const host = await Host.findByPk(hostId);
      if (!host || !host.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Host not found or not active'
        });
      }
      
      // Calculate total price
      const hours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
      const totalPrice = hours * parseFloat(host.hourlyRate);
      
      // Create booking
      const booking = await Booking.create({
        userId: req.user.id,
        hostId,
        startTime,
        endTime,
        notes,
        totalPrice
      });
      
      // Get user and host details for emails
      const user = await User.findByPk(req.user.id);
      const hostUser = await User.findByPk(host.userId);
      
      // Send booking confirmation to user
      await EmailService.sendBookingConfirmation(user.email, {
        userName: `${user.firstName} ${user.lastName}`,
        hostTitle: `${host.category} - ${hostUser.firstName} ${hostUser.lastName}`,
        location: host.location,
        startTime,
        endTime,
        totalPrice,
        bookingId: `BK-${booking.id}`
      });
      
      // Send notification to host
      await EmailService.sendHostNotification(hostUser.email, {
        userName: `${user.firstName} ${user.lastName}`,
        hostTitle: `${host.category} Experience`,
        startTime,
        endTime,
        totalPrice,
        bookingId: `BK-${booking.id}`
      });
      
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: await Booking.findByPk(booking.id, {
          include: [
            { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
            { model: Host, as: 'host' }
          ]
        })
      });
    } catch (error) {
      console.error('Booking creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Booking creation failed',
        error: error.message
      });
    }
  }
);

// ==================== USER ROUTES ====================
app.get('/api/users/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { 
          model: Host, 
          attributes: ['id', 'category', 'hourlyRate', 'location', 'isActive'] 
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

app.patch('/api/users/profile',
  auth,
  validationRules.profileUpdate,
  securityMiddleware.handleValidationErrors,
  async (req, res) => {
    try {
      const { firstName, lastName, bio, phone } = req.body;
      
      await User.update(
        { firstName, lastName, bio, phone },
        { where: { id: req.user.id } }
      );
      
      const updatedUser = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        message: 'Profile update failed',
        error: error.message
      });
    }
  }
);

// ==================== HOST ROUTES ====================
app.get('/api/hosts', async (req, res) => {
  try {
    const { category, location, page = 1, limit = 10 } = req.query;
    
    const whereClause = { isActive: true };
    if (category) whereClause.category = category;
    if (location) whereClause.location = { [require('sequelize').Op.iLike]: `%${location}%` };
    
    const hosts = await Host.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['firstName', 'lastName', 'bio', 'location']
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      hosts: hosts.rows,
      total: hosts.count,
      page: parseInt(page),
      totalPages: Math.ceil(hosts.count / parseInt(limit))
    });
  } catch (error) {
    console.error('Hosts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hosts',
      error: error.message
    });
  }
});

// ==================== BOOKING MANAGEMENT ====================
app.get('/api/bookings/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] },
        { 
          model: Host, as: 'host',
          include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('My bookings fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

app.patch('/api/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: User, as: 'user' },
        { model: Host, as: 'host', include: [{ model: User, as: 'user' }] }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns this booking
    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel confirmed or completed bookings'
      });
    }
    
    // Update booking status
    await booking.update({ status: 'cancelled' });
    
    // Send cancellation email
    await EmailService.sendBookingCancellation(booking.user.email, {
      userName: `${booking.user.firstName} ${booking.user.lastName}`,
      hostTitle: `${booking.host.category} - ${booking.host.user.firstName} ${booking.host.user.lastName}`,
      location: booking.host.location,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice,
      bookingId: `BK-${booking.id}`
    });
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Booking cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Booking cancellation failed',
      error: error.message
    });
  }
});

// ==================== HEALTH CHECK ====================
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      message: 'Database connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ==================== START SERVER ====================
const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    app.listen(PORT, () => {
      console.log(`🚀 OnPurpose secured server running on port ${PORT}`);
      console.log(`🔒 Security features enabled:`);
      console.log(`   - Helmet security headers`);
      console.log(`   - Rate limiting`);
      console.log(`   - Input sanitization`);
      console.log(`   - Request validation`);
      console.log(`   - JWT authentication`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();

// ==================== EXPORTS ====================
module.exports = app;

// ========================================
// END OF WINDSURF SECURED SERVER
// ========================================
