# OnPurpose Marketplace - Complete Codebase Documentation

## 📋 Project Overview

**OnPurpose** is a human services marketplace platform where users can book people for real skills and services - "Book People, Not Places." The platform connects customers with service providers through a secure, payment-enabled system.

### Key Features
- 🎯 Service provider marketplace
- 💳 Stripe payment processing (85/15 revenue split)
- 📧 Professional email system (Resend)
- 🔐 JWT authentication with role-based access
- 📊 Permanent subscriber data storage
- 📱 PWA-ready with mobile compatibility
- 🏢 Multi-provider organization support

---

## 🏗️ Architecture

### Frontend (Netlify)
- **Domain**: onpurpose.earth
- **Technology**: Vanilla HTML/CSS/JavaScript
- **Features**: PWA-ready, iOS-compatible, responsive design
- **Deployment**: Static hosting with API proxy

### Backend (Railway)
- **Domain**: onpurpose-backend-clean-production.up.railway.app
- **Technology**: Node.js + Express + Sequelize
- **Database**: PostgreSQL (production) / SQLite (development)
- **Features**: RESTful API, Stripe webhooks, email service

### Infrastructure
- **Frontend**: Netlify serves static files, proxies `/api/*` to Railway
- **Backend**: Railway runs Node.js server with PostgreSQL
- **Email**: Resend API for transactional emails
- **Payments**: Stripe for payment processing and provider payouts

---

## 📁 Directory Structure

```
OnPurpose/
├── server.js                    # Main backend server
├── package.json                 # Dependencies and scripts
├── frontend/                    # Frontend static files
│   ├── index.html              # Landing page
│   ├── dashboard.html          # User dashboard
│   ├── services.html           # Service browsing
│   ├── provider.html           # Provider signup
│   └── assets/                 # Images, icons, CSS
├── models/                      # Database models
│   ├── index.js                # Model associations
│   ├── User.js                 # User model
│   ├── Service.js              # Service model
│   ├── Booking.js              # Booking model
│   └── ...
├── services/                    # Business logic services
│   ├── emailService.js         # Email handling
│   └── trustScore.js           # Provider scoring
├── middleware/                  # Express middleware
│   ├── auth.js                 # JWT authentication
│   └── security.js             # Security & rate limiting
├── routes/                      # API route handlers
├── config/                      # Configuration files
│   └── database.js             # Database setup
├── migrations/                  # Database migrations
├── backups/                     # System backups
└── deployment/                  # Deployment configs
```

---

## 🔧 Core Components

### 1. Backend Server (`server.js`)

**Main Features:**
- Express server with middleware setup
- Database models and associations
- Authentication routes (register, login, refresh)
- API endpoints for services, bookings, users
- Stripe webhook handling
- Email integration
- Security middleware and rate limiting

**Key Dependencies:**
```json
{
  "express": "^4.18.2",
  "sequelize": "^6.37.8",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.3",
  "stripe": "^14.25.0",
  "resend": "^3.5.0",
  "cors": "^2.8.5",
  "helmet": "^7.1.0"
}
```

### 2. Database Models

#### User Model
```javascript
{
  id: UUID (primary key),
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum('customer', 'provider', 'admin'),
  isVerified: Boolean,
  isSuspended: Boolean,
  bio: Text,
  location: String,
  avatar: String,
  stripeAccountId: String,
  stripeCustomerId: String,
  trustScore: Decimal,
  // ... verification and reset tokens
}
```

#### Service Model
```javascript
{
  id: UUID (primary key),
  title: String,
  description: Text,
  price: Decimal,
  category: String,
  providerId: UUID (foreign key),
  isActive: Boolean,
  duration: Integer (minutes),
  location: String,
  isOnline: Boolean,
  avgRating: Decimal,
  reviewCount: Integer
}
```

#### Booking Model
```javascript
{
  id: UUID (primary key),
  userId: UUID (foreign key),
  serviceId: UUID (foreign key),
  date: DateOnly,
  time: Time,
  status: Enum('pending', 'confirmed', 'in-progress', 'completed', 'cancelled'),
  totalAmount: Decimal,
  platformFee: Decimal,
  providerAmount: Decimal,
  paymentStatus: Enum('pending', 'paid', 'refunded'),
  stripeSessionId: String,
  // ... session tracking fields
}
```

#### Subscriber Model (Permanent Storage)
```javascript
{
  id: UUID (primary key),
  userId: UUID (no foreign key constraint),
  name: String,
  email: String,
  role: String,
  location: String,
  source: String,
  signedUpAt: Date,
  isVerified: Boolean,
  // ... audit fields
}
```

#### EmailLog Model (Audit Trail)
```javascript
{
  id: UUID (primary key),
  recipientEmail: String,
  recipientName: String,
  emailType: String,
  subject: String,
  status: Enum('sent', 'failed', 'bounced'),
  error: Text,
  sentAt: Date,
  metadata: JSON
}
```

### 3. Authentication System

#### JWT Token Management
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- **Token Refresh**: Automatic refresh on expiry
- **Security**: Bcrypt password hashing with pepper

#### Middleware (`middleware/auth.js`)
```javascript
// Authentication middleware
const authenticate = async (req, res, next) => {
  // Validates JWT token, attaches user to request
};

// Optional authentication
const optionalAuth = async (req, res, next) => {
  // Attaches user if token exists, doesn't block if not
};

// Role-based access
const requireRole = (...roles) => (req, res, next) => {
  // Checks user role against allowed roles
};
```

### 4. Email Service (`services/emailService.js`)

**Email Types:**
1. **Verification Email** - New user email verification
2. **Owner Alert** - Notifies admin of new signups
3. **Password Reset** - Password reset requests
4. **Booking Confirmation** - Customer booking confirmations
5. **Provider Notification** - New booking alerts for providers
6. **Team Invitation** - Organization member invitations

**Features:**
- Professional HTML templates with OnPurpose branding
- Email logging for audit trail
- Error handling and retry logic
- Resend API integration

### 5. Payment System

#### Stripe Integration
- **Payment Processing**: Stripe Checkout sessions
- **Revenue Split**: 85% to provider, 15% platform fee
- **Provider Payouts**: Stripe Connect for automated payouts
- **Webhooks**: Payment confirmation and failure handling

#### Payment Flow
1. Customer initiates booking
2. Stripe Checkout session created
3. Customer completes payment
4. Webhook confirms payment
5. Booking status updated
6. Provider notified
7. Payout scheduled via Stripe Connect

### 6. Frontend Pages

#### Landing Page (`index.html`)
- Hero section with value proposition
- Service showcase
- Search functionality
- User authentication
- PWA features

#### Dashboard (`dashboard.html`)
- User profile management
- Service management (providers)
- Booking management
- Payment setup (Stripe Connect)
- Analytics and stats
- Team management (organizations)

#### Service Pages
- Service browsing and filtering
- Detailed service views
- Booking interface
- Payment processing
- Review system

---

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt + pepper
- Token refresh mechanism
- Session management

### API Security
- Rate limiting on all endpoints
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (Sequelize ORM)
- XSS protection

### Data Protection
- Environment variable encryption
- Sensitive field exclusion in API responses
- Secure password storage
- Email verification required
- Account suspension system

### Infrastructure Security
- HTTPS enforcement
- Security headers (Helmet.js)
- Netlify WAF integration
- Railway proxy configuration
- Database SSL (production)

---

## 📧 Email System

### Configuration
```javascript
// Environment variables
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=OnPurpose <noreply@onpurpose.earth>
FRONTEND_URL=https://onpurpose.earth
```

### Email Templates
All emails use a professional base template with:
- OnPurpose branding
- Responsive design
- Professional typography
- Call-to-action buttons
- Social links

### Email Logging
Every email sent is logged in the EmailLog table for:
- Audit trail
- Delivery tracking
- Error analysis
- Compliance requirements

---

## 💳 Payment Processing

### Stripe Configuration
```javascript
// Environment variables
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Revenue Split
- **Platform Fee**: 15%
- **Provider Share**: 85%
- **Automatic Payouts**: Via Stripe Connect

### Payment Flow
1. Create Stripe Checkout session
2. Redirect to Stripe payment page
3. Handle payment success/failure
4. Update booking status via webhook
5. Schedule provider payout
6. Send confirmation emails

---

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and profiles
- **services** - Service listings
- **bookings** - Booking records
- **reviews** - Service reviews
- **subscribers** - Permanent user records
- **email_logs** - Email audit trail

### Supporting Tables
- **availabilities** - Provider availability
- **blocked_dates** - Provider time off
- **organizations** - Multi-provider groups
- **organization_members** - Organization memberships

### Relationships
- Users → Services (one-to-many)
- Users → Bookings (one-to-many as customer)
- Services → Bookings (one-to-many)
- Bookings → Reviews (one-to-one)
- Organizations → OrganizationMembers (one-to-many)

---

## 🚀 Deployment

### Frontend (Netlify)
```toml
# netlify.toml
[build]
  publish = "frontend"
  
[[redirects]]
  from = "/api/*"
  to = "https://onpurpose-backend-clean-production.up.railway.app/api/:splat"
  status = 200
```

### Backend (Railway)
```toml
# railway.toml
[deploy]
  startCommand = "node server.js"
  
[healthcheck]
  path = "/health"
```

### Environment Variables
```bash
# Backend
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
BCRYPT_PEPPER=your_pepper
```

---

## 🧪 Testing

### Test Suites
- `test-registration.js` - User registration flow
- `test-backend-direct.js` - API endpoint testing
- `test-suite.js` - Comprehensive system tests

### Verification Scripts
- `verify-windsurf-protection.js` - System protection verification
- `verify-ios-mobile-compatibility.js` - Mobile compatibility testing

### Manual Testing Checklist
- [ ] User registration and email verification
- [ ] Service creation and management
- [ ] Booking flow and payment processing
- [ ] Provider payout setup
- [ ] Email notifications
- [ ] Mobile responsiveness

---

## 📱 Mobile Features

### PWA Implementation
- Service worker for offline functionality
- App manifest for native app-like experience
- Splash screens for iOS
- Push notification capability

### iOS Compatibility
- Viewport meta tags for Safari
- Touch interaction optimization
- Safe area support
- Smooth scrolling

### Mobile Optimizations
- Responsive design
- Touch-friendly buttons
- Mobile-first navigation
- Optimized images

---

## 🔄 Maintenance

### Daily Tasks
- Monitor email delivery rates
- Check payment processing status
- Review system logs
- Backup database

### Weekly Tasks
- Update security patches
- Review user feedback
- Analyze platform metrics
- Test critical flows

### Monthly Tasks
- Database maintenance
- Performance optimization
- Security audit
- Feature updates

---

## 🚨 Emergency Procedures

### System Restoration
1. Check backups in `/backups/` directory
2. Run verification scripts
3. Test core functionality
4. Deploy only after verification

### Critical Issues
- **Database corruption** → Restore from schema backup
- **Payment system failure** → Check Stripe configuration
- **Email system failure** → Check Resend API and templates
- **Authentication failure** → Check JWT configuration

### Contact Information
- **Technical Support**: onpurposeearth@gmail.com
- **Emergency Restore**: Use protection scripts
- **Documentation**: Check `/backups/` for latest configs

---

## 📊 System Status

### Current Protection Level: MAXIMUM 🔒
- **Protected Components**: 17/17
- **Test Coverage**: 16/16 tests passing
- **Revenue System**: Active (85/15 split)
- **Email System**: Active (permanent logging)
- **Authentication**: Active (JWT + roles)

### Production Readiness
- ✅ Database schema stable
- ✅ Payment processing active
- ✅ Email system functional
- ✅ Security measures in place
- ✅ Mobile compatibility verified
- ✅ Backup systems active

---

## 📝 Development Notes

### Code Style
- ES6+ JavaScript features
- Semantic HTML5 markup
- CSS custom properties for theming
- RESTful API design
- MVC pattern for organization

### Best Practices
- Environment-based configuration
- Error handling and logging
- Input validation and sanitization
- Database transaction management
- Async/await for asynchronous operations

### Performance Considerations
- Database query optimization
- Image compression and lazy loading
- Code splitting for frontend
- Caching strategies
- CDN usage for static assets

---

## 🎯 Future Enhancements

### Planned Features
- Real-time notifications
- Advanced search and filtering
- Provider verification system
- Mobile apps (iOS/Android)
- Analytics dashboard
- Multi-language support

### Scalability Plans
- Microservices architecture
- Load balancing
- Database sharding
- CDN optimization
- Auto-scaling infrastructure

---

## 📞 Support

### Documentation
- **API Documentation**: Check inline code comments
- **Database Schema**: Refer to model definitions
- **Deployment Guide**: Check deployment configs
- **Troubleshooting**: Review error logs

### Community
- **GitHub**: Repository for issues and feature requests
- **Email**: onpurposeearth@gmail.com
- **Social**: @onpurposeearth (all platforms)

---

**© 2025 OnPurpose Inc. All rights reserved.**
**Connection, not dating. Book People, Not Places.**
