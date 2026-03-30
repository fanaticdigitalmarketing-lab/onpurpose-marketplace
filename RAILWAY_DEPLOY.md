# 🚀 Railway Deployment Guide for OnPurpose

## Step 1: Push to GitHub

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Production-ready OnPurpose marketplace"

# Create GitHub repository and push
# Go to github.com/new and create "OnPurpose" repository
git remote add origin https://github.com/YOUR_USERNAME/OnPurpose.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Railway

1. **Go to**: https://railway.app
2. **Sign up/Login** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select** your OnPurpose repository
5. Railway auto-detects Node.js and starts deployment

## Step 3: Add PostgreSQL Database

1. **In Railway dashboard** → **Add Service** → **Database** → **PostgreSQL**
2. Railway automatically sets `DATABASE_URL` environment variable

## Step 4: Set Environment Variables

**Go to your project** → **Variables tab** → **Add these:**

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-32-character-secret-here
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
CORS_ORIGIN=https://onpurpose.up.railway.app
LOG_LEVEL=warn
```

## Step 5: Run Database Migrations

**In Railway dashboard** → **Deployments** → **View Logs** → **Run Command:**

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

Or use Railway's **"Run Command"** feature:
1. **Settings** → **Deploy** → **Run Command**
2. Enter: `npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all`

## Step 6: Configure Stripe Webhook

1. **Go to**: https://dashboard.stripe.com/webhooks
2. **Add endpoint**: `https://your-app.up.railway.app/api/payment/webhook`
3. **Select events**: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. **Copy webhook secret** and update Railway environment variables

## Step 7: Test Your Deployment

```bash
# Test health endpoint
curl https://your-app.up.railway.app/health

# Run comprehensive tests
node deploy/production-test.js https://your-app.up.railway.app
```

## Your Live URLs

- **App**: `https://onpurpose.up.railway.app`
- **API**: `https://onpurpose.up.railway.app/api`
- **Health**: `https://onpurpose.up.railway.app/health`
- **Webhook**: `https://onpurpose.up.railway.app/api/payment/webhook`

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` is set in Railway variables
- Ensure PostgreSQL service is running

### Build Failures
- Check Railway logs in dashboard
- Verify all dependencies in package.json
- Ensure Node.js version compatibility

### Environment Variables
- All secrets must be set in Railway Variables tab
- Restart deployment after adding variables

### Stripe Issues
- Use live keys for production
- Webhook URL must match exactly
- Test with Stripe test cards first

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Database migrations completed
- [ ] User registration works
- [ ] User login works
- [ ] Stripe payments work
- [ ] Email notifications work
- [ ] Webhook endpoint responds
- [ ] SSL certificate active

Railway provides automatic HTTPS, so your app will be secure by default!
