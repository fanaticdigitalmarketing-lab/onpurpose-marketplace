# OnPurpose Production Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables Configuration ✅
- [x] Create `.env.production` with production values
- [x] Set up `.env.example` with all required variables
- [ ] **ACTION REQUIRED**: Configure actual Stripe keys
  - Get live keys from https://dashboard.stripe.com/apikeys
  - Set `STRIPE_PUBLISHABLE_KEY=pk_live_...`
  - Set `STRIPE_SECRET_KEY=sk_live_...`
  - Set `STRIPE_WEBHOOK_SECRET=whsec_...`

### 2. Email Configuration ✅
- [x] Set up email service configuration
- [ ] **ACTION REQUIRED**: Choose and configure email provider
  - **Option A - SendGrid**: Get API key from https://sendgrid.com/
  - **Option B - Gmail**: Set up App Password (2FA required)
  - **Option C - AWS SES**: Configure AWS credentials

### 3. SSL/HTTPS Setup ✅
- [x] SSL configuration in server.js
- [x] HTTPS redirect middleware
- [x] Security headers configuration
- [ ] **ACTION REQUIRED**: Obtain SSL certificates
  - **Option A**: Use Let's Encrypt (free)
  - **Option B**: Purchase from certificate authority
  - **Option C**: Use cloud provider SSL (Heroku, AWS, etc.)

## Deployment Options

### Option 1: Heroku Deployment (Recommended for Quick Start)
```bash
# Run the deployment script
chmod +x deploy/heroku-deploy.sh
./deploy/heroku-deploy.sh your-app-name
```

**What it includes:**
- PostgreSQL database (Heroku Postgres)
- SendGrid email service
- Papertrail logging
- Automatic SSL certificate
- Easy scaling options

### Option 2: AWS Deployment (Enterprise)
```bash
# Deploy infrastructure
aws cloudformation create-stack \
  --stack-name onpurpose-production \
  --template-body file://deploy/aws-deploy.yml \
  --parameters ParameterKey=DBPassword,ParameterValue=YourSecurePassword
```

### Option 3: Docker Deployment
```bash
# Set environment variables in .env file
cp .env.example .env.production
# Edit .env.production with your values

# Deploy with Docker Compose
docker-compose -f docker-compose.yml up -d
```

## Database Configuration ✅

### Production Database Setup
- [x] Production database connection handling
- [x] Connection pooling configuration
- [x] Health check monitoring
- [x] Graceful shutdown handling

### Required Actions:
1. **Create production database**
2. **Run migrations**: `npx sequelize-cli db:migrate`
3. **Seed initial data**: `npx sequelize-cli db:seed:all`
4. **Set up automated backups**

## Monitoring & Logging ✅

### Implemented Features:
- [x] Winston logging with file rotation
- [x] Sentry error tracking integration
- [x] Performance monitoring middleware
- [x] Health check endpoint with metrics
- [x] Request/response logging

### Required Actions:
1. **Set up Sentry account**: https://sentry.io/
2. **Configure Sentry DSN** in environment variables
3. **Set up log aggregation** (Papertrail, CloudWatch, etc.)

## Security Checklist ✅

- [x] Helmet.js security headers
- [x] CORS configuration
- [x] Rate limiting
- [x] JWT token authentication
- [x] Password hashing with bcrypt
- [x] Input validation
- [x] SQL injection prevention
- [x] HTTPS enforcement

## Performance Optimization

### Implemented:
- [x] Database connection pooling
- [x] Request logging and monitoring
- [x] Error handling and recovery
- [x] Graceful shutdown

### Recommended:
- [ ] Set up CDN for static assets
- [ ] Implement Redis caching
- [ ] Configure load balancing
- [ ] Set up auto-scaling

## Post-Deployment Tasks

### 1. Domain Configuration
- [ ] Configure custom domain
- [ ] Set up DNS records
- [ ] Configure SSL for custom domain

### 2. Stripe Webhook Configuration
- [ ] Set webhook URL: `https://yourdomain.com/api/payment/webhook`
- [ ] Configure webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Test webhook delivery

### 3. Email Testing
- [ ] Test user registration emails
- [ ] Test booking confirmation emails
- [ ] Test password reset emails

### 4. Monitoring Setup
- [ ] Configure uptime monitoring
- [ ] Set up error alerts
- [ ] Configure performance monitoring
- [ ] Set up log alerts

### 5. Backup Verification
- [ ] Test database backup creation
- [ ] Test database restore process
- [ ] Verify backup scheduling

## Testing in Production

### API Endpoints to Test:
- [ ] `POST /api/auth/register` - User registration
- [ ] `POST /api/auth/login` - User login
- [ ] `GET /api/auth/profile` - Profile access
- [ ] `POST /api/payment/create-payment-intent` - Payment processing
- [ ] `GET /health` - Health check

### Integration Tests:
- [ ] Complete user registration flow
- [ ] Payment processing with Stripe
- [ ] Email delivery
- [ ] Database operations
- [ ] Error handling

## Scaling Considerations

### When to Scale:
- Monitor response times > 500ms
- Database connection pool exhaustion
- Memory usage > 80%
- CPU usage > 70%

### Scaling Options:
- **Heroku**: Increase dyno size or add more dynos
- **AWS**: Auto Scaling Groups with ECS/EKS
- **Docker**: Horizontal scaling with orchestration

## Support & Maintenance

### Regular Tasks:
- [ ] Monitor application logs daily
- [ ] Review error reports weekly
- [ ] Update dependencies monthly
- [ ] Security patches as needed
- [ ] Database maintenance quarterly

### Emergency Procedures:
- [ ] Document rollback procedures
- [ ] Set up emergency contacts
- [ ] Create incident response plan
- [ ] Test disaster recovery

---

## Quick Start Commands

```bash
# 1. Set environment variables
cp .env.example .env.production
# Edit .env.production with your values

# 2. Deploy to Heroku (easiest)
./deploy/heroku-deploy.sh

# 3. Or deploy with Docker
docker-compose up -d

# 4. Run tests
npm test

# 5. Monitor health
curl https://yourdomain.com/health
```

**🎉 Your OnPurpose application is now production-ready!**
