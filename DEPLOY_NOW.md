# 🚀 Deploy OnPurpose Now - Step by Step Guide

## Option 1: Heroku Deployment (Recommended)

### Prerequisites
1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Have your API keys ready:
   - Stripe Live Keys (from https://dashboard.stripe.com/apikeys)
   - Email provider credentials (SendGrid recommended)

### Step 1: Create .env.production
```bash
# Copy the template and fill in your values
cp .env.example .env.production
```

Edit `.env.production` with your actual values:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-32-character-secret-here
DATABASE_URL=will-be-set-by-heroku
STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### Step 2: Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create app (replace 'your-app-name' with desired name)
heroku create your-app-name --region us

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Add SendGrid (optional if using different email provider)
heroku addons:create sendgrid:starter

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-32-character-secret"
heroku config:set STRIPE_PUBLISHABLE_KEY="pk_live_..."
heroku config:set STRIPE_SECRET_KEY="sk_live_..."
heroku config:set STRIPE_WEBHOOK_SECRET="whsec_..."
heroku config:set EMAIL_HOST="smtp.sendgrid.net"
heroku config:set EMAIL_PORT="587"
heroku config:set EMAIL_USER="apikey"
heroku config:set EMAIL_PASS="your_sendgrid_key"
heroku config:set EMAIL_FROM="noreply@yourdomain.com"

# Deploy the application
git add .
git commit -m "Production deployment"
git push heroku main

# Run database migrations
heroku run npx sequelize-cli db:migrate

# Seed the database
heroku run npx sequelize-cli db:seed:all

# Open your app
heroku open
```

## Option 2: Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Server with public IP or domain

### Step 1: Configure Environment
```bash
# Create production environment file
cp .env.example .env.production
# Edit with your values
```

### Step 2: Deploy with Docker
```bash
# Build and start containers
docker-compose up -d --build

# Run migrations
docker-compose exec app npx sequelize-cli db:migrate

# Seed database
docker-compose exec app npx sequelize-cli db:seed:all
```

## Post-Deployment Steps

### 1. Configure Stripe Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-app-url.com/api/payment/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the webhook secret and update your environment variables

### 2. Test Your Deployment
```bash
# Install test dependencies
npm install axios colors

# Run production tests
node deploy/production-test.js https://your-app-url.com
```

### 3. Verify Core Functions
- Visit your app URL
- Test user registration
- Test user login
- Test payment flow (use Stripe test cards first)
- Check email notifications

## Quick Commands Reference

```bash
# Check app status
heroku ps --app your-app-name

# View logs
heroku logs --tail --app your-app-name

# Run database backup
heroku run node scripts/backup-database.js --app your-app-name

# Scale dynos
heroku ps:scale web=2 --app your-app-name

# Set custom domain
heroku domains:add yourdomain.com --app your-app-name
```

## Troubleshooting

### Database Issues
```bash
# Check database connection
heroku pg:info --app your-app-name

# Reset database (CAUTION: This deletes all data)
heroku pg:reset DATABASE_URL --app your-app-name --confirm your-app-name
heroku run npx sequelize-cli db:migrate --app your-app-name
heroku run npx sequelize-cli db:seed:all --app your-app-name
```

### SSL Issues
- Heroku provides automatic SSL for .herokuapp.com domains
- For custom domains, add SSL certificate in Heroku dashboard

### Email Issues
- Verify SendGrid API key is correct
- Check SendGrid sender authentication
- Review application logs for email errors

## Security Checklist
- [ ] Strong JWT secret (32+ characters)
- [ ] Stripe live keys configured
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database backups scheduled
- [ ] Monitoring configured

Your OnPurpose application is now ready for production use!
