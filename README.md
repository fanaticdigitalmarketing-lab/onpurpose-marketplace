# OnPurpose - Hospitality Services Marketplace 🤝

A full-stack hospitality services marketplace where hosts sell their time, expertise, and experiences to guests seeking authentic connections and personalized services.

## 🚀 Production-Ready Features

### ✅ **Core Backend**
- **Authentication**: JWT-based registration/login with bcrypt password hashing
- **Database**: PostgreSQL with Sequelize ORM and automated migrations
- **API**: RESTful endpoints with comprehensive validation and error handling
- **Security**: Helmet.js, CORS, rate limiting, and input sanitization

### ✅ **Payment Integration**
- **Stripe**: Complete payment processing with webhooks
- **Service Payments**: Secure payment handling for time-based services
- **Webhooks**: Automated payment status updates

### ✅ **Email Notifications**
- **Nodemailer**: Booking confirmations, cancellations, and host notifications
- **HTML Templates**: Professional email templates with booking details
- **Multiple Providers**: Support for Gmail, SendGrid, Mailgun, AWS SES

### ✅ **Frontend Interface**
- **Modern UI**: Responsive design with gradient styling
- **Authentication Flow**: Complete registration, login, and dashboard
- **Real-time Integration**: Direct API communication with error handling

### ✅ **Testing Suite**
- **Unit Tests**: Jest tests for models and routes (90%+ coverage)
- **Integration Tests**: Full API endpoint testing with Supertest
- **Test Configuration**: Automated test runs with coverage reporting

### ✅ **Production Infrastructure**
- **SSL/HTTPS**: Automatic SSL configuration and HTTP redirects
- **Monitoring**: Winston logging, Sentry error tracking, performance metrics
- **Database Backups**: Automated daily backups with cleanup scheduling
- **Health Checks**: Comprehensive system health monitoring

## 🛠️ Quick Start

### Development Setup
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your database and API credentials

# 3. Set up database
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# 4. Start development server
npm run dev

# 5. Run tests
npm test
```

### Production Deployment

#### Railway (One-Click Deploy)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/ejWtds?referralCode=psePsg&utm_medium=integration&utm_source=template&utm_campaign=generic)

#### Manual Railway Setup
```bash
# 1. Connect GitHub repository
# 2. Add environment variables (see DEPLOYMENT_STATUS_FINAL.md)
# 3. Deploy with PostgreSQL database
```
## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/photo` - Upload profile photo

### Hosts
- `GET /api/hosts` - Browse service providers (public)
- `GET /api/hosts/:id` - Get host details and services (public)
- `POST /api/hosts` - Create service provider profile
- `PUT /api/hosts` - Update service offerings
- `GET /api/hosts/me/profile` - Get my service provider profile

### Bookings
- `POST /api/bookings` - Create service booking
- `GET /api/bookings/my` - Get my service bookings
- `GET /api/bookings/upcoming` - Get upcoming service sessions
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /api/bookings/host/pending` - Get pending bookings (service providers)

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/history` - Payment history
- `POST /api/payments/create-connect-account` - Create Stripe Connect account

## 🏗️ Database Schema

- **users** - User accounts (guests and service providers)
- **hosts** - Extended service provider profiles with offerings and rates
- **bookings** - Service session bookings
- **reviews** - Service provider reviews and ratings
- **availability** - Service provider availability slots
- **messages** - Basic chat system
- **experiences** - Specific services offered by providers
- **HostApplications** - Applications to become service providers

## 💳 Stripe Integration

The platform uses Stripe Connect for marketplace payments:
- 20% platform fee on all service transactions
- Automatic payouts to service providers
- Secure payment processing for time-based services
- Webhook handling for payment events

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers

## 📱 Next Steps

1. Set up Stripe Connect accounts for service providers
2. Build React Native mobile app for on-the-go bookings
3. Implement enhanced messaging system
4. Add ID verification for service providers
5. Create admin dashboard for service management
