# 🚂 Railway Manual Deployment Steps

## Current Status: 33/39 tasks (85%)

### ✅ Root Cause Identified:
**PostgreSQL is running, but the onpurpose application service has never been deployed.**

## Required Manual Actions:

### 1. **Update Database Configuration on GitHub** ⏳
- GitHub web editor is open for `config/database.js`
- Replace content with enhanced PostgreSQL configuration
- Commit with message: "Fix PostgreSQL connection configuration for Railway deployment"

### 2. **Access OnPurpose Service in Railway** 🎯
Navigate to the onpurpose service card in Railway dashboard to:
- Connect GitHub repository (`wisserd/onpurpose`)
- Set environment variables
- Deploy the application

### 3. **Set Environment Variables** 📝
Configure these 15 variables in the onpurpose service:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=OnPurpose2025SecureJWTTokenKey789
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_ID=prod_Sw2EKUwHb6Bzqq
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=[SendGrid API Key]
EMAIL_FROM=noreply@sendgrid.net
DATABASE_URL=${{ Postgres-jMk7.DATABASE_URL }}
APP_URL=${{ RAILWAY_PUBLIC_DOMAIN }}
CORS_ORIGIN=${{ RAILWAY_PUBLIC_DOMAIN }}
```

### 4. **Deploy Application** 🚀
- Trigger deployment from GitHub repository
- Monitor logs for successful database connection
- Verify health endpoint responds

### 5. **Test Endpoints** ✅
Once deployed, test:
- `https://onpurpose.up.railway.app/health`
- `https://onpurpose.up.railway.app/api`

## Next Action:
Click on the **onpurpose service card** in Railway dashboard to begin configuration.
