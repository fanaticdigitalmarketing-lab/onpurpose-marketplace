# 🚀 OnPurpose Quick Deploy - Final Steps

## 1. GitHub Repository Setup
1. Sign in to GitHub
2. Create new repository: **OnPurpose**
3. Make it **Public**
4. Copy the repository URL

## 2. Push Code to GitHub
Replace YOUR_USERNAME with your GitHub username:
```bash
git remote add origin https://github.com/YOUR_USERNAME/OnPurpose.git
git branch -M main
git push -u origin main
```

## 3. Railway Deployment
1. Sign in to Railway with GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Select **OnPurpose** repository
4. Railway auto-deploys your Node.js app

## 4. Configure Railway
### Add PostgreSQL Database:
- **Add Service** → **Database** → **PostgreSQL**

### Set Environment Variables (Variables tab):
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
EMAIL_FROM=noreply@onpurpose.app
CORS_ORIGIN=https://onpurpose.up.railway.app
```

### Run Database Setup:
Railway **Run Command**:
```bash
npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all
```

## 5. Configure Stripe Webhook
- **URL**: `https://onpurpose.up.railway.app/api/payment/webhook`
- **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`

## 6. Your Live URLs
- **App**: https://onpurpose.up.railway.app
- **API**: https://onpurpose.up.railway.app/api
- **Health**: https://onpurpose.up.railway.app/health

## 7. Test Deployment
```bash
node deploy/production-test.js https://onpurpose.up.railway.app
```

🎉 Your OnPurpose marketplace will be live!
