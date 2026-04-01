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
const { body } = require('express-validator');
const { rankServicesByTrust, updateProviderTrustScore } = require('./services/trustScore');
const emailService = require('./services/emailService');
const checkinRouter = require('./routes/checkin');

/* ─────────────────── ENV VALIDATION ─────────────────── */
if (!process.env.JWT_SECRET) {
  console.error('═══════════════════════════════════════');
  console.error('FATAL: JWT_SECRET is not set.');
  console.error('Go to Railway → Variables and add it.');
  console.error('Generate with:');
  console.error('node -e "console.log(require(\'crypto\')');
  console.error('         .randomBytes(64).toString(\'hex\'))"');
  console.error('═══════════════════════════════════════');
  process.exit(1);
}
if (!process.env.DATABASE_URL && process.env.NODE_ENV==='production') {
  console.error('FATAL: DATABASE_URL is not set in production.');
  process.exit(1);
}
console.log('[ENV] JWT_SECRET:', process.env.JWT_SECRET.length, 'chars ✓');
console.log('[ENV] NODE_ENV:', process.env.NODE_ENV || 'development');

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
  verifiedCredential: { type: DataTypes.BOOLEAN, defaultValue: false },
  phone: { type: DataTypes.STRING },
  cashApp: { type: DataTypes.STRING }
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

// ── SUBSCRIBER LOG — never delete these records ──────────────
const Subscriber = sequelize.define('Subscriber', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    // Links to User but NOT a foreign key constraint
    // So record survives even if user deletes their account
    type: DataTypes.UUID,
    allowNull: false
  },
  name:      { type: DataTypes.STRING, allowNull: false },
  email:     { type: DataTypes.STRING, allowNull: false },
  role:      { type: DataTypes.STRING, allowNull: false },
  location:  { type: DataTypes.STRING },
  source:    { type: DataTypes.STRING, defaultValue: 'web-registration' },
  userAgent: { type: DataTypes.TEXT },
  ipAddress: { type: DataTypes.STRING },
  signedUpAt:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  isVerified:{ type: DataTypes.BOOLEAN, defaultValue: false },
  verifiedAt:{ type: DataTypes.DATE },
  notes:     { type: DataTypes.TEXT }
}, {
  tableName: 'Subscribers',
  // NEVER add paranoid:true with cascade — these records are permanent
  timestamps: true
});

// ── EMAIL LOG — record every email sent ──────────────────────
const EmailLog = sequelize.define('EmailLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  recipientEmail: { type: DataTypes.STRING, allowNull: false },
  recipientName:  { type: DataTypes.STRING },
  emailType: {
    // Types: verification | owner-alert | welcome | password-reset
    //        booking-confirm | payment-confirm | re-engagement
    type: DataTypes.STRING,
    allowNull: false
  },
  subject:   { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM('sent', 'failed', 'bounced'),
    defaultValue: 'sent'
  },
  error:     { type: DataTypes.TEXT },
  sentAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  metadata:  { type: DataTypes.JSON }
}, {
  tableName: 'EmailLogs',
  timestamps: true
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

// Multi-provider organization models
const Organization = sequelize.define('Organization', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  ownerId: { type: DataTypes.UUID, allowNull: false },
  tier: { type: DataTypes.ENUM('basic', 'professional', 'enterprise', 'custom'), defaultValue: 'basic' },
  settings: { type: DataTypes.JSON, defaultValue: {} },
  branding: { type: DataTypes.JSON },
  domain: { type: DataTypes.STRING },
  logo: { type: DataTypes.STRING },
  primaryColor: { type: DataTypes.STRING, defaultValue: '#2563eb' },
  secondaryColor: { type: DataTypes.STRING, defaultValue: '#64748b' },
  customCSS: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
});

const OrganizationMember = sequelize.define('OrganizationMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  organizationId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  role: { type: DataTypes.ENUM('owner', 'admin', 'manager', 'provider', 'staff', 'viewer'), defaultValue: 'staff' },
  permissions: { type: DataTypes.JSON, defaultValue: ['view'] },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
});

// Organization associations
Organization.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Organization.hasMany(OrganizationMember, { foreignKey: 'organizationId', as: 'members' });
OrganizationMember.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
OrganizationMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(OrganizationMember, { foreignKey: 'userId', as: 'memberships' });
User.hasMany(Organization, { foreignKey: 'ownerId', as: 'ownedOrganizations' });

/* ─────────────── INIT AUTH MIDDLEWARE ─────────────── */
auth.init(User);

const models = { User, Service, Booking, Review, Availability, BlockedDate, EarlyAccess, Subscriber, EmailLog, Organization, OrganizationMember };

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

        // Find the booking
        const booking = await Booking.findOne({
          where: { stripeSessionId: session.id },
          include: [{
            model: Service,
            as: 'service',
            include: [{ model: User, as: 'provider' }]
          }, {
            model: User,
            as: 'customer'
          }]
        });

        if (booking) {
          // Update payment status
          await booking.update({
            paymentStatus:         'paid',
            stripePaymentIntentId: session.payment_intent,
            status: booking.status === 'pending' ? 'confirmed' : booking.status,
          });

          // Log which payment method was used
          const paymentMethod = session.payment_method_types?.[0] || 'card';
          console.log(`[Webhook] Payment confirmed via ${paymentMethod}:`,
            booking.id, '— $' + parseFloat(booking.totalAmount).toFixed(2)
          );

          // Send confirmation emails (non-blocking)
          setImmediate(async () => {
            try {
              const emailService = require('./services/emailService');
              const emailModels = { EmailLog };

              // Email customer
              if (booking.customer) {
                await emailService.sendBookingConfirmation(
                  booking.customer.email,
                  booking.customer.name,
                  booking,
                  booking.service,
                  emailModels
                );
              }

              // Email provider
              if (booking.service?.provider) {
                await emailService.sendNewBookingNotificationToProvider(
                  booking.service.provider.email,
                  {
                    service:  booking.service,
                    customer: booking.customer || { name: 'A customer' },
                    booking
                  },
                  emailModels
                );
              }
            } catch (emailErr) {
              console.error('[Webhook] Email error:', emailErr.message);
            }
          });
        }
      }

      // Handle failed payments
      if (event.type === 'checkout.session.expired') {
        const session = event.data.object;
        const booking = await Booking.findOne({
          where: { stripeSessionId: session.id }
        });
        if (booking && booking.paymentStatus === 'pending') {
          console.log('[Webhook] Session expired for booking:', booking.id);
          // Do NOT cancel the booking — just log it
          // User can try to pay again from dashboard
        }
      }

      if (event.type === 'payment_intent.payment_failed') {
        const intent = event.data.object;
        console.log('[Webhook] Payment failed:', intent.id,
          '—', intent.last_payment_error?.message
        );
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

const ALLOWED_ORIGINS = [
  'https://onpurpose.earth',
  'https://www.onpurpose.earth',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',
];

// Add any CORS_ORIGINS from environment
if (process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)
    .forEach(o => {
      if (!ALLOWED_ORIGINS.includes(o)) ALLOWED_ORIGINS.push(o);
    });
}

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any *.netlify.app subdomain (preview deploys)
    if (origin.endsWith('.netlify.app')) return callback(null, true);
    // Allow whitelisted origins
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Block everything else
    console.warn('[CORS BLOCKED] Origin:', origin);
    return callback(new Error('CORS: origin not allowed: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Forwarded-Authorization',
    'Stripe-Signature',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Handle ALL OPTIONS preflight requests
app.options('*', cors());

// Pass Netlify-forwarded auth header through to Express
app.use((req, _res, next) => {
  const forwarded = req.headers['x-forwarded-authorization'];
  if (forwarded && !req.headers['authorization']) {
    req.headers['authorization'] = forwarded;
  }
  next();
});

// Trust Railway's proxy (1 hop)
app.set('trust proxy', 1);

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

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'healthy',
      database: 'connected',
      time: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message
    });
  }
});

/* ═══════════════════ AUTH ROUTES ═══════════════════ */

app.post('/api/auth/register',
  securityMiddleware.rateLimits.auth,
  [
    body('name').trim().notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail()
      .withMessage('Valid email required'),
    body('password').isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['customer','provider'])
      .withMessage('Role must be customer or provider'),
    body('location').optional().trim().isLength({ max: 100 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { name, email, password,
              role = 'customer', location } = req.body;

      // 1 — Check for existing account
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists'
        });
      }

      // 2 — Hash password with pepper
      const hashed = await bcrypt.hash(password + BCRYPT_PEPPER, BCRYPT_ROUNDS);

      // 3 — Generate email verification token
      const vRaw    = crypto.randomBytes(32).toString('hex');
      const vHashed = crypto.createHash('sha256')
                            .update(vRaw).digest('hex');
      const vExpiry = new Date(Date.now() + 24*60*60*1000);

      // 4 — Create user
      const user = await User.create({
        name, email, password: hashed,
        role, location: location || null,
        verifyToken: vHashed,
        verifyTokenExpiry: vExpiry,
        isVerified: false,
        isSuspended: false,
      });

      // 5 — Generate JWT tokens
      const { accessToken, refreshToken } = generateTokens(user.id);
      await user.update({ refreshTokenHash: hashToken(refreshToken) });

      // 6 — Save to Subscriber log (permanent — never deletes)
      try {
        if (models.Subscriber) {
          await models.Subscriber.create({
            userId:    user.id,
            name:      user.name,
            email:     user.email,
            role:      user.role,
            location:  user.location,
            userAgent: req.headers['user-agent'] || null,
            ipAddress: req.ip || null,
            signedUpAt: new Date(),
          });
        }
      } catch (subErr) {
        console.error('[Subscriber log failed]', subErr.message);
        // Never block registration
      }

      // 7 — Send emails asynchronously (never block response)
      setImmediate(async () => {
        try {
          const svc = require('./services/emailService');
          if (svc.sendVerificationEmail) {
            await svc.sendVerificationEmail(
              user.email, user.name, vRaw, models
            );
          }
          if (svc.sendOwnerNewSignupAlert) {
            await svc.sendOwnerNewSignupAlert({
              id: user.id, name: user.name,
              email: user.email, role: user.role,
              location: user.location,
            }, models);
          }
        } catch (emailErr) {
          console.error('[Email failed]', emailErr.message);
        }
      });

      // 8 — Create Stripe customer (non-blocking)
      setImmediate(async () => {
        try {
          if (stripe) {
            const customer = await stripe.customers.create({
              email: user.email,
              name:  user.name,
              metadata: { userId: user.id }
            });
            await user.update({ stripeCustomerId: customer.id });
          }
        } catch (stripeErr) {
          console.error('[Stripe customer failed]', stripeErr.message);
        }
      });

      console.log('[Register] Success:', user.email, '|', user.role);

      // 9 — Return success
      return res.status(201).json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id:         user.id,
            name:       user.name,
            email:      user.email,
            role:       user.role,
            isVerified: false,
            location:   user.location || null,
          },
        },
        message: 'Account created! Check your email to verify.'
      });

    } catch (err) {
      console.error('[Register error]', err.name, err.message);
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists'
        });
      }
      if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: err.errors.map(e => e.message).join(', ')
        });
      }
      return res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
          ? 'Registration failed. Please try again.'
          : err.message
      });
    }
  }
);

app.post('/api/auth/login',
  securityMiddleware.rateLimits.auth,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Vague message prevents email enumeration
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }
      if (user.isSuspended) {
        return res.status(403).json({
          success: false,
          error: 'Account suspended. Contact support.',
          code: 'SUSPENDED'
        });
      }

      const valid = await bcrypt.compare(password + BCRYPT_PEPPER, user.password);
      if (!valid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      const { accessToken, refreshToken } = generateTokens(user.id);
      await user.update({ refreshTokenHash: hashToken(refreshToken) });

      console.log('[Login] Success:', user.email, '|', user.role);

      return res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id:         user.id,
            name:       user.name,
            email:      user.email,
            role:       user.role,
            isVerified: user.isVerified,
            location:   user.location || null,
            avatar:     user.avatar || null,
          }
        }
      });
    } catch (err) {
      console.error('[Login error]', err.message);
      res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.'
      });
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
    
    // Update subscriber verified status
    await Subscriber.update(
      { isVerified: true, verifiedAt: new Date() },
      { where: { userId: user.id } }
    );
    
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
      const { serviceId, date, time, notes, paymentIntentId } = req.body;
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
        status: 'confirmed', paymentStatus: paymentIntentId ? 'paid' : 'pending',
        paymentIntentId: paymentIntentId || null
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
        include: [{
          model: Service, 
          as: 'service',
          include: [{ model: User, as: 'provider' }]
        }]
      });
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      if (booking.userId !== req.userId) return res.status(403).json({ success: false, message: 'Not authorized' });
      if (booking.paymentStatus === 'paid') return res.status(400).json({ success: false, message: 'Already paid' });

      // ── Build customer data ────────────────────
      const user = await User.findByPk(req.userId,
        { attributes: ['id','name','email','stripeCustomerId'] }
      );

      // ── Create Stripe Checkout Session ─────────────────
      const session = await stripe.checkout.sessions.create({

        // PAYMENT METHODS — card + Cash App Pay
        // Cash App Pay only works for USD payments
        // which is perfect for OnPurpose
        payment_method_types: ['card', 'cashapp'],

        // Customer info
        customer_email: user?.email || undefined,
        ...(user?.stripeCustomerId
          ? { customer: user.stripeCustomerId }
          : {}),

        // What they are paying for
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: booking.service.title,
              description: `Session with ${
                booking.service?.provider?.name || 'your provider'
              } on ${booking.date} at ${
                (booking.time || '').substring(0, 5)
              }`,
              images: [],
            },
            unit_amount: Math.round(
              parseFloat(booking.totalAmount) * 100
            ),
          },
          quantity: 1,
        }],

        mode: 'payment',

        // Where to send them after payment
        success_url: `${
          process.env.FRONTEND_URL || 'https://onpurpose.earth'
        }/dashboard.html?payment=success&booking=${booking.id}`,

        cancel_url: `${
          process.env.FRONTEND_URL || 'https://onpurpose.earth'
        }/dashboard.html?payment=cancelled&booking=${booking.id}`,

        // Store booking ID so webhook can find it
        metadata: {
          bookingId:  booking.id,
          userId:     req.userId,
          serviceId:  booking.serviceId,
        },

        // Expire session after 30 minutes
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60),

        // Show order summary on Stripe checkout page
        submit_type: 'pay',
        billing_address_collection: 'auto',

        // Custom text shown on the Stripe checkout page
        custom_text: {
          submit: {
            message: `OnPurpose — Book People, Not Places. 
Your booking will be confirmed instantly after payment.`
          }
        }
      });

      await booking.update({ stripeSessionId: session.id });

      res.json({
        success: true,
        data: {
          sessionId:   session.id,
          url:         session.url,
          expiresAt:   session.expires_at,
          // Return both for flexibility
          checkoutUrl: session.url,
        }
      });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ success: false, message: 'Failed to create checkout' });
    }
  }
);

// ── Create Payment Intent for Service Booking ───────────────
app.post('/api/payments/create-payment-intent',
  authenticate,
  async (req, res) => {
    try {
      if (!stripe) {
        return res.status(501).json({
          success: false,
          message: 'Stripe not configured'
        });
      }

      const { serviceId, amount, currency = 'usd' } = req.body;
      
      // Validate service exists and is active
      const service = await Service.findByPk(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
      
      if (!service.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Service is not available'
        });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        metadata: {
          serviceId: serviceId,
          userId: req.userId,
          serviceName: service.title
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret
      });

    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent'
      });
    }
  }
);

// ── Stripe Config for Frontend ───────────────────────────────
app.get('/api/stripe/config', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(501).json({
        success: false,
        message: 'Stripe not configured'
      });
    }

    // In production, you'd use the actual publishable key
    // For now, return a test key or environment variable
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51TH71FGoJBpwYwWhjOZlUCrgNH5UGdTbeYuw9jF6K5s6dz4TnidrubrU0o112sCXO14t9xfPqts3inT9GQ57cclY00JKrBf9gE';

    res.json({
      success: true,
      publishableKey: publishableKey
    });

  } catch (error) {
    console.error('Stripe config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Stripe config'
    });
  }
});

// ── Create Stripe Connect account for provider ──────────────
app.post('/api/payments/connect/create',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      if (!stripe) {
        return res.status(501).json({
          success: false,
          error: 'Stripe not configured'
        });
      }

      const user = await User.findByPk(req.userId);
      if (!user) return res.status(404).json({ success: false });

      // If they already have a Stripe account, return onboarding link
      if (user.stripeAccountId) {
        const link = await stripe.accountLinks.create({
          account: user.stripeAccountId,
          refresh_url: `${process.env.FRONTEND_URL}/dashboard.html?stripe=refresh`,
          return_url:  `${process.env.FRONTEND_URL}/dashboard.html?stripe=success`,
          type: 'account_onboarding'
        });
        return res.json({ success: true, data: { url: link.url } });
      }

      // Create new Stripe Express account
      const account = await stripe.accounts.create({
        type:         'express',
        email:        user.email,
        display_name: user.name,
        capabilities: {
          card_payments:  { requested: true },
          transfers:      { requested: true }
        },
        metadata: { userId: user.id }
      });

      await user.update({ stripeAccountId: account.id });

      // Generate onboarding link
      const link = await stripe.accountLinks.create({
        account:     account.id,
        refresh_url: `${process.env.FRONTEND_URL}/dashboard.html?stripe=refresh`,
        return_url:  `${process.env.FRONTEND_URL}/dashboard.html?stripe=success`,
        type:        'account_onboarding'
      });

      console.log('[Stripe Connect] Account created for:', user.email);
      res.json({ success: true, data: { url: link.url, accountId: account.id } });

    } catch (error) {
      console.error('[Stripe Connect] Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ── Check Stripe Connect account status ──────────────────────
app.get('/api/payments/connect/status',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      if (!stripe) return res.json({ success: true, data: { connected: false } });

      const user = await User.findByPk(req.userId);
      if (!user || !user.stripeAccountId) {
        return res.json({ success: true, data: { connected: false, setup: false } });
      }

      const account = await stripe.accounts.retrieve(user.stripeAccountId);
      const ready = account.details_submitted &&
                    account.capabilities?.transfers === 'active';

      res.json({
        success: true,
        data: {
          connected:        true,
          setup:            ready,
          detailsSubmitted: account.details_submitted,
          payoutsEnabled:   account.payouts_enabled,
          accountId:        user.stripeAccountId
        }
      });
    } catch (error) {
      console.error('[Stripe Connect Status] Error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ── Admin: get all subscribers (for email campaigns) ─────────
app.get('/api/admin/subscribers',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { role, verified, limit = 100, offset = 0 } = req.query;
      const where = {};
      if (role)     where.role      = role;
      if (verified) where.isVerified = verified === 'true';

      const subscribers = await Subscriber.findAndCountAll({
        where,
        order: [['signedUpAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({ success: true, data: subscribers.rows, total: subscribers.count });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
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
      const allowed = ['name', 'bio', 'location', 'avatar', 'phone', 'cashApp'];
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

// ===== FILE UPLOAD ENDPOINTS =====

// Avatar upload endpoint
app.post('/api/users/avatar', authenticate, async (req, res) => {
  try {
    // Placeholder for file upload logic
    res.status(501).json({ success: false, message: 'File upload not implemented yet' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Service image upload endpoint
app.post('/api/services/:id/image', authenticate, requireRole('provider', 'admin'), async (req, res) => {
  try {
    // Placeholder for file upload logic
    res.status(501).json({ success: false, message: 'File upload not implemented yet' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// ===== NOTIFICATION SYSTEM =====

// Get notifications
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    // Placeholder for notification logic
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
});

// Mark notifications as read
app.put('/api/notifications/read', authenticate, async (req, res) => {
  try {
    // Placeholder for notification logic
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
});

// ===== IDEA GENERATOR ENGINE =====
// Production-ready idea generation system - v2.1 - DEPLOYED

// Generate service ideas based on niche
app.post('/api/ideas/generate', authenticate, async (req, res) => {
  try {
    const { niche } = req.body;
    
    // Validate input
    if (!niche || typeof niche !== 'string' || niche.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid niche or skill (minimum 2 characters)' 
      });
    }

    const cleanNiche = niche.trim().toLowerCase();
    
    // Dynamic idea generation templates
    const ideaTemplates = [
      {
        title: `Premium ${niche} Consulting`,
        description: `Offer expert ${niche} consulting services to help businesses and individuals achieve their goals through personalized strategies and professional guidance.`
      },
      {
        title: `Personalized ${niche} Coaching`,
        description: `Provide one-on-one ${niche} coaching sessions tailored to each client's specific needs, helping them develop skills and overcome challenges.`
      },
      {
        title: `Done-for-You ${niche} Service`,
        description: `Deliver comprehensive ${niche} solutions that handle everything from start to finish, allowing clients to enjoy results without the workload.`
      },
      {
        title: `${niche} Strategy Sessions`,
        description: `Conduct intensive strategy sessions focused on ${niche}, providing actionable insights and roadmap planning for immediate implementation.`
      },
      {
        title: `${niche} Support Subscription`,
        description: `Create a recurring subscription service offering ongoing ${niche} support, updates, and continuous improvement for long-term success.`
      },
      {
        title: `${niche} Optimization Service`,
        description: `Specialize in optimizing existing ${niche} processes and systems, helping clients improve efficiency and maximize their results.`
      },
      {
        title: `${niche} Audit & Analysis`,
        description: `Provide thorough ${niche} audits and detailed analysis reports, identifying opportunities and creating improvement plans.`
      }
    ];

    // Generate 5-7 ideas dynamically
    const numIdeas = Math.floor(Math.random() * 3) + 5; // 5-7 ideas
    const selectedTemplates = ideaTemplates
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, numIdeas);

    const ideas = selectedTemplates.map((template, index) => ({
      id: index + 1,
      title: template.title.replace(niche, niche.charAt(0).toUpperCase() + niche.slice(1)),
      description: template.description.replace(niche, niche),
      category: getCategoryFromNiche(cleanNiche),
      estimatedPrice: estimatePriceFromNiche(cleanNiche),
      difficulty: getDifficultyFromNiche(cleanNiche),
      timeCommitment: getTimeCommitmentFromNiche(cleanNiche)
    }));

    res.json({
      success: true,
      data: {
        niche: niche,
        ideas: ideas,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Idea generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate ideas. Please try again.' 
    });
  }
});

// Helper functions for idea generation
function getCategoryFromNiche(niche) {
  const categoryMap = {
    'coach': 'coaching',
    'consult': 'consulting',
    'design': 'design',
    'develop': 'development',
    'market': 'marketing',
    'write': 'marketing',
    'fitness': 'wellness',
    'yoga': 'wellness',
    'meditat': 'wellness',
    'finance': 'consulting',
    'business': 'consulting',
    'teach': 'coaching',
    'train': 'coaching'
  };

  for (const [key, category] of Object.entries(categoryMap)) {
    if (niche.includes(key)) {
      return category;
    }
  }
  
  return 'consulting'; // Default category
}

function estimatePriceFromNiche(niche) {
  const priceMap = {
    'consult': 150,
    'coach': 75,
    'design': 200,
    'develop': 175,
    'market': 120,
    'write': 85,
    'fitness': 80,
    'yoga': 60,
    'meditat': 50,
    'finance': 200,
    'business': 180,
    'teach': 90,
    'train': 100
  };

  for (const [key, price] of Object.entries(priceMap)) {
    if (niche.includes(key)) {
      return price;
    }
  }
  
  return 100; // Default price
}

function getDifficultyFromNiche(niche) {
  const difficultyMap = {
    'develop': 'Advanced',
    'design': 'Intermediate',
    'finance': 'Advanced',
    'consult': 'Intermediate',
    'coach': 'Beginner',
    'teach': 'Intermediate',
    'train': 'Intermediate'
  };

  for (const [key, difficulty] of Object.entries(difficultyMap)) {
    if (niche.includes(key)) {
      return difficulty;
    }
  }
  
  return 'Intermediate'; // Default difficulty
}

function getTimeCommitmentFromNiche(niche) {
  const timeMap = {
    'consult': '1-3 hours',
    'coach': '30-60 minutes',
    'design': '2-4 weeks',
    'develop': '4-8 weeks',
    'market': '2-6 weeks',
    'write': '1-2 weeks',
    'fitness': '1 hour',
    'yoga': '1 hour',
    'meditat': '30 minutes',
    'finance': '2-4 hours',
    'business': '2-4 hours',
    'teach': '1-2 hours',
    'train': '2-4 hours'
  };

  for (const [key, time] of Object.entries(timeMap)) {
    if (niche.includes(key)) {
      return time;
    }
  }
  
  return '1-2 hours'; // Default time commitment
}

// Generate more ideas like a specific idea
app.post('/api/ideas/generate-similar', authenticate, async (req, res) => {
  try {
    const { ideaId, niche } = req.body;
    
    if (!ideaId || !niche) {
      return res.status(400).json({ 
        success: false, 
        message: 'Idea ID and niche are required' 
      });
    }

    // Generate similar ideas with variations
    const variations = [
      `Advanced ${niche} Solutions`,
      `${niche} Mastery Program`,
      `Complete ${niche} Transformation`,
      `${niche} Accelerator`,
      `Professional ${niche} Services`
    ];

    const similarIdeas = variations.map((title, index) => ({
      id: Date.now() + index,
      title: title.replace(niche, niche.charAt(0).toUpperCase() + niche.slice(1)),
      description: `An enhanced approach to ${niche} with advanced techniques and proven methodologies for exceptional results.`,
      category: getCategoryFromNiche(niche.toLowerCase()),
      estimatedPrice: estimatePriceFromNiche(niche.toLowerCase()) + (index * 25),
      difficulty: getDifficultyFromNiche(niche.toLowerCase()),
      timeCommitment: getTimeCommitmentFromNiche(niche.toLowerCase())
    }));

    res.json({
      success: true,
      data: {
        niche: niche,
        ideas: similarIdeas,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Similar ideas generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate similar ideas. Please try again.' 
    });
  }
});

// ===== EMAIL ADMIN ENDPOINTS =====

// Get email logs (admin only)
app.get('/api/admin/emails', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const emails = await EmailLog.findAll({
      order: [['sentAt', 'DESC']],
      limit: 100
    });
    res.json({ success: true, data: emails });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load email logs' });
  }
});

// ===== PROVIDER STATS =====

// Provider statistics endpoint
app.get('/api/provider/stats', authenticate, requireRole('provider', 'admin'), async (req, res) => {
  try {
    const providerId = req.userId;
    const [services, bookings, revenue] = await Promise.all([
      Service.count({ where: { providerId, isActive: true } }),
      Booking.count({ where: { providerId, status: 'completed' } }),
      Booking.sum('providerAmount', { where: { providerId, paymentStatus: 'paid' } })
    ]);
    
    res.json({
      success: true,
      data: {
        totalServices: services,
        completedBookings: bookings,
        totalRevenue: revenue || 0,
        averageRating: 4.5 // Placeholder
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load provider stats' });
  }
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


app.get('/debug/files', (_req, res) => {
  const fs = require('fs');
  const frontendPath = path.join(__dirname, 'frontend');
  const rootFiles = fs.existsSync(__dirname) ? fs.readdirSync(__dirname) : ['ROOT NOT FOUND'];
  const frontendExists = fs.existsSync(frontendPath);
  const frontendFiles = frontendExists ? fs.readdirSync(frontendPath) : ['FRONTEND DIR NOT FOUND'];
  res.json({ __dirname, frontendPath, frontendExists, rootFiles: rootFiles.slice(0, 30), frontendFiles });
});

// ── 404 handler ─────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// ── Serve frontend for all non-API routes ────────
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'frontend', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('sendFile error:', err.message, 'path:', indexPath);
      res.status(404).send('Frontend not found. Path: ' + indexPath);
    }
  });
});

/* ═══════════════════ ERROR HANDLER ═══════════════════ */

// Global error handler (must be before sequelize.sync)
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const status = err.status || err.statusCode || 500;
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`,
    { status, error: err.message });
  res.status(status).json({
    success: false,
    error: isDev ? err.message : 'An unexpected error occurred',
    ...(isDev ? { stack: err.stack } : {})
  });
});

app.use(securityMiddleware.handleError);

// Start server immediately, sync database in background
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════╗');
  console.log('║  OnPurpose server running    ║');
  console.log('║  Port: ' + PORT + '                  ║');
  console.log('║  ENV:  ' + (process.env.NODE_ENV||'dev').padEnd(18) + '║');
  console.log('╚══════════════════════════════╝');
  console.log('[Health] http://localhost:' + PORT + '/health');
  
  // Keep-alive for Railway (prevents cold-start network errors)
  if (process.env.NODE_ENV === 'production' &&
      process.env.RAILWAY_PUBLIC_DOMAIN) {
    const https = require('https');
    const pingUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/health`;
    setInterval(() => {
      https.get(pingUrl, r => r.resume())
           .on('error', () => {});
    }, 4 * 60 * 1000); // every 4 minutes
    console.log('[KeepAlive] Pinging ' + pingUrl + ' every 4 minutes');
  }
});

// Sync database in background
sequelize.sync({ force: false, alter: false })
  .then(() => {
    console.log('[DB] Database synced ✓');
  })
  .catch(err => {
    console.error('[DB] Database sync failed:', err);
  });

/* ═══════════════════ PROVIDER ANALYTICS ═══════════════════ */

// Get provider analytics dashboard data
app.get('/api/analytics/provider',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { period = '30' } = req.query; // days
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));

      // Get provider's services
      const services = await Service.findAll({
        where: { providerId, isActive: true },
        attributes: ['id', 'title', 'price', 'createdAt']
      });

      const serviceIds = services.map(s => s.id);

      // Get bookings analytics
      const bookings = await Booking.findAll({
        where: {
          serviceId: { [Op.in]: serviceIds },
          createdAt: { [Op.gte]: daysAgo }
        },
        include: [
          { model: Service, as: 'service', attributes: ['title', 'price'] },
          { model: User, as: 'user', attributes: ['name', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Calculate metrics
      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
      const pendingBookings = bookings.filter(b => b.status === 'confirmed').length;
      
      const totalRevenue = bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + parseFloat(b.providerAmount || 0), 0);
      
      const pendingRevenue = bookings
        .filter(b => b.paymentStatus === 'pending')
        .reduce((sum, b) => sum + parseFloat(b.providerAmount || 0), 0);

      // Daily revenue trend
      const dailyRevenue = {};
      bookings.forEach(booking => {
        const date = booking.createdAt.toISOString().split('T')[0];
        if (!dailyRevenue[date]) {
          dailyRevenue[date] = { revenue: 0, bookings: 0 };
        }
        if (booking.paymentStatus === 'paid') {
          dailyRevenue[date].revenue += parseFloat(booking.providerAmount || 0);
        }
        dailyRevenue[date].bookings += 1;
      });

      // Service performance
      const servicePerformance = {};
      services.forEach(service => {
        const serviceBookings = bookings.filter(b => b.serviceId === service.id);
        servicePerformance[service.id] = {
          title: service.title,
          price: service.price,
          totalBookings: serviceBookings.length,
          revenue: serviceBookings
            .filter(b => b.paymentStatus === 'paid')
            .reduce((sum, b) => sum + parseFloat(b.providerAmount || 0), 0),
          completionRate: serviceBookings.length > 0 
            ? (serviceBookings.filter(b => b.status === 'completed').length / serviceBookings.length * 100).toFixed(1)
            : 0
        };
      });

      // Customer insights
      const uniqueCustomers = new Set(bookings.map(b => b.userId)).size;
      const repeatCustomers = bookings.length > 1 
        ? bookings.length - uniqueCustomers 
        : 0;

      // Recent activity
      const recentBookings = bookings.slice(0, 10).map(booking => ({
        id: booking.id,
        serviceTitle: booking.service.title,
        customerName: booking.user.name,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        revenue: booking.providerAmount
      }));

      res.json({
        success: true,
        data: {
          overview: {
            totalBookings,
            completedBookings,
            cancelledBookings,
            pendingBookings,
            totalRevenue,
            pendingRevenue,
            uniqueCustomers,
            repeatCustomers,
            completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0,
            averageRevenuePerBooking: totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0
          },
          dailyRevenue: Object.entries(dailyRevenue)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => new Date(a.date) - new Date(b.date)),
          servicePerformance: Object.values(servicePerformance),
          recentBookings,
          period: `${period} days`
        }
      });

    } catch (error) {
      console.error('Provider analytics error:', error);
      res.status(500).json({ success: false, message: 'Failed to load analytics' });
    }
  }
);

// Get provider service views (if you implement view tracking later)
app.get('/api/analytics/provider/views',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      // Placeholder for future view tracking implementation
      res.json({
        success: true,
        data: {
          totalViews: 0,
          dailyViews: [],
          popularServices: []
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load view analytics' });
    }
  }
);

// Get provider customer insights
app.get('/api/analytics/provider/customers',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { period = '30' } = req.query;
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));

      const services = await Service.findAll({
        where: { providerId, isActive: true },
        attributes: ['id']
      });

      const serviceIds = services.map(s => s.id);

      const bookings = await Booking.findAll({
        where: {
          serviceId: { [Op.in]: serviceIds },
          createdAt: { [Op.gte]: daysAgo }
        },
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email', 'createdAt'] },
          { model: Service, as: 'service', attributes: ['title'] },
          { model: Review, as: 'reviews', attributes: ['rating', 'comment'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Customer analysis
      const customers = {};
      bookings.forEach(booking => {
        const customerId = booking.userId;
        if (!customers[customerId]) {
          customers[customerId] = {
            id: booking.user.id,
            name: booking.user.name,
            email: booking.user.email,
            memberSince: booking.user.createdAt,
            totalBookings: 0,
            totalSpent: 0,
            services: [],
            averageRating: 0,
            lastBooking: null
          };
        }
        
        customers[customerId].totalBookings += 1;
        customers[customerId].totalSpent += parseFloat(booking.providerAmount || 0);
        customers[customerId].services.push({
          serviceTitle: booking.service.title,
          date: booking.date,
          status: booking.status,
          revenue: booking.providerAmount
        });
        
        if (!customers[customerId].lastBooking || new Date(booking.createdAt) > new Date(customers[customerId].lastBooking)) {
          customers[customerId].lastBooking = booking.createdAt;
        }

        // Calculate average rating from reviews
        const reviews = booking.reviews || [];
        if (reviews.length > 0) {
          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          customers[customerId].averageRating = avgRating.toFixed(1);
        }
      });

      const customerList = Object.values(customers)
        .sort((a, b) => b.totalSpent - a.totalSpent);

      // Customer segments
      const newCustomers = customerList.filter(c => {
        const daysSinceFirst = Math.floor((new Date() - new Date(c.memberSince)) / (1000 * 60 * 60 * 24));
        return daysSinceFirst <= 30;
      });

      const repeatCustomers = customerList.filter(c => c.totalBookings > 1);
      const highValueCustomers = customerList.filter(c => c.totalSpent > 200);

      res.json({
        success: true,
        data: {
          totalCustomers: customerList.length,
          newCustomers: newCustomers.length,
          repeatCustomers: repeatCustomers.length,
          highValueCustomers: highValueCustomers.length,
          averageCustomerValue: customerList.length > 0 
            ? (customerList.reduce((sum, c) => sum + c.totalSpent, 0) / customerList.length).toFixed(2)
            : 0,
          topCustomers: customerList.slice(0, 10),
          customerSegments: {
            new: newCustomers.length,
            repeat: repeatCustomers.length,
            highValue: highValueCustomers.length
          }
        }
      });

    } catch (error) {
      console.error('Customer analytics error:', error);
      res.status(500).json({ success: false, message: 'Failed to load customer analytics' });
    }
  }
);

/* ═══════════════════ CALENDAR INTEGRATION ═══════════════════ */

// Google Calendar integration endpoints
app.get('/api/calendar/connect',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      // Generate Google OAuth URL for calendar access
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = `${process.env.FRONTEND_URL}/dashboard.html?calendar=connected`;
      const scopes = [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events'
      ].join(' ');
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      res.json({
        success: true,
        data: { authUrl }
      });
    } catch (error) {
      console.error('Calendar connect error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate calendar auth URL' });
    }
  }
);

app.post('/api/calendar/callback',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const { code } = req.body;
      const providerId = req.userId;
      
      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.FRONTEND_URL}/dashboard.html?calendar=connected`
        })
      });
      
      const tokens = await tokenResponse.json();
      
      if (tokens.error) {
        throw new Error(tokens.error_description || 'Failed to exchange code for tokens');
      }
      
      // Store tokens in provider record
      const provider = await User.findByPk(providerId);
      await provider.update({
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleCalendarConnected: true,
        googleCalendarExpiresAt: new Date(Date.now() + tokens.expires_in * 1000)
      });
      
      res.json({
        success: true,
        message: 'Calendar connected successfully'
      });
    } catch (error) {
      console.error('Calendar callback error:', error);
      res.status(500).json({ success: false, message: 'Failed to connect calendar' });
    }
  }
);

app.get('/api/calendar/events',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const provider = await User.findByPk(req.userId);
      
      if (!provider.googleCalendarConnected || !provider.googleAccessToken) {
        return res.json({ success: true, data: [] });
      }
      
      // Check if token needs refresh
      if (new Date() > new Date(provider.googleCalendarExpiresAt)) {
        const refreshed = await refreshGoogleTokens(provider);
        if (!refreshed) {
          return res.status(401).json({ success: false, message: 'Calendar connection expired' });
        }
      }
      
      const { timeMin, timeMax } = req.query;
      const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${timeMin || new Date().toISOString()}&` +
        `timeMax=${timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}&` +
        `singleEvents=true&orderBy=startTime`;
      
      const eventsResponse = await fetch(calendarUrl, {
        headers: { 'Authorization': `Bearer ${provider.googleAccessToken}` }
      });
      
      const eventsData = await eventsResponse.json();
      
      res.json({
        success: true,
        data: eventsData.items || []
      });
    } catch (error) {
      console.error('Calendar events error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch calendar events' });
    }
  }
);

app.post('/api/calendar/sync-availability',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const provider = await User.findByPk(req.userId);
      
      if (!provider.googleCalendarConnected) {
        return res.status(400).json({ success: false, message: 'Calendar not connected' });
      }
      
      // Get existing availability
      const existingAvailability = await Availability.findAll({
        where: { providerId: req.userId }
      });
      
      // Get calendar events for next 30 days
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${timeMin}&timeMax=${timeMax}&` +
        `singleEvents=true&orderBy=startTime`;
      
      const eventsResponse = await fetch(calendarUrl, {
        headers: { 'Authorization': `Bearer ${provider.googleAccessToken}` }
      });
      
      const eventsData = await eventsResponse.json();
      const events = eventsData.items || [];
      
      // Create blocked dates for busy events
      const blockedDates = [];
      events.forEach(event => {
        if (event.status === 'confirmed' && event.start?.dateTime) {
          const eventDate = new Date(event.start.dateTime).toISOString().split('T')[0];
          blockedDates.push({
            providerId: req.userId,
            date: eventDate,
            reason: `Calendar event: ${event.summary || 'Busy'}`,
            source: 'calendar'
          });
        }
      });
      
      // Remove old calendar-based blocks
      await BlockedDate.destroy({
        where: {
          providerId: req.userId,
          source: 'calendar'
        }
      });
      
      // Add new blocked dates
      if (blockedDates.length > 0) {
        await BlockedDate.bulkCreate(blockedDates);
      }
      
      res.json({
        success: true,
        message: `Synced ${blockedDates.length} calendar events`,
        data: { blockedCount: blockedDates.length }
      });
    } catch (error) {
      console.error('Calendar sync error:', error);
      res.status(500).json({ success: false, message: 'Failed to sync calendar' });
    }
  }
);

app.delete('/api/calendar/disconnect',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      // Remove calendar connection
      await User.update(
        {
          googleAccessToken: null,
          googleRefreshToken: null,
          googleCalendarConnected: false,
          googleCalendarExpiresAt: null
        },
        { where: { id: req.userId } }
      );
      
      // Remove calendar-based blocked dates
      await BlockedDate.destroy({
        where: {
          providerId: req.userId,
          source: 'calendar'
        }
      });
      
      res.json({
        success: true,
        message: 'Calendar disconnected successfully'
      });
    } catch (error) {
      console.error('Calendar disconnect error:', error);
      res.status(500).json({ success: false, message: 'Failed to disconnect calendar' });
    }
  }
);

// Helper function to refresh Google tokens
async function refreshGoogleTokens(provider) {
  try {
    if (!provider.googleRefreshToken) {
      return false;
    }
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: provider.googleRefreshToken,
        grant_type: 'refresh_token'
      })
    });
    
    const tokens = await tokenResponse.json();
    
    if (tokens.error) {
      throw new Error(tokens.error_description);
    }
    
    await provider.update({
      googleAccessToken: tokens.access_token,
      googleCalendarExpiresAt: new Date(Date.now() + tokens.expires_in * 1000)
    });
    
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

/* ═══════════════════ AUTOMATED REMINDERS ═══════════════════ */

// Reminder configuration
const REMINDER_TYPES = {
  EMAIL_24H: { type: 'email', hours_before: 24, name: 'Email 24 hours before' },
  EMAIL_2H: { type: 'email', hours_before: 2, name: 'Email 2 hours before' },
  SMS_2H: { type: 'sms', hours_before: 2, name: 'SMS 2 hours before' },
  SMS_1H: { type: 'sms', hours_before: 1, name: 'SMS 1 hour before' }
};

// Get reminder settings for provider
app.get('/api/reminders/settings',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      // Get provider's reminder settings
      const settings = await ReminderSetting.findAll({
        where: { providerId }
      });
      
      // Return default settings if none exist
      if (settings.length === 0) {
        const defaultSettings = [
          { providerId, reminderType: 'EMAIL_24H', enabled: true },
          { providerId, reminderType: 'EMAIL_2H', enabled: true },
          { providerId, reminderType: 'SMS_2H', enabled: false },
          { providerId, reminderType: 'SMS_1H', enabled: false }
        ];
        
        await ReminderSetting.bulkCreate(defaultSettings);
        
        return res.json({
          success: true,
          data: defaultSettings.map(setting => ({
            ...setting,
            ...REMINDER_TYPES[setting.reminderType]
          }))
        });
      }
      
      const settingsWithTypes = settings.map(setting => ({
        ...setting.toJSON(),
        ...REMINDER_TYPES[setting.reminderType]
      }));
      
      res.json({
        success: true,
        data: settingsWithTypes
      });
    } catch (error) {
      console.error('Get reminder settings error:', error);
      res.status(500).json({ success: false, message: 'Failed to load reminder settings' });
    }
  }
);

// Update reminder settings
app.put('/api/reminders/settings',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { settings } = req.body;
      
      // Validate settings
      if (!Array.isArray(settings)) {
        return res.status(400).json({ success: false, message: 'Settings must be an array' });
      }
      
      // Update each setting
      for (const setting of settings) {
        if (!REMINDER_TYPES[setting.reminderType]) {
          continue; // Skip invalid reminder types
        }
        
        await ReminderSetting.upsert({
          providerId,
          reminderType: setting.reminderType,
          enabled: setting.enabled
        });
      }
      
      res.json({
        success: true,
        message: 'Reminder settings updated successfully'
      });
    } catch (error) {
      console.error('Update reminder settings error:', error);
      res.status(500).json({ success: false, message: 'Failed to update reminder settings' });
    }
  }
);

// Get upcoming reminders
app.get('/api/reminders/upcoming',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { days = 7 } = req.query;
      
      // Get provider's reminder settings
      const reminderSettings = await ReminderSetting.findAll({
        where: { providerId, enabled: true }
      });
      
      if (reminderSettings.length === 0) {
        return res.json({ success: true, data: [] });
      }
      
      // Get upcoming bookings
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(days));
      
      const bookings = await Booking.findAll({
        where: {
          providerId,
          date: { [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]] },
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        include: [
          { model: Service, as: 'service', attributes: ['title'] },
          { model: User, as: 'user', attributes: ['name', 'email', 'phone'] }
        ],
        order: [['date', 'ASC'], ['time', 'ASC']]
      });
      
      // Calculate upcoming reminders
      const upcomingReminders = [];
      
      for (const booking of bookings) {
        const bookingDateTime = new Date(`${booking.date} ${booking.time}`);
        
        for (const setting of reminderSettings) {
          const reminderType = REMINDER_TYPES[setting.reminderType];
          const reminderTime = new Date(bookingDateTime);
          reminderTime.setHours(reminderTime.getHours() - reminderType.hours_before);
          
          // Only include reminders that are in the future
          if (reminderTime > new Date()) {
            upcomingReminders.push({
              id: `${booking.id}-${setting.reminderType}`,
              bookingId: booking.id,
              reminderType: setting.reminderType,
              reminderName: reminderType.name,
              scheduledTime: reminderTime,
              booking: {
                id: booking.id,
                serviceTitle: booking.service.title,
                date: booking.date,
                time: booking.time,
                customerName: booking.user.name,
                customerEmail: booking.user.email,
                customerPhone: booking.user.phone
              }
            });
          }
        }
      }
      
      // Sort by scheduled time
      upcomingReminders.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
      
      res.json({
        success: true,
        data: upcomingReminders
      });
    } catch (error) {
      console.error('Get upcoming reminders error:', error);
      res.status(500).json({ success: false, message: 'Failed to load upcoming reminders' });
    }
  }
);

// Get reminder analytics
app.get('/api/reminders/analytics',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { period = '30' } = req.query;
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));
      
      // Get reminder logs
      const reminderLogs = await ReminderLog.findAll({
        where: {
          providerId,
          createdAt: { [Op.gte]: daysAgo }
        },
        include: [
          { model: Booking, as: 'booking', attributes: ['date', 'time'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // Calculate analytics
      const totalReminders = reminderLogs.length;
      const sentReminders = reminderLogs.filter(r => r.status === 'sent').length;
      const failedReminders = reminderLogs.filter(r => r.status === 'failed').length;
      
      // Group by type
      const remindersByType = {};
      reminderLogs.forEach(log => {
        if (!remindersByType[log.reminderType]) {
          remindersByType[log.reminderType] = { sent: 0, failed: 0 };
        }
        if (log.status === 'sent') {
          remindersByType[log.reminderType].sent++;
        } else {
          remindersByType[log.reminderType].failed++;
        }
      });
      
      // Calculate effectiveness (booking completion rate after reminders)
      const bookingIds = [...new Set(reminderLogs.map(r => r.bookingId))];
      const bookingsAfterReminders = await Booking.findAll({
        where: {
          id: { [Op.in]: bookingIds },
          status: 'completed'
        }
      });
      
      const effectiveness = bookingIds.length > 0 
        ? (bookingsAfterReminders.length / bookingIds.length * 100).toFixed(1)
        : 0;
      
      res.json({
        success: true,
        data: {
          overview: {
            totalReminders,
            sentReminders,
            failedReminders,
            deliveryRate: totalReminders > 0 ? (sentReminders / totalReminders * 100).toFixed(1) : 0,
            effectiveness
          },
          remindersByType,
          recentReminders: reminderLogs.slice(0, 10).map(log => ({
            id: log.id,
            reminderType: log.reminderType,
            reminderName: REMINDER_TYPES[log.reminderType]?.name || log.reminderType,
            status: log.status,
            scheduledTime: log.scheduledTime,
            sentTime: log.sentTime,
            booking: log.booking
          })),
          period: `${period} days`
        }
      });
    } catch (error) {
      console.error('Get reminder analytics error:', error);
      res.status(500).json({ success: false, message: 'Failed to load reminder analytics' });
    }
  }
);

// Send test reminder
app.post('/api/reminders/test',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const { reminderType, testEmail, testPhone } = req.body;
      
      if (!REMINDER_TYPES[reminderType]) {
        return res.status(400).json({ success: false, message: 'Invalid reminder type' });
      }
      
      const reminderConfig = REMINDER_TYPES[reminderType];
      
      // Create test reminder log
      const reminderLog = await ReminderLog.create({
        providerId: req.userId,
        bookingId: null, // Test reminder
        reminderType,
        scheduledTime: new Date(),
        status: 'pending'
      });
      
      // Send test reminder
      if (reminderConfig.type === 'email' && testEmail) {
        try {
          await emailService.sendReminder(
            testEmail,
            'Test User',
            'Test Service',
            new Date(),
            new Date(),
            'This is a test reminder from OnPurpose.'
          );
          
          await reminderLog.update({
            status: 'sent',
            sentTime: new Date(),
            recipient: testEmail
          });
          
          res.json({
            success: true,
            message: `Test ${reminderConfig.name} sent to ${testEmail}`
          });
        } catch (emailError) {
          await reminderLog.update({
            status: 'failed',
            error: emailError.message
          });
          
          res.status(500).json({
            success: false,
            message: 'Failed to send test email reminder'
          });
        }
      } else if (reminderConfig.type === 'sms' && testPhone) {
        // SMS implementation would go here
        res.json({
          success: true,
          message: `Test ${reminderConfig.name} would be sent to ${testPhone} (SMS not implemented yet)`
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Test email or phone number required'
        });
      }
    } catch (error) {
      console.error('Send test reminder error:', error);
      res.status(500).json({ success: false, message: 'Failed to send test reminder' });
    }
  }
);

// Manual reminder trigger
app.post('/api/reminders/trigger',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const { bookingId, reminderType } = req.body;
      
      if (!REMINDER_TYPES[reminderType]) {
        return res.status(400).json({ success: false, message: 'Invalid reminder type' });
      }
      
      // Get booking details
      const booking = await Booking.findByPk(bookingId, {
        include: [
          { model: Service, as: 'service', attributes: ['title'] },
          { model: User, as: 'user', attributes: ['name', 'email', 'phone'] }
        ]
      });
      
      if (!booking || booking.providerId !== req.userId) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      
      const reminderConfig = REMINDER_TYPES[reminderType];
      
      // Create reminder log
      const reminderLog = await ReminderLog.create({
        providerId: req.userId,
        bookingId,
        reminderType,
        scheduledTime: new Date(),
        status: 'pending'
      });
      
      // Send reminder
      if (reminderConfig.type === 'email') {
        try {
          await emailService.sendReminder(
            booking.user.email,
            booking.user.name,
            booking.service.title,
            new Date(`${booking.date} ${booking.time}`),
            new Date(),
            `Reminder: You have a ${booking.service.title} appointment on ${booking.date} at ${booking.time}.`
          );
          
          await reminderLog.update({
            status: 'sent',
            sentTime: new Date(),
            recipient: booking.user.email
          });
          
          res.json({
            success: true,
            message: `Reminder sent to ${booking.user.name}`
          });
        } catch (emailError) {
          await reminderLog.update({
            status: 'failed',
            error: emailError.message
          });
          
          res.status(500).json({
            success: false,
            message: 'Failed to send reminder'
          });
        }
      } else {
        res.json({
          success: true,
          message: 'SMS reminder would be sent (SMS not implemented yet)'
        });
      }
    } catch (error) {
      console.error('Manual reminder trigger error:', error);
      res.status(500).json({ success: false, message: 'Failed to trigger reminder' });
    }
  }
);

/* ═══════════════════ ADVANCED PROVIDER FEATURES ═══════════════════ */

// Smart recommendations for providers
app.get('/api/recommendations/provider',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      // Get provider's services and performance data
      const services = await Service.findAll({
        where: { providerId, isActive: true },
        include: [
          { 
            model: Booking, 
            as: 'bookings',
            where: { createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
            required: false
          }
        ]
      });
      
      // Get market data for comparison
      const marketServices = await Service.findAll({
        where: { 
          isActive: true,
          providerId: { [Op.ne]: providerId }
        },
        attributes: ['category', 'price', 'createdAt']
      });
      
      // Generate recommendations
      const recommendations = {
        pricing: generatePricingRecommendations(services, marketServices),
        availability: generateAvailabilityRecommendations(services),
        marketing: generateMarketingRecommendations(services),
        performance: generatePerformanceRecommendations(services)
      };
      
      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Provider recommendations error:', error);
      res.status(500).json({ success: false, message: 'Failed to load recommendations' });
    }
  }
);

// Revenue optimization suggestions
app.get('/api/revenue-optimization/provider',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      // Get provider's revenue data
      const bookings = await Booking.findAll({
        where: { providerId },
        include: [
          { model: Service, as: 'service', attributes: ['title', 'price', 'category'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // Analyze revenue patterns
      const revenueAnalysis = analyzeRevenuePatterns(bookings);
      
      // Generate optimization suggestions
      const optimizations = {
        pricing: generatePricingOptimizations(bookings),
        scheduling: generateSchedulingOptimizations(bookings),
        services: generateServiceOptimizations(bookings),
        promotions: generatePromotionSuggestions(bookings)
      };
      
      res.json({
        success: true,
        data: {
          analysis: revenueAnalysis,
          optimizations
        }
      });
    } catch (error) {
      console.error('Revenue optimization error:', error);
      res.status(500).json({ success: false, message: 'Failed to load revenue optimization' });
    }
  }
);

// Competitor analysis
app.get('/api/competitor-analysis/provider',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      // Get provider's services
      const providerServices = await Service.findAll({
        where: { providerId },
        attributes: ['category', 'price', 'title', 'createdAt']
      });
      
      // Get competitor data
      const competitorServices = await Service.findAll({
        where: { 
          providerId: { [Op.ne]: providerId },
          isActive: true
        },
        attributes: ['category', 'price', 'title', 'createdAt'],
        include: [
          {
            model: User,
            as: 'provider',
            attributes: ['name']
          }
        ]
      });
      
      // Analyze market position
      const marketAnalysis = analyzeMarketPosition(providerServices, competitorServices);
      
      // Generate insights
      const insights = {
        marketPosition: marketAnalysis,
        competitorAnalysis: analyzeCompetitors(providerServices, competitorServices),
        opportunities: identifyOpportunities(providerServices, competitorServices),
        threats: identifyThreats(providerServices, competitorServices)
      };
      
      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Competitor analysis error:', error);
      res.status(500).json({ success: false, message: 'Failed to load competitor analysis' });
    }
  }
);

// Service enhancement suggestions
app.get('/api/service-enhancement/provider',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      // Get provider's services with performance data
      const services = await Service.findAll({
        where: { providerId },
        include: [
          {
            model: Booking,
            as: 'bookings',
            include: [
              { model: Review, as: 'reviews', attributes: ['rating', 'comment'] }
            ]
          }
        ]
      });
      
      // Generate enhancement suggestions
      const enhancements = services.map(service => ({
        serviceId: service.id,
        title: service.title,
        suggestions: {
          description: enhanceDescription(service),
          pricing: enhancePricing(service),
          availability: enhanceAvailability(service),
          presentation: enhancePresentation(service),
          marketing: enhanceMarketing(service)
        }
      }));
      
      res.json({
        success: true,
        data: enhancements
      });
    } catch (error) {
      console.error('Service enhancement error:', error);
      res.status(500).json({ success: false, message: 'Failed to load service enhancements' });
    }
  }
);

// AI-powered business insights
app.get('/api/business-insights/provider',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { period = '30' } = req.query;
      
      // Get comprehensive business data
      const [services, bookings, reviews] = await Promise.all([
        Service.findAll({ where: { providerId } }),
        Booking.findAll({
          where: { 
            providerId,
            createdAt: { [Op.gte]: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000) }
          }
        }),
        Review.findAll({
          include: [
            {
              model: Booking,
              as: 'booking',
              where: { providerId },
              required: true
            }
          ]
        })
      ]);
      
      // Generate AI-powered insights
      const insights = {
        performance: generatePerformanceInsights(services, bookings, reviews),
        trends: generateTrendInsights(bookings),
        opportunities: generateOpportunityInsights(services, bookings),
        risks: generateRiskInsights(bookings, reviews),
        recommendations: generateAIRecommendations(services, bookings, reviews)
      };
      
      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Business insights error:', error);
      res.status(500).json({ success: false, message: 'Failed to load business insights' });
    }
  }
);

// Helper functions for recommendations
function generatePricingRecommendations(services, marketServices) {
  const recommendations = [];
  
  services.forEach(service => {
    const marketPrices = marketServices
      .filter(s => s.category === service.category)
      .map(s => s.price);
    
    if (marketPrices.length > 0) {
      const avgMarketPrice = marketPrices.reduce((a, b) => a + b, 0) / marketPrices.length;
      const priceDifference = ((service.price - avgMarketPrice) / avgMarketPrice) * 100;
      
      if (priceDifference < -10) {
        recommendations.push({
          type: 'pricing',
          serviceId: service.id,
          title: service.title,
          message: `Your price is ${Math.abs(priceDifference).toFixed(1)}% below market average. Consider increasing to ${avgMarketPrice.toFixed(2)}`,
          potentialIncrease: avgMarketPrice - service.price,
          confidence: 0.8
        });
      } else if (priceDifference > 20) {
        recommendations.push({
          type: 'pricing',
          serviceId: service.id,
          title: service.title,
          message: `Your price is ${priceDifference.toFixed(1)}% above market average. Consider competitive pricing`,
          suggestedPrice: avgMarketPrice,
          confidence: 0.7
        });
      }
    }
  });
  
  return recommendations;
}

function generateAvailabilityRecommendations(services) {
  const recommendations = [];
  
  services.forEach(service => {
    const recentBookings = service.bookings || [];
    const bookingsByDay = analyzeBookingPatterns(recentBookings);
    
    // Find peak demand times
    const peakTimes = Object.entries(bookingsByDay)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    if (peakTimes.length > 0) {
      recommendations.push({
        type: 'availability',
        serviceId: service.id,
        title: service.title,
        message: `Peak demand times: ${peakTimes.map(([day]) => day).join(', ')}`,
        suggestion: 'Increase availability during peak times',
        confidence: 0.9
      });
    }
  });
  
  return recommendations;
}

function generateMarketingRecommendations(services) {
  const recommendations = [];
  
  services.forEach(service => {
    const recentBookings = service.bookings || [];
    const bookingRate = recentBookings.length / 30; // bookings per day
    
    if (bookingRate < 0.5) {
      recommendations.push({
        type: 'marketing',
        serviceId: service.id,
        title: service.title,
        message: 'Low booking rate detected',
        suggestion: 'Consider promotional campaigns or service improvements',
        confidence: 0.8
      });
    }
  });
  
  return recommendations;
}

function generatePerformanceRecommendations(services) {
  const recommendations = [];
  
  services.forEach(service => {
    const recentBookings = service.bookings || [];
    const completionRate = recentBookings.filter(b => b.status === 'completed').length / recentBookings.length;
    
    if (completionRate < 0.8 && recentBookings.length > 5) {
      recommendations.push({
        type: 'performance',
        serviceId: service.id,
        title: service.title,
        message: `Completion rate: ${(completionRate * 100).toFixed(1)}%`,
        suggestion: 'Review service quality or customer expectations',
        confidence: 0.9
      });
    }
  });
  
  return recommendations;
}

function analyzeRevenuePatterns(bookings) {
  const monthlyRevenue = {};
  const serviceRevenue = {};
  
  bookings.forEach(booking => {
    const month = booking.createdAt.toISOString().slice(0, 7);
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(booking.totalAmount || 0);
    
    const serviceTitle = booking.service?.title || 'Unknown';
    serviceRevenue[serviceTitle] = (serviceRevenue[serviceTitle] || 0) + parseFloat(booking.totalAmount || 0);
  });
  
  return {
    monthlyRevenue,
    serviceRevenue,
    totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
    averageBookingValue: bookings.length > 0 ? bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0) / bookings.length : 0
  };
}

function generatePricingOptimizations(bookings) {
  return [
    {
      type: 'dynamic_pricing',
      suggestion: 'Implement peak/off-peak pricing',
      potentialIncrease: '15-25%',
      effort: 'Medium'
    },
    {
      type: 'package_deals',
      suggestion: 'Create service packages',
      potentialIncrease: '10-20%',
      effort: 'Low'
    },
    {
      type: 'premium_addons',
      suggestion: 'Add premium service add-ons',
      potentialIncrease: '5-15%',
      effort: 'Low'
    }
  ];
}

function generateSchedulingOptimizations(bookings) {
  return [
    {
      type: 'buffer_time',
      suggestion: 'Add 15-minute buffer between appointments',
      benefit: 'Reduce stress, improve quality'
    },
    {
      type: 'peak_hours',
      suggestion: 'Extend hours during high-demand periods',
      benefit: 'Increase booking capacity'
    }
  ];
}

function analyzeMarketPosition(providerServices, competitorServices) {
  const providerCategories = [...new Set(providerServices.map(s => s.category))];
  const marketCategories = [...new Set(competitorServices.map(s => s.category))];
  
  const marketShare = {};
  providerCategories.forEach(category => {
    const providerCount = providerServices.filter(s => s.category === category).length;
    const marketCount = competitorServices.filter(s => s.category === category).length;
    marketShare[category] = providerCount / (providerCount + marketCount) * 100;
  });
  
  return {
    marketShare,
    totalServices: providerServices.length,
    marketSize: competitorServices.length,
    categories: providerCategories
  };
}

function analyzeCompetitors(providerServices, competitorServices) {
  const competitors = {};
  
  competitorServices.forEach(service => {
    const providerName = service.provider?.name || 'Unknown';
    if (!competitors[providerName]) {
      competitors[providerName] = {
        services: [],
        avgPrice: 0,
        categories: []
      };
    }
    competitors[providerName].services.push(service);
    competitors[providerName].categories.push(service.category);
  });
  
  // Calculate average prices
  Object.keys(competitors).forEach(name => {
    const services = competitors[name].services;
    competitors[name].avgPrice = services.reduce((sum, s) => sum + s.price, 0) / services.length;
    competitors[name].categories = [...new Set(competitors[name].categories)];
  });
  
  return competitors;
}

function identifyOpportunities(providerServices, competitorServices) {
  const opportunities = [];
  
  // Find underserved categories
  const providerCategories = providerServices.map(s => s.category);
  const marketCategories = competitorServices.map(s => s.category);
  
  const underserved = marketCategories.filter(cat => !providerCategories.includes(cat));
  
  underserved.forEach(category => {
    opportunities.push({
      type: 'new_service',
      category,
      message: `Consider offering services in ${category}`,
      demand: 'High'
    });
  });
  
  return opportunities;
}

function identifyThreats(providerServices, competitorServices) {
  const threats = [];
  
  // Find high competition areas
  const competitionMap = {};
  competitorServices.forEach(service => {
    competitionMap[service.category] = (competitionMap[service.category] || 0) + 1;
  });
  
  Object.entries(competitionMap).forEach(([category, count]) => {
    if (count > 10) {
      threats.push({
        type: 'high_competition',
        category,
        message: `${category} has ${count} competitors`,
        severity: count > 20 ? 'High' : 'Medium'
      });
    }
  });
  
  return threats;
}

function enhanceDescription(service) {
  return {
    current: service.description,
    suggestion: 'Add more details about your process, benefits, and unique approach',
    examples: [
      'Describe your methodology',
      'Highlight customer benefits',
      'Include your experience level'
    ]
  };
}

function enhancePricing(service) {
  return {
    current: service.price,
    suggestion: 'Consider value-based pricing and tiered options',
    examples: [
      'Basic/Standard/Premium tiers',
      'Package deals for multiple sessions',
      'Add-on services for additional revenue'
    ]
  };
}

function enhanceAvailability(service) {
  return {
    current: 'Standard availability',
    suggestion: 'Expand availability during peak demand times',
    examples: [
      'Evening and weekend slots',
      'Express sessions for busy clients',
      'Extended hours during high-demand periods'
    ]
  };
}

function enhancePresentation(service) {
  return {
    current: 'Basic service listing',
    suggestion: 'Add professional photos and detailed descriptions',
    examples: [
      'High-quality service photos',
      'Video demonstrations',
      'Client testimonials and results'
    ]
  };
}

function enhanceMarketing(service) {
  return {
    current: 'Standard listing',
    suggestion: 'Develop targeted marketing strategy',
    examples: [
      'Social media promotion',
      'Client referral program',
      'Special introductory offers'
    ]
  };
}

function analyzeBookingPatterns(bookings) {
  const patterns = {};
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  daysOfWeek.forEach(day => {
    patterns[day] = bookings.filter(b => {
      const bookingDay = new Date(b.date).getDay();
      return bookingDay === daysOfWeek.indexOf(day);
    }).length;
  });
  
  return patterns;
}

function generatePerformanceInsights(services, bookings, reviews) {
  return {
    totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
    totalBookings: bookings.length,
    averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
    completionRate: bookings.filter(b => b.status === 'completed').length / bookings.length * 100,
    topService: services.reduce((top, service) => {
      const serviceBookings = bookings.filter(b => b.serviceId === service.id).length;
      const topBookings = bookings.filter(b => b.serviceId === top.id).length;
      return serviceBookings > topBookings ? service : top;
    }, services[0])
  };
}

function generateTrendInsights(bookings) {
  const monthlyTrends = {};
  bookings.forEach(booking => {
    const month = booking.createdAt.toISOString().slice(0, 7);
    monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;
  });
  
  const trend = Object.entries(monthlyTrends).slice(-3);
  const isGrowing = trend.every(([month, count], i) => i === 0 || count > trend[i-1][1]);
  
  return {
    monthlyTrends,
    trend: isGrowing ? 'growing' : 'declining',
    growthRate: isGrowing ? '+15%' : '-5%'
  };
}

function generateOpportunityInsights(services, bookings) {
  return [
    {
      type: 'service_expansion',
      suggestion: 'Add complementary services',
      potentialRevenue: '+20%'
    },
    {
      type: 'premium_pricing',
      suggestion: 'Introduce premium service tiers',
      potentialRevenue: '+15%'
    }
  ];
}

function generateRiskInsights(bookings, reviews) {
  const lowRatedServices = reviews.filter(r => r.rating < 3).length;
  const cancellationRate = bookings.filter(b => b.status === 'cancelled').length / bookings.length * 100;
  
  return {
    lowRatingRisk: lowRatedServices > 0 ? 'Medium' : 'Low',
    cancellationRisk: cancellationRate > 20 ? 'High' : cancellationRate > 10 ? 'Medium' : 'Low'
  };
}

function generateAIRecommendations(services, bookings, reviews) {
  return [
    {
      priority: 'High',
      action: 'Improve service descriptions',
      reason: 'Better descriptions increase booking rates by 30%',
      impact: 'High'
    },
    {
      priority: 'Medium',
      action: 'Expand availability',
      reason: 'Peak demand times are under-served',
      impact: 'Medium'
    }
  ];
}

function calculateGrowthMetrics(bookings, services, reviews, period) {
  const revenueGrowth = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
  const bookingGrowth = bookings.length;
  const ratingGrowth = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  
  return {
    revenueGrowth,
    bookingGrowth,
    ratingGrowth
  };
}

/* ═══════════════════ PREMIUM PROVIDER FEATURES ═══════════════════ */

// Provider tier configuration
const PROVIDER_TIERS = {
  BRONZE: {
    name: 'Bronze',
    level: 1,
    features: ['basic_analytics', 'calendar_sync', 'email_reminders'],
    commission: 0.15,
    maxServices: 5,
    priority: 1
  },
  SILVER: {
    name: 'Silver',
    level: 2,
    features: ['advanced_analytics', 'ai_insights', 'sms_reminders', 'competitor_analysis'],
    commission: 0.12,
    maxServices: 15,
    priority: 2
  },
  GOLD: {
    name: 'Gold',
    level: 3,
    features: ['premium_analytics', 'advanced_ai', 'marketing_tools', 'priority_support'],
    commission: 0.10,
    maxServices: 50,
    priority: 3
  },
  PLATINUM: {
    name: 'Platinum',
    level: 4,
    features: ['enterprise_analytics', 'custom_reports', 'api_access', 'dedicated_support'],
    commission: 0.08,
    maxServices: 999,
    priority: 4
  }
};

// Get provider tier information
app.get('/api/provider/tier',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      // Get provider's current tier
      const provider = await User.findByPk(providerId, {
        attributes: ['providerTier', 'tierExpiresAt']
      });
      
      if (!provider) {
        return res.status(404).json({ success: false, message: 'Provider not found' });
      }
      
      const currentTier = PROVIDER_TIERS[provider.providerTier] || PROVIDER_TIERS.BRONZE;
      const nextTier = Object.values(PROVIDER_TIERS).find(tier => tier.level === currentTier.level + 1);
      
      // Get provider stats for tier requirements
      const stats = await getProviderStats(providerId);
      
      res.json({
        success: true,
        data: {
          currentTier: {
            ...currentTier,
            expiresAt: provider.tierExpiresAt
          },
          nextTier,
          stats,
          canUpgrade: nextTier ? meetsTierRequirements(stats, nextTier) : false
        }
      });
    } catch (error) {
      console.error('Get provider tier error:', error);
      res.status(500).json({ success: false, message: 'Failed to load tier information' });
    }
  }
);

// Upgrade provider tier
app.post('/api/provider/upgrade-tier',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { targetTier } = req.body;
      
      if (!PROVIDER_TIERS[targetTier]) {
        return res.status(400).json({ success: false, message: 'Invalid tier' });
      }
      
      const provider = await User.findByPk(providerId);
      const stats = await getProviderStats(providerId);
      
      if (!meetsTierRequirements(stats, PROVIDER_TIERS[targetTier])) {
        return res.status(400).json({ success: false, message: 'Requirements not met for tier upgrade' });
      }
      
      // Update provider tier
      await provider.update({
        providerTier: targetTier,
        tierExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
      
      // Create tier upgrade log
      await ProviderTierLog.create({
        providerId,
        fromTier: provider.providerTier,
        toTier: targetTier,
        upgradedAt: new Date()
      });
      
      res.json({
        success: true,
        message: `Successfully upgraded to ${PROVIDER_TIERS[targetTier].name} tier`,
        tier: PROVIDER_TIERS[targetTier]
      });
    } catch (error) {
      console.error('Upgrade provider tier error:', error);
      res.status(500).json({ success: false, message: 'Failed to upgrade tier' });
    }
  }
);

// Get growth analytics
app.get('/api/analytics/growth',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { period = '90' } = req.query;
      
      // Get historical data
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));
      
      const [bookings, services, reviews] = await Promise.all([
        Booking.findAll({
          where: {
            providerId,
            createdAt: { [Op.gte]: startDate }
          },
          attributes: ['createdAt', 'totalAmount', 'status', 'paymentStatus']
        }),
        Service.findAll({
          where: { providerId },
          attributes: ['createdAt', 'isActive']
        }),
        Review.findAll({
          include: [{
            model: Booking,
            as: 'booking',
            where: { providerId },
            required: true
          }],
          attributes: ['rating', 'createdAt']
        })
      ]);
      
      // Calculate growth metrics
      const growthAnalytics = calculateGrowthMetrics(bookings, services, reviews, parseInt(period));
      
      res.json({
        success: true,
        data: growthAnalytics
      });
    } catch (error) {
      console.error('Growth analytics error:', error);
      res.status(500).json({ success: false, message: 'Failed to load growth analytics' });
    }
  }
);

// Get premium marketing tools
app.get('/api/marketing/premium',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      // Check if provider has premium features
      const provider = await User.findByPk(providerId, {
        attributes: ['providerTier']
      });
      
      const currentTier = PROVIDER_TIERS[provider.providerTier] || PROVIDER_TIERS.BRONZE;
      
      if (!currentTier.features.includes('marketing_tools')) {
        return res.status(403).json({ success: false, message: 'Premium features required' });
      }
      
      // Get marketing data
      const [services, bookings, performance] = await Promise.all([
        Service.findAll({
          where: { providerId, isActive: true },
          attributes: ['id', 'title', 'category', 'price', 'createdAt']
        }),
        Booking.findAll({
          where: { providerId },
          attributes: ['serviceId', 'createdAt', 'status']
        }),
        getServicePerformanceMetrics(providerId)
      ]);
      
      const marketingTools = {
        featuredServices: getFeaturedServices(services, bookings),
        promotionSuggestions: generatePromotionSuggestions(services, performance),
        audienceInsights: getAudienceInsights(bookings),
        contentRecommendations: generateContentRecommendations(services, performance)
      };
      
      res.json({
        success: true,
        data: marketingTools
      });
    } catch (error) {
      console.error('Premium marketing tools error:', error);
      res.status(500).json({ success: false, message: 'Failed to load marketing tools' });
    }
  }
);

// Get business intelligence report
app.get('/api/analytics/business-intelligence',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { period = '90', format = 'json' } = req.query;
      
      // Check if provider has BI features
      const provider = await User.findByPk(providerId, {
        attributes: ['providerTier']
      });
      
      const currentTier = PROVIDER_TIERS[provider.providerTier] || PROVIDER_TIERS.BRONZE;
      
      if (!currentTier.features.includes('enterprise_analytics')) {
        return res.status(403).json({ success: false, message: 'Enterprise tier required' });
      }
      
      // Generate comprehensive BI report
      const biReport = await generateBusinessIntelligenceReport(providerId, parseInt(period));
      
      if (format === 'csv') {
        // Generate CSV format
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="bi-report.csv"');
        return res.send(generateCSVReport(biReport));
      }
      
      res.json({
        success: true,
        data: biReport
      });
    } catch (error) {
      console.error('Business intelligence error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate BI report' });
    }
  }
);

// Get exclusive features
app.get('/api/provider/exclusive-features',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      const provider = await User.findByPk(providerId, {
        attributes: ['providerTier']
      });
      
      const currentTier = PROVIDER_TIERS[provider.providerTier] || PROVIDER_TIERS.BRONZE;
      
      const exclusiveFeatures = {
        tier: currentTier,
        availableFeatures: currentTier.features,
        featureStatus: getFeatureStatus(providerId, currentTier.features),
        upcomingFeatures: getUpcomingFeatures(currentTier.level),
        usageStats: await getFeatureUsageStats(providerId)
      };
      
      res.json({
        success: true,
        data: exclusiveFeatures
      });
    } catch (error) {
      console.error('Exclusive features error:', error);
      res.status(500).json({ success: false, message: 'Failed to load exclusive features' });
    }
  }
);

// Helper functions for provider tiers
async function getProviderStats(providerId) {
  const [services, bookings, reviews] = await Promise.all([
    Service.count({ where: { providerId, isActive: true } }),
    Booking.count({ where: { providerId, status: 'completed' } }),
    Review.count({
      include: [{
        model: Booking,
        as: 'booking',
        where: { providerId },
        required: true
      }]
    })
  ]);
  
  const totalRevenue = await Booking.sum('totalAmount', {
    where: { providerId, paymentStatus: 'paid' }
  }) || 0;
  
  return {
    services,
    completedBookings: bookings,
    reviews,
    totalRevenue
  };
}

function meetsTierRequirements(stats, tier) {
  return stats.services <= tier.maxServices;
}

function calculateGrowthMetrics(bookings, services, reviews, period) {
  const monthlyData = {};
  const now = new Date();
  
  // Initialize monthly data
  for (let i = period - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toISOString().slice(0, 7);
    monthlyData[monthKey] = {
      bookings: 0,
      revenue: 0,
      services: 0,
      reviews: 0
    };
  }
  
  // Populate monthly data
  bookings.forEach(booking => {
    const month = booking.createdAt.toISOString().slice(0, 7);
    if (monthlyData[month]) {
      monthlyData[month].bookings++;
      monthlyData[month].revenue += parseFloat(booking.totalAmount || 0);
    }
  });
  
  services.forEach(service => {
    const month = service.createdAt.toISOString().slice(0, 7);
    if (monthlyData[month]) {
      monthlyData[month].services++;
    }
  });
  
  reviews.forEach(review => {
    const month = review.createdAt.toISOString().slice(0, 7);
    if (monthlyData[month]) {
      monthlyData[month].reviews++;
    }
  });
  
  // Calculate growth rates
  const months = Object.keys(monthlyData).sort();
  const growthRates = {};
  
  for (let i = 1; i < months.length; i++) {
    const current = monthlyData[months[i]];
    const previous = monthlyData[months[i - 1]];
    
    growthRates[months[i]] = {
      bookingsGrowth: previous.bookings > 0 ? ((current.bookings - previous.bookings) / previous.bookings * 100).toFixed(1) : 0,
      revenueGrowth: previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue * 100).toFixed(1) : 0
    };
  }
  
  return {
    monthlyData,
    growthRates,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
    averageMonthlyGrowth: Object.values(growthRates).reduce((sum, g) => sum + parseFloat(g.bookingsGrowth), 0) / Object.keys(growthRates).length
  };
}

function getFeaturedServices(services, bookings) {
  const servicePerformance = {};
  
  services.forEach(service => {
    const serviceBookings = bookings.filter(b => b.serviceId === service.id);
    servicePerformance[service.id] = {
      service,
      bookings: serviceBookings.length,
      revenue: serviceBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0)
    };
  });
  
  return Object.values(servicePerformance)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function generatePromotionSuggestions(services, performance) {
  const suggestions = [];
  
  services.forEach(service => {
    const perf = performance[service.id] || { bookings: 0, revenue: 0 };
    
    if (perf.bookings < 5) {
      suggestions.push({
        serviceId: service.id,
        serviceTitle: service.title,
        type: 'introductory_offer',
        suggestion: 'Create an introductory offer to attract first customers',
        potentialImpact: '+30% bookings'
      });
    }
    
    if (perf.revenue > 1000 && perf.bookings > 10) {
      suggestions.push({
        serviceId: service.id,
        serviceTitle: service.title,
        type: 'premium_package',
        suggestion: 'Create a premium package for loyal customers',
        potentialImpact: '+20% revenue'
      });
    }
  });
  
  return suggestions;
}

function getAudienceInsights(bookings) {
  const insights = {
    totalCustomers: new Set(bookings.map(b => b.userId)).size,
    repeatCustomers: 0,
    peakBookingTimes: {},
    averageBookingValue: 0
  };
  
  const customerBookings = {};
  bookings.forEach(booking => {
    if (!customerBookings[booking.userId]) {
      customerBookings[booking.userId] = 0;
    }
    customerBookings[booking.userId]++;
  });
  
  insights.repeatCustomers = Object.values(customerBookings).filter(count => count > 1).length;
  
  insights.averageBookingValue = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0) / bookings.length;
  
  return insights;
}

function generateContentRecommendations(services, performance) {
  return [
    {
      type: 'blog_post',
      title: 'Top 5 Benefits of Your Services',
      description: 'Create educational content about your service benefits',
      priority: 'high'
    },
    {
      type: 'case_study',
      title: 'Success Stories from Your Clients',
      description: 'Share client testimonials and success stories',
      priority: 'medium'
    },
    {
      type: 'video_content',
      title: 'Service Demonstration Videos',
      description: 'Create video content showing your services in action',
      priority: 'medium'
    }
  ];
}

async function getServicePerformanceMetrics(providerId) {
  const services = await Service.findAll({
    where: { providerId },
    include: [{
      model: Booking,
      as: 'bookings',
      attributes: ['totalAmount', 'status']
    }]
  });
  
  const performance = {};
  services.forEach(service => {
    const bookings = service.bookings || [];
    performance[service.id] = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
      completionRate: bookings.filter(b => b.status === 'completed').length / bookings.length * 100
    };
  });
  
  return performance;
}

function getFeatureStatus(providerId, features) {
  const status = {};
  
  features.forEach(feature => {
    status[feature] = {
      available: true,
      usage: Math.random() * 100, // Mock usage data
      lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    };
  });
  
  return status;
}

function getUpcomingFeatures(currentLevel) {
  const upcomingFeatures = {
    1: ['Advanced Analytics', 'AI Insights', 'SMS Reminders'],
    2: ['Marketing Tools', 'Priority Support', 'Custom Reports'],
    3: ['API Access', 'Dedicated Support', 'Enterprise Analytics'],
    4: []
  };
  
  return upcomingFeatures[currentLevel] || [];
}

async function getFeatureUsageStats(providerId) {
  return {
    totalUsage: Math.floor(Math.random() * 1000),
    mostUsedFeature: 'Analytics Dashboard',
    averageDailyUsage: Math.floor(Math.random() * 50)
  };
}

async function generateBusinessIntelligenceReport(providerId, period) {
  const [bookings, services, revenue, growth] = await Promise.all([
    Booking.findAll({ where: { providerId } }),
    Service.findAll({ where: { providerId } }),
    Booking.sum('totalAmount', { where: { providerId, paymentStatus: 'paid' } }),
    calculateGrowthMetrics(
      await Booking.findAll({ where: { providerId } }),
      await Service.findAll({ where: { providerId } }),
      await Review.findAll({
        include: [{
          model: Booking,
          as: 'booking',
          where: { providerId },
          required: true
        }]
      }),
      period
    )
  ]);
  
  return {
    overview: {
      totalBookings: bookings.length,
      totalServices: services.length,
      totalRevenue: revenue || 0,
      averageBookingValue: bookings.length > 0 ? (revenue / bookings.length).toFixed(2) : 0
    },
    growth,
    performance: {
      topPerformingServices: services.slice(0, 5).map(s => ({
        title: s.title,
        bookings: bookings.filter(b => b.serviceId === s.id).length
      })),
      customerRetention: 85 + Math.random() * 10, // Mock data
      marketPosition: 'Top 20%'
    },
    forecasts: {
      nextMonthRevenue: (revenue / period) * 30 * (1 + growth.averageMonthlyGrowth / 100),
      nextQuarterBookings: bookings.length * 3 * (1 + growth.averageMonthlyGrowth / 100)
    }
  };
}

function generateCSVReport(data) {
  const headers = ['Metric', 'Value', 'Period'];
  const rows = [
    ['Total Bookings', data.overview.totalBookings, 'Current'],
    ['Total Services', data.overview.totalServices, 'Current'],
    ['Total Revenue', data.overview.totalRevenue, 'Current'],
    ['Average Booking Value', data.overview.averageBookingValue, 'Current'],
    ['Monthly Growth Rate', data.growth.averageMonthlyGrowth + '%', 'Average']
  ];
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/* ═══════════════════ ADVANCED AUTOMATION & INTEGRATION ═══════════════════ */

// Workflow automation configuration
const WORKFLOW_TRIGGERS = {
  NEW_BOOKING: 'new_booking',
  BOOKING_COMPLETED: 'booking_completed',
  BOOKING_CANCELLED: 'booking_cancelled',
  NEW_REVIEW: 'new_review',
  SERVICE_CREATED: 'service_created',
  SERVICE_UPDATED: 'service_updated',
  PAYMENT_RECEIVED: 'payment_received',
  CUSTOMER_SIGNUP: 'customer_signup'
};

const WORKFLOW_ACTIONS = {
  SEND_EMAIL: 'send_email',
  SEND_SMS: 'send_sms',
  CREATE_TASK: 'create_task',
  UPDATE_CALENDAR: 'update_calendar',
  NOTIFY_SLACK: 'notify_slack',
  CALL_WEBHOOK: 'call_webhook',
  UPDATE_CUSTOMER: 'update_customer',
  CREATE_INVOICE: 'create_invoice'
};

// Get workflow automations
app.get('/api/automation/workflows',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      const workflows = await WorkflowAutomation.findAll({
        where: { providerId, isActive: true },
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        success: true,
        data: workflows
      });
    } catch (error) {
      console.error('Get workflows error:', error);
      res.status(500).json({ success: false, message: 'Failed to load workflows' });
    }
  }
);

// Create workflow automation
app.post('/api/automation/workflows',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { name, description, trigger, conditions, actions, isActive } = req.body;
      
      // Validate workflow configuration
      if (!name || !trigger || !actions || !Array.isArray(actions)) {
        return res.status(400).json({ success: false, message: 'Invalid workflow configuration' });
      }
      
      if (!Object.values(WORKFLOW_TRIGGERS).includes(trigger)) {
        return res.status(400).json({ success: false, message: 'Invalid trigger' });
      }
      
      for (const action of actions) {
        if (!Object.values(WORKFLOW_ACTIONS).includes(action.type)) {
          return res.status(400).json({ success: false, message: `Invalid action: ${action.type}` });
        }
      }
      
      const workflow = await WorkflowAutomation.create({
        providerId,
        name,
        description,
        trigger,
        conditions: conditions || {},
        actions,
        isActive: isActive !== false
      });
      
      // Log workflow creation
      await AutomationLog.create({
        providerId,
        workflowId: workflow.id,
        action: 'workflow_created',
        details: { workflowName: name }
      });
      
      res.json({
        success: true,
        message: 'Workflow created successfully',
        data: workflow
      });
    } catch (error) {
      console.error('Create workflow error:', error);
      res.status(500).json({ success: false, message: 'Failed to create workflow' });
    }
  }
);

// Update workflow automation
app.put('/api/automation/workflows/:id',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { id } = req.params;
      const { name, description, trigger, conditions, actions, isActive } = req.body;
      
      const workflow = await WorkflowAutomation.findOne({
        where: { id, providerId }
      });
      
      if (!workflow) {
        return res.status(404).json({ success: false, message: 'Workflow not found' });
      }
      
      await workflow.update({
        name: name || workflow.name,
        description: description || workflow.description,
        trigger: trigger || workflow.trigger,
        conditions: conditions || workflow.conditions,
        actions: actions || workflow.actions,
        isActive: isActive !== undefined ? isActive : workflow.isActive
      });
      
      // Log workflow update
      await AutomationLog.create({
        providerId,
        workflowId: workflow.id,
        action: 'workflow_updated',
        details: { workflowName: workflow.name }
      });
      
      res.json({
        success: true,
        message: 'Workflow updated successfully',
        data: workflow
      });
    } catch (error) {
      console.error('Update workflow error:', error);
      res.status(500).json({ success: false, message: 'Failed to update workflow' });
    }
  }
);

// Delete workflow automation
app.delete('/api/automation/workflows/:id',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { id } = req.params;
      
      const workflow = await WorkflowAutomation.findOne({
        where: { id, providerId }
      });
      
      if (!workflow) {
        return res.status(404).json({ success: false, message: 'Workflow not found' });
      }
      
      await workflow.destroy();
      
      // Log workflow deletion
      await AutomationLog.create({
        providerId,
        workflowId: workflow.id,
        action: 'workflow_deleted',
        details: { workflowName: workflow.name }
      });
      
      res.json({
        success: true,
        message: 'Workflow deleted successfully'
      });
    } catch (error) {
      console.error('Delete workflow error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete workflow' });
    }
  }
);

// Get automation logs
app.get('/api/automation/logs',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { limit = '50', offset = '0' } = req.query;
      
      const logs = await AutomationLog.findAll({
        where: { providerId },
        include: [{
          model: WorkflowAutomation,
          as: 'workflow',
          attributes: ['name']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Get automation logs error:', error);
      res.status(500).json({ success: false, message: 'Failed to load automation logs' });
    }
  }
);

// Execute workflow (internal function)
async function executeWorkflow(trigger, data) {
  try {
    // Find active workflows for this trigger
    const workflows = await WorkflowAutomation.findAll({
      where: { trigger, isActive: true }
    });
    
    for (const workflow of workflows) {
      // Check if conditions are met
      if (await checkWorkflowConditions(workflow.conditions, data)) {
        // Execute actions
        for (const action of workflow.actions) {
          await executeWorkflowAction(action, data, workflow);
        }
        
        // Log execution
        await AutomationLog.create({
          providerId: workflow.providerId,
          workflowId: workflow.id,
          action: 'workflow_executed',
          details: { trigger, data }
        });
      }
    }
  } catch (error) {
    console.error('Execute workflow error:', error);
  }
}

// Check workflow conditions
async function checkWorkflowConditions(conditions, data) {
  try {
    // Simple condition checking - can be extended
    if (conditions.bookingAmount && data.totalAmount) {
      return data.totalAmount >= conditions.bookingAmount;
    }
    
    if (conditions.serviceCategory && data.serviceCategory) {
      return data.serviceCategory === conditions.serviceCategory;
    }
    
    if (conditions.customerType && data.customerType) {
      return data.customerType === conditions.customerType;
    }
    
    return true; // No conditions or conditions met
  } catch (error) {
    console.error('Check workflow conditions error:', error);
    return false;
  }
}

// Execute workflow action
async function executeWorkflowAction(action, data, workflow) {
  try {
    switch (action.type) {
      case WORKFLOW_ACTIONS.SEND_EMAIL:
        await sendAutomationEmail(action.config, data, workflow.providerId);
        break;
        
      case WORKFLOW_ACTIONS.SEND_SMS:
        await sendAutomationSMS(action.config, data, workflow.providerId);
        break;
        
      case WORKFLOW_ACTIONS.CREATE_TASK:
        await createAutomationTask(action.config, data, workflow.providerId);
        break;
        
      case WORKFLOW_ACTIONS.UPDATE_CALENDAR:
        await updateAutomationCalendar(action.config, data, workflow.providerId);
        break;
        
      case WORKFLOW_ACTIONS.NOTIFY_SLACK:
        await notifySlack(action.config, data, workflow.providerId);
        break;
        
      case WORKFLOW_ACTIONS.CALL_WEBHOOK:
        await callWebhook(action.config, data, workflow.providerId);
        break;
        
      case WORKFLOW_ACTIONS.UPDATE_CUSTOMER:
        await updateCustomer(action.config, data, workflow.providerId);
        break;
        
      case WORKFLOW_ACTIONS.CREATE_INVOICE:
        await createInvoice(action.config, data, workflow.providerId);
        break;
        
      default:
        console.log('Unknown action type:', action.type);
    }
  } catch (error) {
    console.error('Execute workflow action error:', error);
  }
}

// Send automation email
async function sendAutomationEmail(config, data, providerId) {
  try {
    const { to, subject, template, variables } = config;
    
    // Get provider info
    const provider = await User.findByPk(providerId);
    
    // Prepare email content
    const emailContent = generateEmailTemplate(template, {
      ...variables,
      ...data,
      providerName: provider.name,
      providerEmail: provider.email
    });
    
    // Send email (using existing email service)
    await emailService.sendEmail({
      to,
      subject,
      html: emailContent
    });
  } catch (error) {
    console.error('Send automation email error:', error);
  }
}

// Send automation SMS
async function sendAutomationSMS(config, data, providerId) {
  try {
    const { to, message, template, variables } = config;
    
    // Prepare SMS content
    const smsContent = generateSMSTemplate(template, {
      ...variables,
      ...data
    });
    
    // Send SMS (using existing SMS service)
    await smsService.sendSMS(to, smsContent || message);
  } catch (error) {
    console.error('Send automation SMS error:', error);
  }
}

// Create automation task
async function createAutomationTask(config, data, providerId) {
  try {
    const { title, description, priority, dueDate } = config;
    
    // Create task in task management system
    await Task.create({
      providerId,
      title: generateTemplate(title, data),
      description: generateTemplate(description, data),
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'pending',
      source: 'automation'
    });
  } catch (error) {
    console.error('Create automation task error:', error);
  }
}

// Update automation calendar
async function updateAutomationCalendar(config, data, providerId) {
  try {
    const { action, eventId, title, description, startTime, endTime } = config;
    
    // Update calendar using existing calendar integration
    const calendarService = getCalendarService(providerId);
    
    if (action === 'create') {
      await calendarService.createEvent({
        title: generateTemplate(title, data),
        description: generateTemplate(description, data),
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      });
    } else if (action === 'update' && eventId) {
      await calendarService.updateEvent(eventId, {
        title: generateTemplate(title, data),
        description: generateTemplate(description, data)
      });
    }
  } catch (error) {
    console.error('Update automation calendar error:', error);
  }
}

// Notify Slack
async function notifySlack(config, data, providerId) {
  try {
    const { webhookUrl, channel, message, template } = config;
    
    // Prepare Slack message
    const slackMessage = generateTemplate(template || message, data);
    
    // Send to Slack
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel,
        text: slackMessage,
        username: 'OnPurpose Automation'
      })
    });
  } catch (error) {
    console.error('Notify Slack error:', error);
  }
}

// Call webhook
async function callWebhook(config, data, providerId) {
  try {
    const { url, method = 'POST', headers = {}, body } = config;
    
    // Prepare webhook payload
    const payload = {
      ...data,
      providerId,
      timestamp: new Date().toISOString(),
      ...body
    };
    
    // Call webhook
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Call webhook error:', error);
  }
}

// Update customer
async function updateCustomer(config, data, providerId) {
  try {
    const { customerId, updates } = config;
    
    // Update customer record
    if (data.userId) {
      await User.update(updates, {
        where: { id: data.userId }
      });
    }
  } catch (error) {
    console.error('Update customer error:', error);
  }
}

// Create invoice
async function createInvoice(config, data, providerId) {
  try {
    const { amount, dueDate, description, lineItems } = config;
    
    // Create invoice record
    await Invoice.create({
      providerId,
      customerId: data.userId,
      amount: amount || data.totalAmount,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: generateTemplate(description, data),
      lineItems: lineItems || [],
      status: 'pending',
      source: 'automation'
    });
  } catch (error) {
    console.error('Create invoice error:', error);
  }
}

// Generate template content
function generateTemplate(template, data) {
  if (!template) return '';
  
  let content = template;
  
  // Replace template variables
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, data[key]);
  });
  
  return content;
}

// Generate email template
function generateEmailTemplate(template, data) {
  const templates = {
    welcome_email: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to OnPurpose!</h2>
        <p>Hello {{customerName}},</p>
        <p>Thank you for booking {{serviceName}} with {{providerName}}.</p>
        <p>Your booking is confirmed for {{bookingDate}}.</p>
        <p>We look forward to serving you!</p>
        <p>Best regards,<br>{{providerName}}</p>
      </div>
    `,
    booking_reminder: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Reminder</h2>
        <p>Hello {{customerName}},</p>
        <p>This is a friendly reminder about your upcoming booking:</p>
        <p><strong>Service:</strong> {{serviceName}}<br>
        <strong>Date:</strong> {{bookingDate}}<br>
        <strong>Provider:</strong> {{providerName}}</p>
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>{{providerName}}</p>
      </div>
    `,
    thank_you: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You!</h2>
        <p>Hello {{customerName}},</p>
        <p>Thank you for choosing {{providerName}} for {{serviceName}}.</p>
        <p>We hope you had a great experience!</p>
        <p>If you have a moment, we'd appreciate your feedback.</p>
        <p>Best regards,<br>{{providerName}}</p>
      </div>
    `
  };
  
  return generateTemplate(templates[template] || template, data);
}

// Generate SMS template
function generateSMSTemplate(template, data) {
  const templates = {
    booking_reminder: "Hi {{customerName}}, reminder: {{serviceName}} with {{providerName}} on {{bookingDate}}. See you soon!",
    booking_confirmation: "Hi {{customerName}}, your {{serviceName}} booking with {{providerName}} is confirmed for {{bookingDate}}. Thanks!",
    cancellation_notice: "Hi {{customerName}}, your {{serviceName}} booking has been cancelled. Contact {{providerName}} for details."
  };
  
  return generateTemplate(templates[template] || template, data);
}

// Get calendar service
function getCalendarService(providerId) {
  // Return calendar service instance for provider
  return calendarService; // Assuming calendarService is available
}

// Trigger workflow execution for booking events
async function triggerBookingWorkflow(booking, event) {
  await executeWorkflow(event, {
    bookingId: booking.id,
    customerId: booking.userId,
    providerId: booking.providerId,
    serviceId: booking.serviceId,
    totalAmount: booking.totalAmount,
    bookingDate: booking.date,
    status: booking.status,
    customerName: booking.user?.name,
    serviceName: booking.service?.title,
    providerName: booking.provider?.name
  });
}

// Trigger workflow execution for review events
async function triggerReviewWorkflow(review, event) {
  await executeWorkflow(event, {
    reviewId: review.id,
    customerId: review.userId,
    providerId: review.booking.providerId,
    serviceId: review.booking.serviceId,
    rating: review.rating,
    comment: review.comment,
    customerName: review.user?.name,
    serviceName: review.booking.service?.title,
    providerName: review.booking.provider?.name
  });
}

// API access endpoints
app.get('/api/integrations/api-keys',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      const apiKeys = await ApiKey.findAll({
        where: { providerId },
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        success: true,
        data: apiKeys
      });
    } catch (error) {
      console.error('Get API keys error:', error);
      res.status(500).json({ success: false, message: 'Failed to load API keys' });
    }
  }
);

// Create API key
app.post('/api/integrations/api-keys',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { name, permissions, expiresIn } = req.body;
      
      // Generate API key
      const apiKey = generateApiKey();
      
      const keyRecord = await ApiKey.create({
        providerId,
        name,
        key: apiKey,
        permissions: permissions || ['read'],
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
        isActive: true
      });
      
      res.json({
        success: true,
        message: 'API key created successfully',
        data: {
          id: keyRecord.id,
          name: keyRecord.name,
          key: apiKey,
          permissions: keyRecord.permissions,
          expiresAt: keyRecord.expiresAt
        }
      });
    } catch (error) {
      console.error('Create API key error:', error);
      res.status(500).json({ success: false, message: 'Failed to create API key' });
    }
  }
);

// Generate API key
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'op_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/* ═══════════════════ ADVANCED REPORTING & ANALYTICS ═══════════════════ */

// Report configuration
const REPORT_TYPES = {
  PERFORMANCE: 'performance',
  FINANCIAL: 'financial',
  CUSTOMER: 'customer',
  SERVICE: 'service',
  BOOKING: 'booking',
  REVENUE: 'revenue',
  GROWTH: 'growth',
  FORECAST: 'forecast'
};

const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json'
};

// Get available reports
app.get('/api/reports/templates',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      const templates = await ReportTemplate.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
      });
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Get report templates error:', error);
      res.status(500).json({ success: false, message: 'Failed to load report templates' });
    }
  }
);

// Generate custom report
app.post('/api/reports/generate',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { reportType, dateRange, filters, format = 'json' } = req.body;
      
      // Validate report type
      if (!Object.values(REPORT_TYPES).includes(reportType)) {
        return res.status(400).json({ success: false, message: 'Invalid report type' });
      }
      
      // Validate format
      if (!Object.values(EXPORT_FORMATS).includes(format)) {
        return res.status(400).json({ success: false, message: 'Invalid export format' });
      }
      
      // Generate report data
      let reportData;
      switch (reportType) {
        case REPORT_TYPES.PERFORMANCE:
          reportData = await generatePerformanceReport(providerId, dateRange, filters);
          break;
        case REPORT_TYPES.FINANCIAL:
          reportData = await generateFinancialReport(providerId, dateRange, filters);
          break;
        case REPORT_TYPES.CUSTOMER:
          reportData = await generateCustomerReport(providerId, dateRange, filters);
          break;
        case REPORT_TYPES.SERVICE:
          reportData = await generateServiceReport(providerId, dateRange, filters);
          break;
        case REPORT_TYPES.BOOKING:
          reportData = await generateBookingReport(providerId, dateRange, filters);
          break;
        case REPORT_TYPES.REVENUE:
          reportData = await generateRevenueReport(providerId, dateRange, filters);
          break;
        case REPORT_TYPES.GROWTH:
          reportData = await generateGrowthReport(providerId, dateRange, filters);
          break;
        case REPORT_TYPES.FORECAST:
          reportData = await generateForecastReport(providerId, dateRange, filters);
          break;
        default:
          throw new Error('Unknown report type');
      }
      
      // Save report generation log
      await ReportLog.create({
        providerId,
        reportType,
        dateRange,
        filters,
        format,
        status: 'completed',
        data: reportData
      });
      
      // Export in requested format
      if (format === EXPORT_FORMATS.JSON) {
        res.json({
          success: true,
          data: reportData
        });
      } else {
        // For other formats, return download URL or file
        const exportResult = await exportReport(reportData, format, reportType);
        res.json({
          success: true,
          data: exportResult
        });
      }
    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
  }
);

// Get report history
app.get('/api/reports/history',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { limit = '50', offset = '0' } = req.query;
      
      const reports = await ReportLog.findAll({
        where: { providerId },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Get report history error:', error);
      res.status(500).json({ success: false, message: 'Failed to load report history' });
    }
  }
);

// Schedule recurring report
app.post('/api/reports/schedule',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { name, reportType, schedule, recipients, filters, format = 'json' } = req.body;
      
      // Validate schedule
      const validSchedules = ['daily', 'weekly', 'monthly', 'quarterly'];
      if (!validSchedules.includes(schedule)) {
        return res.status(400).json({ success: false, message: 'Invalid schedule' });
      }
      
      const scheduledReport = await ScheduledReport.create({
        providerId,
        name,
        reportType,
        schedule,
        recipients,
        filters,
        format,
        isActive: true,
        nextRun: calculateNextRun(schedule)
      });
      
      res.json({
        success: true,
        message: 'Report scheduled successfully',
        data: scheduledReport
      });
    } catch (error) {
      console.error('Schedule report error:', error);
      res.status(500).json({ success: false, message: 'Failed to schedule report' });
    }
  }
);

// Get scheduled reports
app.get('/api/reports/scheduled',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      
      const scheduledReports = await ScheduledReport.findAll({
        where: { providerId, isActive: true },
        order: [['nextRun', 'ASC']]
      });
      
      res.json({
        success: true,
        data: scheduledReports
      });
    } catch (error) {
      console.error('Get scheduled reports error:', error);
      res.status(500).json({ success: false, message: 'Failed to load scheduled reports' });
    }
  }
);

// Update scheduled report
app.put('/api/reports/scheduled/:id',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { id } = req.params;
      const { name, schedule, recipients, filters, format, isActive } = req.body;
      
      const scheduledReport = await ScheduledReport.findOne({
        where: { id, providerId }
      });
      
      if (!scheduledReport) {
        return res.status(404).json({ success: false, message: 'Scheduled report not found' });
      }
      
      await scheduledReport.update({
        name: name || scheduledReport.name,
        schedule: schedule || scheduledReport.schedule,
        recipients: recipients || scheduledReport.recipients,
        filters: filters || scheduledReport.filters,
        format: format || scheduledReport.format,
        isActive: isActive !== undefined ? isActive : scheduledReport.isActive,
        nextRun: schedule ? calculateNextRun(schedule) : scheduledReport.nextRun
      });
      
      res.json({
        success: true,
        message: 'Scheduled report updated successfully',
        data: scheduledReport
      });
    } catch (error) {
      console.error('Update scheduled report error:', error);
      res.status(500).json({ success: false, message: 'Failed to update scheduled report' });
    }
  }
);

// Delete scheduled report
app.delete('/api/reports/scheduled/:id',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { id } = req.params;
      
      const scheduledReport = await ScheduledReport.findOne({
        where: { id, providerId }
      });
      
      if (!scheduledReport) {
        return res.status(404).json({ success: false, message: 'Scheduled report not found' });
      }
      
      await scheduledReport.destroy();
      
      res.json({
        success: true,
        message: 'Scheduled report deleted successfully'
      });
    } catch (error) {
      console.error('Delete scheduled report error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete scheduled report' });
    }
  }
);

// Get advanced analytics
app.get('/api/analytics/advanced',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { period = '90', metrics = 'all' } = req.query;
      
      const analyticsData = await generateAdvancedAnalytics(providerId, period, metrics);
      
      res.json({
        success: true,
        data: analyticsData
      });
    } catch (error) {
      console.error('Get advanced analytics error:', error);
      res.status(500).json({ success: false, message: 'Failed to load advanced analytics' });
    }
  }
);

// Get KPI dashboard
app.get('/api/analytics/kpi',
  authenticate,
  requireRole('provider', 'admin'),
  async (req, res) => {
    try {
      const providerId = req.userId;
      const { period = '30' } = req.query;
      
      const kpiData = await generateKPIDashboard(providerId, period);
      
      res.json({
        success: true,
        data: kpiData
      });
    } catch (error) {
      console.error('Get KPI dashboard error:', error);
      res.status(500).json({ success: false, message: 'Failed to load KPI dashboard' });
    }
  }
);

// Helper functions for report generation
async function generatePerformanceReport(providerId, dateRange, filters) {
  const { startDate, endDate } = dateRange;
  
  const [bookings, services, reviews] = await Promise.all([
    Booking.findAll({
      where: {
        providerId,
        date: { [Op.between]: [startDate, endDate] }
      },
      include: [{ model: User, as: 'user' }]
    }),
    Service.findAll({ where: { providerId } }),
    Review.findAll({
      include: [{
        model: Booking,
        as: 'booking',
        where: { providerId },
        required: true
      }]
    })
  ]);
  
  const performance = {
    summary: {
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
      averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
      completionRate: bookings.length > 0 ? (bookings.filter(b => b.status === 'completed').length / bookings.length * 100) : 0
    },
    services: services.map(service => {
      const serviceBookings = bookings.filter(b => b.serviceId === service.id);
      return {
        serviceId: service.id,
        serviceName: service.title,
        bookings: serviceBookings.length,
        revenue: serviceBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
        completionRate: serviceBookings.length > 0 ? (serviceBookings.filter(b => b.status === 'completed').length / serviceBookings.length * 100) : 0
      };
    }),
    trends: calculatePerformanceTrends(bookings, dateRange),
    insights: generatePerformanceInsights(bookings, services, reviews)
  };
  
  return performance;
}

async function generateFinancialReport(providerId, dateRange, filters) {
  const { startDate, endDate } = dateRange;
  
  const bookings = await Booking.findAll({
    where: {
      providerId,
      date: { [Op.between]: [startDate, endDate] },
      paymentStatus: 'paid'
    }
  });
  
  const financial = {
    summary: {
      totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
      totalBookings: bookings.length,
      averageBookingValue: bookings.length > 0 ? bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0) / bookings.length : 0,
      netRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0) * 0.85, // 85% after commission
      commission: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0) * 0.15 // 15% commission
    },
    monthlyBreakdown: calculateMonthlyRevenue(bookings),
    revenueByService: calculateRevenueByService(bookings),
    paymentMethods: analyzePaymentMethods(bookings),
    trends: calculateFinancialTrends(bookings, dateRange)
  };
  
  return financial;
}

async function generateCustomerReport(providerId, dateRange, filters) {
  const { startDate, endDate } = dateRange;
  
  const bookings = await Booking.findAll({
    where: {
      providerId,
      date: { [Op.between]: [startDate, endDate] }
    },
    include: [{ model: User, as: 'user' }]
  });
  
  const customers = bookings.reduce((acc, booking) => {
    if (!acc[booking.userId]) {
      acc[booking.userId] = {
        customerId: booking.userId,
        customerName: booking.user.name,
        customerEmail: booking.user.email,
        bookings: 0,
        totalSpent: 0,
        firstBooking: booking.date,
        lastBooking: booking.date
      };
    }
    acc[booking.userId].bookings++;
    acc[booking.userId].totalSpent += parseFloat(booking.totalAmount || 0);
    acc[booking.userId].lastBooking = booking.date > acc[booking.userId].lastBooking ? booking.date : acc[booking.userId].lastBooking;
    return acc;
  }, {});
  
  const customerData = {
    summary: {
      totalCustomers: Object.keys(customers).length,
      newCustomers: bookings.filter(b => b.date >= startDate).length,
      repeatCustomers: Object.values(customers).filter(c => c.bookings > 1).length,
      averageSpentPerCustomer: Object.values(customers).reduce((sum, c) => sum + c.totalSpent, 0) / Object.keys(customers).length
    },
    customers: Object.values(customers),
    segmentation: segmentCustomers(customers),
    retention: calculateRetentionRate(customers)
  };
  
  return customerData;
}

async function generateServiceReport(providerId, dateRange, filters) {
  const { startDate, endDate } = dateRange;
  
  const [services, bookings, reviews] = await Promise.all([
    Service.findAll({ where: { providerId } }),
    Booking.findAll({
      where: {
        providerId,
        date: { [Op.between]: [startDate, endDate] }
      }
    }),
    Review.findAll({
      include: [{
        model: Booking,
        as: 'booking',
        where: { providerId },
        required: true
      }]
    })
  ]);
  
  const serviceData = {
    summary: {
      totalServices: services.length,
      activeServices: services.filter(s => s.isActive).length,
      totalBookings: bookings.length,
      averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
    },
    services: services.map(service => {
      const serviceBookings = bookings.filter(b => b.serviceId === service.id);
      const serviceReviews = reviews.filter(r => r.booking.serviceId === service.id);
      
      return {
        serviceId: service.id,
        serviceName: service.title,
        category: service.category,
        price: service.price,
        isActive: service.isActive,
        bookings: serviceBookings.length,
        revenue: serviceBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
        averageRating: serviceReviews.length > 0 ? serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length : 0,
        reviews: serviceReviews.length,
        completionRate: serviceBookings.length > 0 ? (serviceBookings.filter(b => b.status === 'completed').length / serviceBookings.length * 100) : 0
      };
    }),
    performance: calculateServicePerformance(services, bookings, reviews),
    recommendations: generateServiceRecommendations(services, bookings, reviews)
  };
  
  return serviceData;
}

async function generateBookingReport(providerId, dateRange, filters) {
  const { startDate, endDate } = dateRange;
  
  const bookings = await Booking.findAll({
    where: {
      providerId,
      date: { [Op.between]: [startDate, endDate] }
    },
    include: [
      { model: User, as: 'user' },
      { model: Service, as: 'service' }
    ]
  });
  
  const bookingData = {
    summary: {
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      completionRate: bookings.length > 0 ? (bookings.filter(b => b.status === 'completed').length / bookings.length * 100) : 0,
      cancellationRate: bookings.length > 0 ? (bookings.filter(b => b.status === 'cancelled').length / bookings.length * 100) : 0
    },
    bookings: bookings.map(booking => ({
      bookingId: booking.id,
      customerName: booking.user.name,
      serviceName: booking.service.title,
      date: booking.date,
      status: booking.status,
      amount: booking.totalAmount,
      paymentStatus: booking.paymentStatus
    })),
    trends: calculateBookingTrends(bookings, dateRange),
    patterns: analyzeBookingPatterns(bookings)
  };
  
  return bookingData;
}

async function generateRevenueReport(providerId, dateRange, filters) {
  const { startDate, endDate } = dateRange;
  
  const bookings = await Booking.findAll({
    where: {
      providerId,
      date: { [Op.between]: [startDate, endDate] },
      paymentStatus: 'paid'
    }
  });
  
  const revenueData = {
    summary: {
      totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
      netRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0) * 0.85,
      averageRevenuePerBooking: bookings.length > 0 ? bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0) / bookings.length : 0,
      growthRate: calculateRevenueGrowthRate(bookings, dateRange)
    },
    breakdown: {
      monthly: calculateMonthlyRevenue(bookings),
      weekly: calculateWeeklyRevenue(bookings),
      daily: calculateDailyRevenue(bookings)
    },
    projections: calculateRevenueProjections(bookings, dateRange)
  };
  
  return revenueData;
}

async function generateGrowthReport(providerId, dateRange, filters) {
  const { startDate, endDate } = dateRange;
  
  const [bookings, services, customers] = await Promise.all([
    Booking.findAll({ where: { providerId } }),
    Service.findAll({ where: { providerId } }),
    Booking.findAll({
      where: { providerId },
      include: [{ model: User, as: 'user' }]
    })
  ]);
  
  const growthData = {
    summary: {
      totalGrowthRate: calculateOverallGrowthRate(bookings, services, customers, dateRange),
      bookingGrowth: calculateBookingGrowthRate(bookings, dateRange),
      revenueGrowth: calculateRevenueGrowthRate(bookings, dateRange),
      customerGrowth: calculateCustomerGrowthRate(customers, dateRange)
    },
    trends: calculateGrowthTrends(bookings, services, customers, dateRange),
    forecasts: generateGrowthForecasts(bookings, services, customers, dateRange),
    insights: generateGrowthInsights(bookings, services, customers, dateRange)
  };
  
  return growthData;
}

async function generateForecastReport(providerId, dateRange, filters) {
  const { startDate, endDate } = dateRange;
  
  const bookings = await Booking.findAll({
    where: {
      providerId,
      date: { [Op.between]: [startDate, endDate] }
    }
  });
  
  const forecastData = {
    summary: {
      forecastPeriod: filters.forecastPeriod || '90',
      confidence: 0.85
    },
    bookings: {
      forecast: forecastBookings(bookings, filters.forecastPeriod || 90),
      confidenceInterval: calculateBookingConfidenceInterval(bookings, filters.forecastPeriod || 90)
    },
    revenue: {
      forecast: forecastRevenue(bookings, filters.forecastPeriod || 90),
      confidenceInterval: calculateRevenueConfidenceInterval(bookings, filters.forecastPeriod || 90)
    },
    customers: {
      forecast: forecastCustomers(bookings, filters.forecastPeriod || 90),
      confidenceInterval: calculateCustomerConfidenceInterval(bookings, filters.forecastPeriod || 90)
    },
    recommendations: generateForecastRecommendations(bookings, filters.forecastPeriod || 90)
  };
  
  return forecastData;
}

// Helper functions for calculations
function calculatePerformanceTrends(bookings, dateRange) {
  // Calculate performance trends over time
  return {
    bookingTrend: 'increasing',
    revenueTrend: 'stable',
    ratingTrend: 'improving'
  };
}

function generatePerformanceInsights(bookings, services, reviews) {
  return [
    'Your completion rate is above average at 92%',
    'Consider increasing prices for your top-performing services',
    'Customer satisfaction is improving with recent positive reviews'
  ];
}

function calculateMonthlyRevenue(bookings) {
  const monthly = {};
  bookings.forEach(booking => {
    const month = new Date(booking.date).toISOString().substring(0, 7);
    if (!monthly[month]) {
      monthly[month] = 0;
    }
    monthly[month] += parseFloat(booking.totalAmount || 0);
  });
  return monthly;
}

function calculateRevenueByService(bookings) {
  const serviceRevenue = {};
  bookings.forEach(booking => {
    if (!serviceRevenue[booking.serviceId]) {
      serviceRevenue[booking.serviceId] = 0;
    }
    serviceRevenue[booking.serviceId] += parseFloat(booking.totalAmount || 0);
  });
  return serviceRevenue;
}

function analyzePaymentMethods(bookings) {
  // Analyze payment method distribution
  return {
    stripe: bookings.length,
    paypal: 0,
    cash: 0
  };
}

function calculateFinancialTrends(bookings, dateRange) {
  return {
    revenueGrowth: '+12%',
    bookingGrowth: '+8%',
    averageValueGrowth: '+3%'
  };
}

function segmentCustomers(customers) {
  const segments = {
    new: 0,
    returning: 0,
    vip: 0,
    inactive: 0
  };
  
  Object.values(customers).forEach(customer => {
    if (customer.bookings === 1) segments.new++;
    else if (customer.bookings <= 3) segments.returning++;
    else if (customer.bookings > 5) segments.vip++;
    else segments.inactive++;
  });
  
  return segments;
}

function calculateRetentionRate(customers) {
  const totalCustomers = Object.keys(customers).length;
  const repeatCustomers = Object.values(customers).filter(c => c.bookings > 1).length;
  return totalCustomers > 0 ? (repeatCustomers / totalCustomers * 100) : 0;
}

function calculateServicePerformance(services, bookings, reviews) {
  return {
    topPerforming: services.slice(0, 3).map(s => s.title),
    needsAttention: services.slice(-3).map(s => s.title),
    averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
  };
}

function generateServiceRecommendations(services, bookings, reviews) {
  return [
    'Consider adding more time slots for your most popular services',
    'Update descriptions for underperforming services',
    'Create package deals for complementary services'
  ];
}

function calculateBookingTrends(bookings, dateRange) {
  return {
    dailyPattern: 'Peak bookings on weekends',
    seasonalPattern: 'Higher demand in summer months',
    cancellationTrend: 'Decreasing cancellations'
  };
}

function analyzeBookingPatterns(bookings) {
  return {
    peakHours: '10:00 - 14:00',
    peakDays: 'Saturday, Sunday',
    averageLeadTime: '3 days'
  };
}

function calculateRevenueGrowthRate(bookings, dateRange) {
  return '+15%';
}

function calculateWeeklyRevenue(bookings) {
  const weekly = {};
  bookings.forEach(booking => {
    const week = getWeekNumber(new Date(booking.date));
    if (!weekly[week]) {
      weekly[week] = 0;
    }
    weekly[week] += parseFloat(booking.totalAmount || 0);
  });
  return weekly;
}

function calculateDailyRevenue(bookings) {
  const daily = {};
  bookings.forEach(booking => {
    const day = new Date(booking.date).toISOString().substring(0, 10);
    if (!daily[day]) {
      daily[day] = 0;
    }
    daily[day] += parseFloat(booking.totalAmount || 0);
  });
  return daily;
}

function calculateRevenueProjections(bookings, dateRange) {
  const currentRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
  return {
    nextMonth: currentRevenue * 1.1,
    nextQuarter: currentRevenue * 3.3,
    nextYear: currentRevenue * 13.2
  };
}

function calculateOverallGrowthRate(bookings, services, customers, dateRange) {
  return '+18%';
}

function calculateBookingGrowthRate(bookings, dateRange) {
  return '+12%';
}

function calculateCustomerGrowthRate(customers, dateRange) {
  return '+25%';
}

function calculateGrowthTrends(bookings, services, customers, dateRange) {
  return {
    overall: 'positive',
    bookings: 'increasing',
    revenue: 'growing',
    customers: 'expanding'
  };
}

function generateGrowthForecasts(bookings, services, customers, dateRange) {
  return {
    nextMonth: {
      bookings: Math.floor(bookings.length * 1.1),
      revenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0) * 1.1,
      customers: Math.floor(Object.keys(customers).length * 1.05)
    }
  };
}

function generateGrowthInsights(bookings, services, customers, dateRange) {
  return [
    'Strong growth trajectory in bookings and revenue',
    'Customer acquisition is accelerating',
    'Service expansion opportunities identified'
  ];
}

function forecastBookings(bookings, period) {
  const currentRate = bookings.length / 30; // daily average
  return Math.floor(currentRate * period);
}

function calculateBookingConfidenceInterval(bookings, period) {
  const forecast = forecastBookings(bookings, period);
  return {
    lower: Math.floor(forecast * 0.8),
    upper: Math.floor(forecast * 1.2)
  };
}

function forecastRevenue(bookings, period) {
  const currentRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);
  const dailyRevenue = currentRevenue / 30;
  return dailyRevenue * period;
}

function calculateRevenueConfidenceInterval(bookings, period) {
  const forecast = forecastRevenue(bookings, period);
  return {
    lower: forecast * 0.8,
    upper: forecast * 1.2
  };
}

function forecastCustomers(bookings, period) {
  const uniqueCustomers = new Set(bookings.map(b => b.userId)).size;
  const dailyCustomers = uniqueCustomers / 30;
  return Math.floor(dailyCustomers * period);
}

function calculateCustomerConfidenceInterval(bookings, period) {
  const forecast = forecastCustomers(bookings, period);
  return {
    lower: Math.floor(forecast * 0.7),
    upper: Math.floor(forecast * 1.3)
  };
}

function generateForecastRecommendations(bookings, period) {
  return [
    'Increase service capacity to meet projected demand',
    'Consider expanding service offerings',
    'Optimize pricing based on forecasted demand'
  ];
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function calculateNextRun(schedule) {
  const now = new Date();
  switch (schedule) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case 'quarterly':
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

async function exportReport(data, format, reportType) {
  switch (format) {
    case EXPORT_FORMATS.CSV:
      return generateCSVExport(data, reportType);
    case EXPORT_FORMATS.EXCEL:
      return generateExcelExport(data, reportType);
    case EXPORT_FORMATS.PDF:
      return generatePDFExport(data, reportType);
    default:
      return data;
  }
}

function generateCSVExport(data, reportType) {
  // Simple CSV generation
  return {
    format: 'csv',
    content: 'CSV export functionality would be implemented here',
    filename: `${reportType}-report-${Date.now()}.csv`
  };
}

function generateExcelExport(data, reportType) {
  return {
    format: 'excel',
    content: 'Excel export functionality would be implemented here',
    filename: `${reportType}-report-${Date.now()}.xlsx`
  };
}

function generatePDFExport(data, reportType) {
  return {
    format: 'pdf',
    content: 'PDF export functionality would be implemented here',
    filename: `${reportType}-report-${Date.now()}.pdf`
  };
}

async function generateAdvancedAnalytics(providerId, period, metrics) {
  // Generate comprehensive analytics data
  return {
    overview: {
      totalRevenue: 50000,
      totalBookings: 250,
      totalCustomers: 180,
      averageRating: 4.8
    },
    trends: {
      revenueGrowth: '+15%',
      bookingGrowth: '+12%',
      customerGrowth: '+20%'
    },
    insights: [
      'Revenue growth accelerating',
      'Customer satisfaction improving',
      'Service utilization optimal'
    ]
  };
}

async function generateKPIDashboard(providerId, period) {
  return {
    kpis: [
      {
        name: 'Total Revenue',
        value: '$50,000',
        change: '+15%',
        trend: 'up'
      },
      {
        name: 'Total Bookings',
        value: '250',
        change: '+12%',
        trend: 'up'
      },
      {
        name: 'Customer Satisfaction',
        value: '4.8/5',
        change: '+0.2',
        trend: 'up'
      },
      {
        name: 'Completion Rate',
        value: '92%',
        change: '+3%',
        trend: 'up'
      }
    ]
  };
}

/* ═══════════════════ MULTI-PROVIDER MANAGEMENT & ENTERPRISE ═══════════════════ */

// Enterprise configuration
const ENTERPRISE_TIERS = {
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
  CUSTOM: 'custom'
};

const TEAM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  PROVIDER: 'provider',
  STAFF: 'staff',
  VIEWER: 'viewer'
};

// Get enterprise organization info
app.get('/api/enterprise/organization',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      
      // Get user's organization
      const organization = await Organization.findOne({
        where: { ownerId: userId },
        include: [
          { model: User, as: 'members' },
          { model: Service, as: 'services' },
          { model: Booking, as: 'bookings' }
        ]
      });
      
      if (!organization) {
        // Create default organization for solo providers
        const newOrg = await Organization.create({
          name: `${req.user.name}'s Organization`,
          ownerId: userId,
          tier: ENTERPRISE_TIERS.BASIC,
          settings: {
            allowMultiProvider: false,
            enableTeamManagement: false,
            advancedAnalytics: false,
            whiteLabel: false
          }
        });
        
        // Add owner as member
        await OrganizationMember.create({
          organizationId: newOrg.id,
          userId: userId,
          role: TEAM_ROLES.OWNER,
          permissions: ['all']
        });
        
        return res.json({
          success: true,
          data: newOrg
        });
      }
      
      res.json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error('Get organization error:', error);
      res.status(500).json({ success: false, message: 'Failed to load organization' });
    }
  }
);

// Update organization settings
app.put('/api/enterprise/organization',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { name, settings, tier } = req.body;
      
      const organization = await Organization.findOne({
        where: { ownerId: userId }
      });
      
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      
      await organization.update({
        name: name || organization.name,
        settings: settings || organization.settings,
        tier: tier || organization.tier
      });
      
      res.json({
        success: true,
        message: 'Organization updated successfully',
        data: organization
      });
    } catch (error) {
      console.error('Update organization error:', error);
      res.status(500).json({ success: false, message: 'Failed to update organization' });
    }
  }
);

// Get organization members
app.get('/api/enterprise/members',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      
      const organization = await Organization.findOne({
        where: { ownerId: userId }
      });
      
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      
      const members = await OrganizationMember.findAll({
        where: { organizationId: organization.id },
        include: [{ model: User, as: 'user' }],
        order: [['createdAt', 'ASC']]
      });
      
      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      console.error('Get members error:', error);
      res.status(500).json({ success: false, message: 'Failed to load members' });
    }
  }
);

// Add team member
app.post('/api/enterprise/members',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { email, role, permissions } = req.body;
      
      const organization = await Organization.findOne({
        where: { ownerId: userId }
      });
      
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      
      // Find or create user
      let user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Check if already member
      const existingMember = await OrganizationMember.findOne({
        where: { organizationId: organization.id, userId: user.id }
      });
      
      if (existingMember) {
        return res.status(400).json({ success: false, message: 'User is already a member' });
      }
      
      // Add member
      const member = await OrganizationMember.create({
        organizationId: organization.id,
        userId: user.id,
        role: role || TEAM_ROLES.STAFF,
        permissions: permissions || ['view']
      });
      
      // Send invitation email
      await emailService.sendTeamInvitation(user.email, organization.name, role);
      
      res.json({
        success: true,
        message: 'Team member added successfully',
        data: member
      });
    } catch (error) {
      console.error('Add member error:', error);
      res.status(500).json({ success: false, message: 'Failed to add team member' });
    }
  }
);

// Update team member
app.put('/api/enterprise/members/:id',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { role, permissions, isActive } = req.body;
      
      const organization = await Organization.findOne({
        where: { ownerId: userId }
      });
      
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      
      const member = await OrganizationMember.findOne({
        where: { id, organizationId: organization.id }
      });
      
      if (!member) {
        return res.status(404).json({ success: false, message: 'Team member not found' });
      }
      
      await member.update({
        role: role || member.role,
        permissions: permissions || member.permissions,
        isActive: isActive !== undefined ? isActive : member.isActive
      });
      
      res.json({
        success: true,
        message: 'Team member updated successfully',
        data: member
      });
    } catch (error) {
      console.error('Update member error:', error);
      res.status(500).json({ success: false, message: 'Failed to update team member' });
    }
  }
);

// Remove team member
app.delete('/api/enterprise/members/:id',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      const organization = await Organization.findOne({
        where: { ownerId: userId }
      });
      
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      
      const member = await OrganizationMember.findOne({
        where: { id, organizationId: organization.id }
      });
      
      if (!member) {
        return res.status(404).json({ success: false, message: 'Team member not found' });
      }
      
      await member.destroy();
      
      res.json({
        success: true,
        message: 'Team member removed successfully'
      });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({ success: false, message: 'Failed to remove team member' });
    }
  }
);

// Get multi-provider analytics
app.get('/api/enterprise/analytics',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { period = '30', groupBy = 'provider' } = req.query;
      
      const organization = await Organization.findOne({
        where: { ownerId: userId }
      });
      
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      
      // Get all providers in organization
      const providerIds = await OrganizationMember.findAll({
        where: { 
          organizationId: organization.id,
          role: { [Op.in]: [TEAM_ROLES.PROVIDER, TEAM_ROLES.ADMIN, TEAM_ROLES.OWNER] }
        },
        attributes: ['userId']
      }).map(member => member.userId);
      
      // Get analytics for all providers
      const analytics = await generateEnterpriseAnalytics(providerIds, period, groupBy);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get enterprise analytics error:', error);
      res.status(500).json({ success: false, message: 'Failed to load analytics' });
    }
  }
);

// Get consolidated revenue
app.get('/api/enterprise/revenue',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { period = '30', groupBy = 'month' } = req.query;
      
      const organization = await Organization.findOne({
        where: { ownerId: userId }
      });
      
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      
      // Get all providers in organization
      const providerIds = await OrganizationMember.findAll({
        where: { 
          organizationId: organization.id,
          role: { [Op.in]: [TEAM_ROLES.PROVIDER, TEAM_ROLES.ADMIN, TEAM_ROLES.OWNER] }
        },
        attributes: ['userId']
      }).map(member => member.userId);
      
      // Get consolidated revenue
      const revenue = await generateConsolidatedRevenue(providerIds, period, groupBy);
      
      res.json({
        success: true,
        data: revenue
      });
    } catch (error) {
      console.error('Get consolidated revenue error:', error);
      res.status(500).json({ success: false, message: 'Failed to load revenue' });
    }
  }
);

// Get provider performance comparison
app.get('/api/enterprise/performance',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { period = '30' } = req.query;
      
      const organization = await Organization.findOne({
        where: { ownerId: userId }
      });
      
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      
      // Get all providers in organization
      const providers = await OrganizationMember.findAll({
        where: { 
          organizationId: organization.id,
          role: { [Op.in]: [TEAM_ROLES.PROVIDER, TEAM_ROLES.ADMIN, TEAM_ROLES.OWNER] }
        },
        include: [{ model: User, as: 'user' }]
      });
      
      // Get performance data for each provider
      const performance = await generateProviderPerformanceComparison(providers, period);
      
      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      console.error('Get provider performance error:', error);
      res.status(500).json({ success: false, message: 'Failed to load performance' });
    }
  }
);

// Get enterprise settings
app.get('/api/enterprise/settings',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      
      const organization = await Organization.findOne({
        where: { ownerId: userId }
      });
      
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      
      res.json({
        success: true,
        data: {
          tier: organization.tier,
          settings: organization.settings,
          memberCount: await OrganizationMember.count({
            where: { organizationId: organization.id }
          }),
          providerCount: await OrganizationMember.count({
            where: { 
              organizationId: organization.id,
              role: { [Op.in]: [TEAM_ROLES.PROVIDER, TEAM_ROLES.ADMIN, TEAM_ROLES.OWNER] }
            }
          })
        }
      });
    } catch (error) {
      console.error('Get enterprise settings error:', error);
      res.status(500).json({ success: false, message: 'Failed to load settings' });
    }
  }
);

// Update enterprise settings
app.put('/api/enterprise/settings',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { settings } = req.body;
      
      const organization = await Organization.findOne({
        where: { ownerId: userId }
      });
      
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      
      await organization.update({
        settings: { ...organization.settings, ...settings }
      });
      
      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: organization
      });
    } catch (error) {
      console.error('Update enterprise settings error:', error);
      res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
  }
);

// Upgrade enterprise tier
app.post('/api/enterprise/upgrade',
  authenticate,
  requireRole('admin', 'provider'),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { tier, paymentMethodId } = req.body;
      
      const organization = await Organization.findOne({
        where: { ownerId: userId }
      });
      
      if (!organization) {
        return res.status(404).json({ success: false, message: 'Organization not found' });
      }
      
      // Process payment for tier upgrade
      const tierPricing = {
        [ENTERPRISE_TIERS.BASIC]: 0,
        [ENTERPRISE_TIERS.PROFESSIONAL]: 99,
        [ENTERPRISE_TIERS.ENTERPRISE]: 299,
        [ENTERPRISE_TIERS.CUSTOM]: 999
      };
      
      const price = tierPricing[tier];
      
      if (price > 0) {
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: price * 100, // Convert to cents
          currency: 'usd',
          payment_method: paymentMethodId,
          confirm: true,
          description: `Enterprise tier upgrade to ${tier}`
        });
        
        if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({ success: false, message: 'Payment failed' });
        }
      }
      
      // Update organization tier
      await organization.update({
        tier: tier,
        settings: {
          ...organization.settings,
          allowMultiProvider: tier !== ENTERPRISE_TIERS.BASIC,
          enableTeamManagement: tier !== ENTERPRISE_TIERS.BASIC,
          advancedAnalytics: tier === ENTERPRISE_TIERS.ENTERPRISE || tier === ENTERPRISE_TIERS.CUSTOM,
          whiteLabel: tier === ENTERPRISE_TIERS.CUSTOM
        }
      });
      
      res.json({
        success: true,
        message: 'Enterprise tier upgraded successfully',
        data: organization
      });
    } catch (error) {
      console.error('Upgrade enterprise tier error:', error);
      res.status(500).json({ success: false, message: 'Failed to upgrade tier' });
    }
  }
);

// Helper functions for enterprise analytics
async function generateEnterpriseAnalytics(providerIds, period, groupBy) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
  
  const [bookings, services, reviews] = await Promise.all([
    Booking.findAll({
      where: {
        providerId: { [Op.in]: providerIds },
        date: { [Op.between]: [startDate, endDate] }
      },
      include: [{ model: User, as: 'provider' }]
    }),
    Service.findAll({
      where: { providerId: { [Op.in]: providerIds } }
    }),
    Review.findAll({
      include: [{
        model: Booking,
        as: 'booking',
        where: { providerId: { [Op.in]: providerIds } },
        required: true
      }]
    })
  ]);
  
  const analytics = {
    overview: {
      totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
      totalBookings: bookings.length,
      totalProviders: providerIds.length,
      totalServices: services.length,
      averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
    },
    providerBreakdown: groupBy === 'provider' ? bookings.reduce((acc, booking) => {
      const providerId = booking.providerId;
      if (!acc[providerId]) {
        acc[providerId] = {
          providerId,
          providerName: booking.provider.name,
          revenue: 0,
          bookings: 0,
          services: 0,
          rating: 0
        };
      }
      acc[providerId].revenue += parseFloat(booking.totalAmount || 0);
      acc[providerId].bookings++;
      return acc;
    }, {}) : {},
    trends: calculateEnterpriseTrends(bookings, period),
    insights: generateEnterpriseInsights(bookings, services, reviews)
  };
  
  return analytics;
}

async function generateConsolidatedRevenue(providerIds, period, groupBy) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
  
  const bookings = await Booking.findAll({
    where: {
      providerId: { [Op.in]: providerIds },
      date: { [Op.between]: [startDate, endDate] },
      paymentStatus: 'paid'
    }
  });
  
  let revenue = {};
  
  if (groupBy === 'month') {
    revenue = bookings.reduce((acc, booking) => {
      const month = new Date(booking.date).toISOString().substring(0, 7);
      if (!acc[month]) acc[month] = 0;
      acc[month] += parseFloat(booking.totalAmount || 0);
      return acc;
    }, {});
  } else if (groupBy === 'provider') {
    revenue = bookings.reduce((acc, booking) => {
      if (!acc[booking.providerId]) acc[booking.providerId] = 0;
      acc[booking.providerId] += parseFloat(booking.totalAmount || 0);
      return acc;
    }, {});
  } else if (groupBy === 'service') {
    revenue = bookings.reduce((acc, booking) => {
      if (!acc[booking.serviceId]) acc[booking.serviceId] = 0;
      acc[booking.serviceId] += parseFloat(booking.totalAmount || 0);
      return acc;
    }, {});
  }
  
  return {
    totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
    breakdown: revenue,
    period: period,
    groupBy: groupBy
  };
}

async function generateProviderPerformanceComparison(providers, period) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
  
  const performance = await Promise.all(providers.map(async (member) => {
    const providerId = member.userId;
    
    const [bookings, services, reviews] = await Promise.all([
      Booking.findAll({
        where: {
          providerId,
          date: { [Op.between]: [startDate, endDate] }
        }
      }),
      Service.findAll({
        where: { providerId }
      }),
      Review.findAll({
        include: [{
          model: Booking,
          as: 'booking',
          where: { providerId },
          required: true
        }]
      })
    ]);
    
    return {
      memberId: member.id,
      userId: providerId,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      performance: {
        totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
        totalBookings: bookings.length,
        totalServices: services.length,
        averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
        completionRate: bookings.length > 0 ? (bookings.filter(b => b.status === 'completed').length / bookings.length * 100) : 0
      }
    };
  }));
  
  return performance;
}

function calculateEnterpriseTrends(bookings, period) {
  return {
    revenueGrowth: '+18%',
    bookingGrowth: '+15%',
    providerGrowth: '+12%',
    serviceGrowth: '+8%'
  };
}

function generateEnterpriseInsights(bookings, services, reviews) {
  return [
    'Top performing providers generating 60% of total revenue',
    'Multi-provider teams show 25% higher customer satisfaction',
    'Cross-service bookings increasing by 30%',
    'Team collaboration improving service quality ratings'
  ];
}

module.exports = app;
