# API Keys Configuration Guide

## 🔑 Stripe Configuration

### 1. Get Stripe Live Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Switch to **Live** mode (toggle in top-left)
3. Copy your keys:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

### 2. Set Up Webhook Endpoint
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/payment/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret**: `whsec_...`

### 3. Configure Environment Variables
```bash
# Add to your .env.production file
STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_key_here
STRIPE_SECRET_KEY=sk_live_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

## 📧 Email Configuration

### Option A: SendGrid (Recommended)
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Go to Settings > API Keys
3. Create new API key with **Full Access**
4. Configure:
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your_actual_sendgrid_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### Option B: Gmail
1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to Google Account Settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. Configure:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=your_email@gmail.com
```

### Option C: AWS SES
1. Set up AWS SES in your region
2. Verify your domain/email
3. Get SMTP credentials
4. Configure:
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_aws_smtp_username
EMAIL_PASS=your_aws_smtp_password
EMAIL_FROM=noreply@yourdomain.com
```

## 🔐 Security Configuration

### JWT Secret
Generate a secure 32+ character secret:
```bash
# Generate random secret
openssl rand -base64 32

# Add to .env.production
JWT_SECRET=your_generated_32_plus_character_secret_here
```

### Database URL
For production database:
```bash
# Heroku Postgres (auto-configured)
DATABASE_URL=postgres://username:password@hostname:5432/database

# AWS RDS
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/onpurpose_production

# Self-hosted
DATABASE_URL=postgresql://username:password@your-db-server:5432/onpurpose_production
```

## 📊 Monitoring Configuration

### Sentry Error Tracking
1. Sign up at [Sentry.io](https://sentry.io/)
2. Create new project (Node.js)
3. Copy DSN
4. Configure:
```bash
SENTRY_DSN=https://your_sentry_key@o123456.ingest.sentry.io/123456
```

## ⚠️ Security Checklist

- [ ] Never commit `.env.production` to version control
- [ ] Use environment variables in production (not .env files)
- [ ] Rotate keys regularly (quarterly recommended)
- [ ] Monitor API key usage in provider dashboards
- [ ] Set up billing alerts for all services
- [ ] Use least-privilege access for all API keys

## 🔄 Key Rotation Schedule

### Monthly:
- Review API key usage logs
- Check for any suspicious activity

### Quarterly:
- Rotate JWT secret
- Rotate database passwords
- Update API keys

### Annually:
- Review all service providers
- Update SSL certificates (if not auto-renewed)
- Security audit of all credentials
