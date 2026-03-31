/**
 * OnPurpose — Book People, Not Places.
 * Human services marketplace server.
 * © 2025 OnPurpose Inc. All rights reserved.
 */

require('dotenv').config();

const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');

const auth = require('./middleware/auth');
const { securityMiddleware, validationRules, validateRequest, sanitizeLikeQuery } = require('./middleware/security');
const { rankServicesByTrust, updateProviderTrustScore } = require('./services/trustScore');
const emailService = require('./services/emailService');
const checkinRouter = require('./routes/checkin');

/* ─────────────────── ENV VALIDATION ─────────────────── */
const BCRYPT_PEPPER = process.env.BCRYPT_PEPPER || '';
const BCRYPT_ROUNDS = 12;
const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT) || 15;
const PORT = parseInt(process.env.PORT, 10) || 3000;

if (!process.env.RESEND_API_KEY) {
  console.warn('WARNING: RESEND_API_KEY is not set. Emails will not send.');
  console.warn('Add it in Railway → Variables → RESEND_API_KEY');
}

/* ─────────────────── DATABASE ─────────────────── */
const dbUrl = process.env.DATABASE_URL || 'sqlite:./dev.sqlite';
const sequelize = new Sequelize(dbUrl, {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialect: dbUrl.startsWith('sqlite') ? 'sqlite' : 'postgres',
  storage: dbUrl.startsWith('sqlite') ? dbUrl.replace('sqlite:', '') : undefined,
  define: { underscored: false, timestamps: true }
});

// Database connection health check
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully');
    console.log(`📊 Database URL: ${dbUrl.replace(/\/\/.*@/, '//***:***@')}`);
  })
  .catch(err => {
    console.error('❌ Unable to connect to database:', err);
    console.error(`📊 Database URL: ${dbUrl.replace(/\/\/.*@/, '//***:***@')}`);
  });

/* ═══════════════════ MODELS ═══════════════════ */

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('customer', 'provider', 'admin'), defaultValue: 'customer' },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isSuspended: { type: DataTypes.BOOLEAN, defaultValue: false },
  bio: { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
  verifyToken: { type: DataTypes.STRING },
  verifyTokenExpiry: { type: DataTypes.DATE },
  resetToken: { type: DataTypes.STRING },
  resetTokenExpiry: { type: DataTypes.DATE },
  refreshTokenHash: { type: DataTypes.STRING },
  stripeAccountId: { type: DataTypes.STRING },
  stripeCustomerId: { type: DataTypes.STRING },
  trustScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  verifiedCredential: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Service = sequelize.define('Service', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  providerId: { type: DataTypes.UUID, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  duration: { type: DataTypes.INTEGER, defaultValue: 60 },
  location: { type: DataTypes.STRING },
  isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
  avgRating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  serviceId: { type: DataTypes.UUID, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.TIME, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled'), defaultValue: 'pending' },
  totalAmount: { type: DataTypes.DECIMAL(10, 2) },
  platformFee: { type: DataTypes.DECIMAL(10, 2) },
  providerAmount: { type: DataTypes.DECIMAL(10, 2) },
  notes: { type: DataTypes.TEXT },
  paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'refunded'), defaultValue: 'pending' },
  stripeSessionId: { type: DataTypes.STRING },
  stripePaymentIntentId: { type: DataTypes.STRING },
  qrTokenHash: { type: DataTypes.STRING },
  sessionStartTime: { type: DataTypes.DATE },
  sessionEndTime: { type: DataTypes.DATE },
  sessionDurationMinutes: { type: DataTypes.INTEGER },
  escrowReleaseScheduled: { type: DataTypes.BOOLEAN, defaultValue: false },
  escrowReleaseAt: { type: DataTypes.DATE },
  isRecurring: { type: DataTypes.BOOLEAN, defaultValue: false },
  recurringGroupId: { type: DataTypes.UUID }
});

const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  bookingId: { type: DataTypes.UUID, allowNull: false, unique: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  serviceId: { type: DataTypes.UUID, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT }
});

const Availability = sequelize.define('Availability', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  providerId: { type: DataTypes.UUID, allowNull: false },
  dayOfWeek: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 6 } },
  startTime: { type: DataTypes.TIME, allowNull: false },
  endTime: { type: DataTypes.TIME, allowNull: false }
});

const BlockedDate = sequelize.define('BlockedDate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  providerId: { type: DataTypes.UUID, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  reason: { type: DataTypes.STRING }
});

const EarlyAccess = sequelize.define('EarlyAccess', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true }
});

/* ─────────────── ASSOCIATIONS ─────────────── */
User.hasMany(Service, { foreignKey: 'providerId', as: 'services' });
Service.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

Service.hasMany(Booking, { foreignKey: 'serviceId', as: 'bookings' });
Booking.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'reviewer' });

Service.hasMany(Review, { foreignKey: 'serviceId', as: 'reviews' });
Review.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

User.hasMany(Availability, { foreignKey: 'providerId', as: 'availability' });
Availability.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

User.hasMany(BlockedDate, { foreignKey: 'providerId', as: 'blockedDates' });
BlockedDate.belongsTo(User, { foreignKey: 'providerId', as: 'provider' });

/* ─────────────── INIT AUTH MIDDLEWARE ─────────────── */
auth.init(User);

const models = { User, Service, Booking, Review, Availability, BlockedDate, EarlyAccess };

/* ═══════════════════ EXPRESS APP ═══════════════════ */
const app = express();

// Store models + sequelize for route handlers
app.locals.models = models;
app.locals.sequelize = sequelize;

// HTTPS redirect in production
app.use(securityMiddleware.httpsRedirect);

// Stripe webhook MUST come before express.json()
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (_) { stripe = null; }

app.post('/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!stripe) return res.status(501).json({ success: false, message: 'Stripe not configured' });
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ success: false, message: 'Webhook error' });
    }
    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const booking = await Booking.findOne({ where: { stripeSessionId: session.id } });
        if (booking) {
          await booking.update({
            paymentStatus: 'paid',
            stripePaymentIntentId: session.payment_intent
          });
        }
      }
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook handler error:', err);
      res.status(500).json({ success: false });
    }
  }
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.method === 'POST' ? { ...req.body, password: '[REDACTED]' } : undefined,
    headers: req.headers,
    origin: req.headers.origin
  });
  next();
});

// Security middleware
app.use(securityMiddleware.helmet);

const origins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

// Always allow Netlify deploy previews and production domain
const netlifyOrigins = [
  'https://onpurpose.earth',
  'https://www.onpurpose.earth',
  process.env.NETLIFY_URL,         // set automatically by Netlify
  process.env.DEPLOY_PRIME_URL,    // Netlify deploy preview URL
].filter(Boolean);

const allOrigins = [...new Set([...origins, ...netlifyOrigins])];

app.use(cors({
  origin: (origin, cb) => {
    // Allow no-origin (mobile apps, Postman, server-to-server)
    if (!origin) return cb(null, true);
    // Allow Netlify deploy previews (*.netlify.app)
    if (origin.endsWith('.netlify.app')) return cb(null, true);
    if (allOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));

// Trust Netlify's CDN and proxy headers
app.set('trust proxy', true);

// Netlify passes the real client IP in x-nf-client-connection-ip
// Use it for rate limiting so Netlify's CDN IPs don't get rate-limited
app.use((req, res, next) => {
  const netlifyIP = req.headers['x-nf-client-connection-ip'];
  if (netlifyIP) req.ip = netlifyIP;
  next();
});

app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));

// Add Netlify WAF bypass header verification
// Requests from Netlify WAF will have x-nf-request-id header
app.use((req, res, next) => {
  // Log WAF-blocked requests that somehow get through (shouldn't happen)
  if (req.headers['x-nf-waf-action']) {
    console.warn('[WAF]', req.headers['x-nf-waf-action'], req.path);
  }
  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(securityMiddleware.sanitize);
app.use(securityMiddleware.rateLimits.general);

// Serve frontend
app.use(express.static(path.join(__dirname, 'frontend')));

/* ═══════════════════ HELPERS ═══════════════════ */
const hashPassword = async (plain) => {
  const peppered = plain + BCRYPT_PEPPER;
  return bcrypt.hash(peppered, BCRYPT_ROUNDS);
};
const comparePassword = async (plain, hash) => {
  const peppered = plain + BCRYPT_PEPPER;
  return bcrypt.compare(peppered, hash);
};

const { authenticate, optionalAuth, requireRole, generateTokens, verifyRefreshToken, hashToken, SENSITIVE_FIELDS } = auth;

/* ═══════════════════ HEALTH CHECK ═══════════════════ */

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

/* ═══════════════════ AUTH ROUTES ═══════════════════ */

app.post('/api/auth/register',
  securityMiddleware.rateLimits.auth,
  validationRules.register, validateRequest,
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

      const hashedPw = await hashPassword(password);
      const verifyToken = crypto.randomBytes(32).toString('hex');

      const user = await User.create({
        name, email,
        password: hashedPw,
        role: role || 'customer',
        verifyToken,
        verifyTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      const { accessToken, refreshToken } = generateTokens(user.id);
      await user.update({ refreshTokenHash: hashToken(refreshToken) });

      // Send both emails (non-blocking)
      try {
        const { sendVerificationEmail, sendOwnerNewSignupAlert } = require('./services/emailService');
        
        // Send verification email to the new user
        await sendVerificationEmail(user.email, user.name, verifyToken);
        
        // Alert the owner at onpurposeearth@gmail.com
        await sendOwnerNewSignupAlert({
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
        });
      } catch (emailError) {
        // Email failure must never block registration from completing
        console.error('Post-registration email failed:', emailError.message);
      }

      console.log('User registered successfully:', { id: user.id, email: user.email, role: user.role });
      
      res.status(201).json({
        success: true,
        accessToken, 
        refreshToken, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          isVerified: user.isVerified 
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message);
        return res.status(400).json({ success: false, message: messages.join(', ') });
      }
      res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
  }
);

app.post('/api/auth/login',
  securityMiddleware.rateLimits.auth,
  validationRules.login, validateRequest,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      if (user.isSuspended) return res.status(403).json({ success: false, message: 'Account suspended' });

      const valid = await comparePassword(password, user.password);
      if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const { accessToken, refreshToken } = generateTokens(user.id);
      await user.update({ refreshTokenHash: hashToken(refreshToken) });

      res.json({
        success: true,
        data: {
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
          accessToken, refreshToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  }
);

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const userId = await verifyRefreshToken(refreshToken);
    if (!userId) return res.status(401).json({ success: false, message: 'Invalid refresh token' });

    const tokens = generateTokens(userId);
    await User.update({ refreshTokenHash: hashToken(tokens.refreshToken) }, { where: { id: userId } });

    res.json({ success: true, data: tokens });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
  try {
    await User.update({ refreshTokenHash: null }, { where: { id: req.userId } });
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token required' });

    const user = await User.findOne({
      where: { verifyToken: token, verifyTokenExpiry: { [Op.gt]: new Date() } }
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    await user.update({ isVerified: true, verifyToken: null, verifyTokenExpiry: null });
    res.json({ success: true, message: 'Email verified' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

app.post('/api/auth/forgot-password',
  securityMiddleware.rateLimits.auth,
  validationRules.forgotPassword, validateRequest,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      // Always return success to prevent email enumeration
      if (!user) return res.json({ success: true, message: 'If that email exists, a reset link was sent' });

      const resetToken = crypto.randomBytes(32).toString('hex');
      await user.update({
        resetToken: hashToken(resetToken),
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });

      emailService.sendPasswordResetEmail(email, resetToken).catch(e => console.error('Email error:', e));
      res.json({ success: true, message: 'If that email exists, a reset link was sent' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Request failed' });
    }
  }
);

app.post('/api/auth/reset-password',
  validationRules.resetPassword, validateRequest,
  async (req, res) => {
    try {
      const { token, password } = req.body;
      const tokenHash = hashToken(token);
      const user = await User.findOne({
        where: { resetToken: tokenHash, resetTokenExpiry: { [Op.gt]: new Date() } }
      });
      if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

      const hashedPw = await hashPassword(password);
      await user.update({ password: hashedPw, resetToken: null, resetTokenExpiry: null, refreshTokenHash: null });
      res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Reset failed' });
    }
  }
);

/* ═══════════════════ SERVICE ROUTES ═══════════════════ */

app.get('/api/services', optionalAuth, async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, isOnline } = req.query;
    const where = { isActive: true };

    if (category) where.category = category;
    if (isOnline !== undefined) where.isOnline = isOnline === 'true';
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    if (search) {
      const sanitized = sanitizeLikeQuery(search);
      where[Op.or] = [
        { title: { [Op.like]: `%${sanitized}%` } },
        { description: { [Op.like]: `%${sanitized}%` } },
        { category: { [Op.like]: `%${sanitized}%` } }
      ];
    }

    const services = await Service.findAll({
      where,
      include: [
        { model: User, as: 'provider', attributes: { exclude: SENSITIVE_FIELDS } },
        { model: Review, as: 'reviews' },
        { model: Booking, as: 'bookings', attributes: ['id', 'userId', 'status'] }
      ]
    });

    const ranked = rankServicesByTrust(services, { location: req.query.lat && req.query.lng ? { lat: parseFloat(req.query.lat), lng: parseFloat(req.query.lng) } : null });
    res.json({ success: true, data: ranked });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to load services' });
  }
});

app.post('/api/services',
  authenticate, requireRole('provider', 'admin'),
  validationRules.createService, validateRequest,
  async (req, res) => {
    try {
      const { title, description, price, category, duration, location, isOnline } = req.body;
      const service = await Service.create({
        title, description, price, category, duration,
        location, isOnline: isOnline || false,
        providerId: req.userId
      });
      res.status(201).json({ success: true, data: service });
    } catch (error) {
      console.error('Create service error:', error);
      res.status(500).json({ success: false, message: 'Failed to create service' });
    }
  }
);

app.get('/api/services/my-services', authenticate, requireRole('provider', 'admin'), async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { providerId: req.userId },
      include: [{ model: Review, as: 'reviews' }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load services' });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        { model: User, as: 'provider', attributes: { exclude: SENSITIVE_FIELDS } },
        { model: Review, as: 'reviews', include: [{ model: User, as: 'reviewer', attributes: ['id', 'name', 'avatar'] }] }
      ]
    });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load service' });
  }
});

app.patch('/api/services/:id',
  authenticate, requireRole('provider', 'admin'),
  validationRules.updateService, validateRequest,
  async (req, res) => {
    try {
      const service = await Service.findByPk(req.params.id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      if (service.providerId !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      const allowed = ['title', 'description', 'price', 'category', 'duration', 'location', 'isOnline', 'isActive'];
      const updates = {};
      allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
      await service.update(updates);
      res.json({ success: true, data: service });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update service' });
    }
  }
);

/* ═══════════════════ BOOKING ROUTES ═══════════════════ */

app.post('/api/bookings',
  authenticate,
  securityMiddleware.rateLimits.booking,
  validationRules.createBooking, validateRequest,
  async (req, res) => {
    try {
      const { serviceId, date, time, notes } = req.body;
      const service = await Service.findByPk(serviceId, {
        include: [{ model: User, as: 'provider' }]
      });
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      if (!service.isActive) return res.status(400).json({ success: false, message: 'Service is not active' });
      if (service.providerId === req.userId) return res.status(400).json({ success: false, message: 'Cannot book your own service' });

      const totalAmount = parseFloat(service.price);
      const platformFee = parseFloat((totalAmount * PLATFORM_FEE_PERCENT / 100).toFixed(2));
      const providerAmount = parseFloat((totalAmount - platformFee).toFixed(2));

      const booking = await Booking.create({
        userId: req.userId, serviceId, date, time, notes,
        totalAmount, platformFee, providerAmount,
        status: 'pending', paymentStatus: 'pending'
      });

      // Notify provider (non-blocking)
      if (service.provider) {
        emailService.sendNewBookingNotificationToProvider(service.provider.email, {
          service, customer: req.user, booking
        }).catch(e => console.error('Email error:', e));
      }

      res.status(201).json({ success: true, data: booking });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ success: false, message: 'Failed to create booking' });
    }
  }
);

app.get('/api/bookings/my-bookings', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.userId },
      include: [
        { model: Service, as: 'service', include: [{ model: User, as: 'provider', attributes: ['id', 'name', 'avatar'] }] }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load bookings' });
  }
});

app.get('/api/bookings/provider-bookings', authenticate, requireRole('provider', 'admin'), async (req, res) => {
  try {
    const serviceIds = (await Service.findAll({ where: { providerId: req.userId }, attributes: ['id'] })).map(s => s.id);
    const bookings = await Booking.findAll({
      where: { serviceId: { [Op.in]: serviceIds } },
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'avatar'] }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load bookings' });
  }
});

app.patch('/api/bookings/:id/status',
  authenticate,
  validationRules.updateBookingStatus, validateRequest,
  async (req, res) => {
    try {
      const booking = await Booking.findByPk(req.params.id, {
        include: [{ model: Service, as: 'service' }]
      });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      const { status } = req.body;
      const isProvider = booking.service.providerId === req.userId;
      const isCustomer = booking.userId === req.userId;

      // Role-based status transitions
      const allowed = {
        provider: { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'] },
        customer: { pending: ['cancelled'], confirmed: ['cancelled'] }
      };

      const role = isProvider ? 'provider' : isCustomer ? 'customer' : null;
      if (!role) return res.status(403).json({ success: false, message: 'Not authorized' });

      const transitions = allowed[role][booking.status];
      if (!transitions || !transitions.includes(status)) {
        return res.status(400).json({ success: false, message: `Cannot transition from ${booking.status} to ${status} as ${role}` });
      }

      await booking.update({ status });

      // Update trust score if completed
      if (status === 'completed') {
        setImmediate(async () => {
          await updateProviderTrustScore(booking.service.providerId, models);
        });
      }

      res.json({ success: true, data: booking });
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({ success: false, message: 'Failed to update booking' });
    }
  }
);

/* ═══════════════════ PAYMENT ROUTES ═══════════════════ */

app.post('/api/payments/create-checkout',
  authenticate,
  validationRules.createCheckout, validateRequest,
  async (req, res) => {
    try {
      if (!stripe) return res.status(501).json({ success: false, message: 'Stripe not configured' });
      const { bookingId } = req.body;
      const booking = await Booking.findByPk(bookingId, {
        include: [{ model: Service, as: 'service' }]
      });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      if (booking.userId !== req.userId) return res.status(403).json({ success: false, message: 'Not authorized' });
      if (booking.paymentStatus === 'paid') return res.status(400).json({ success: false, message: 'Already paid' });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: booking.service.title, description: `Booking on ${booking.date} at ${booking.time}` },
            unit_amount: Math.round(parseFloat(booking.totalAmount) * 100)
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/dashboard.html?payment=success&booking=${booking.id}`,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard.html?payment=cancelled`,
        metadata: { bookingId: booking.id }
      });

      await booking.update({ stripeSessionId: session.id });
      res.json({ success: true, data: { sessionId: session.id, url: session.url } });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ success: false, message: 'Failed to create checkout' });
    }
  }
);

/* ═══════════════════ REVIEW ROUTES ═══════════════════ */

app.post('/api/reviews',
  authenticate,
  validationRules.createReview, validateRequest,
  async (req, res) => {
    try {
      const { bookingId, rating, comment } = req.body;
      const booking = await Booking.findByPk(bookingId, {
        include: [{ model: Service, as: 'service' }]
      });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      if (booking.userId !== req.userId) return res.status(403).json({ success: false, message: 'Not authorized' });
      if (booking.status !== 'completed') return res.status(400).json({ success: false, message: 'Can only review completed bookings' });

      const existing = await Review.findOne({ where: { bookingId } });
      if (existing) return res.status(409).json({ success: false, message: 'Already reviewed' });

      const review = await Review.create({
        bookingId, userId: req.userId, serviceId: booking.serviceId, rating, comment
      });

      // Update service avg rating
      const allReviews = await Review.findAll({ where: { serviceId: booking.serviceId } });
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      await Service.update(
        { avgRating: parseFloat(avg.toFixed(2)), reviewCount: allReviews.length },
        { where: { id: booking.serviceId } }
      );

      // Update trust score
      setImmediate(async () => {
        await updateProviderTrustScore(booking.service.providerId, models);
      });

      res.status(201).json({ success: true, data: review });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({ success: false, message: 'Failed to create review' });
    }
  }
);

app.get('/api/services/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { serviceId: req.params.id },
      include: [{ model: User, as: 'reviewer', attributes: ['id', 'name', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load reviews' });
  }
});

/* ═══════════════════ USER ROUTES ═══════════════════ */

// ── GET /api/users/profile ──────────────────────
app.get('/api/users/profile',
  authenticate,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password','verifyToken','resetToken','refreshTokenHash'] }
      });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load profile' });
    }
  }
);

// ── PATCH /api/users/profile ────────────────────
app.patch('/api/users/profile',
  authenticate,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const allowed = ['name', 'bio', 'location', 'avatar'];
      const updates = {};
      allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
      await user.update(updates);
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }
);

app.delete('/api/users/me', authenticate, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.userId } });
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

/* ═══════════════════ AVAILABILITY ROUTES ═══════════════════ */

// ── GET /api/availability/:providerId ───────────
app.get('/api/availability/:providerId', async (req, res) => {
  try {
    const availability = await Availability.findAll({
      where: { providerId: req.params.providerId }
    });
    res.json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load availability' });
  }
});

// ── POST /api/availability ──────────────────────
app.post('/api/availability',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const { dayOfWeek, startTime, endTime } = req.body;
      const avail = await Availability.create({
        providerId: req.userId, dayOfWeek, startTime, endTime
      });
      res.status(201).json({ success: true, data: avail });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to set availability' });
    }
  }
);

app.post('/api/availability/block',
  authenticate, requireRole('provider', 'admin'),
  validationRules.blockDate, validateRequest,
  async (req, res) => {
    try {
      const { date, reason } = req.body;
      const blocked = await BlockedDate.create({ providerId: req.userId, date, reason });
      res.status(201).json({ success: true, data: blocked });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to block date' });
    }
  }
);

/* ═══════════════════ CHECKIN ROUTES ═══════════════════ */

// ── checkin routes ──────────────────────────────
app.use('/api/checkin', checkinRouter);

// ── 404 handler ─────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// ── Serve frontend for all non-API routes ────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

/* ═══════════════════ ADMIN ROUTES ═══════════════════ */

app.get('/api/stats', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [totalUsers, totalServices, totalBookings, totalRevenue] = await Promise.all([
      User.count(),
      Service.count({ where: { isActive: true } }),
      Booking.count(),
      Booking.sum('platformFee', { where: { paymentStatus: 'paid' } })
    ]);
    const statusCounts = await Booking.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status']
    });
    res.json({
      success: true,
      data: { totalUsers, totalServices, totalBookings, totalRevenue: totalRevenue || 0, statusCounts }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
});

app.patch('/api/admin/users/:id/suspend', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.update({ isSuspended: !user.isSuspended });
    res.json({ success: true, data: { id: user.id, isSuspended: user.isSuspended } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

app.patch('/api/admin/services/:id/deactivate', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    await service.update({ isActive: false });
    res.json({ success: true, data: { id: service.id, isActive: false } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to deactivate service' });
  }
});

/* ═══════════════════ OTHER ROUTES ═══════════════════ */

// ── POST /api/early-access ──────────────────────
app.post('/api/early-access', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    await EarlyAccess.create({ email });
    res.json({ success: true, message: 'Added to early access list' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.json({ success: true, message: 'Already on the list' });
    }
    res.status(500).json({ success: false, message: 'Failed to add email' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

/* ═══════════════════ ERROR HANDLER ═══════════════════ */

app.use(securityMiddleware.handleError);

/* ═══════════════════ START SERVER ═══════════════════ */

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Disable FK checks during sync for SQLite compatibility
    if (sequelize.getDialect() === 'sqlite') {
      await sequelize.query('PRAGMA foreign_keys = OFF;');
    }

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Models synced (alter).');
    } else {
      await sequelize.sync();
      console.log('Models synced.');
    }

    if (sequelize.getDialect() === 'sqlite') {
      await sequelize.query('PRAGMA foreign_keys = ON;');
    }

    app.listen(PORT, () => {
      console.log(`OnPurpose server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, sequelize, models };
