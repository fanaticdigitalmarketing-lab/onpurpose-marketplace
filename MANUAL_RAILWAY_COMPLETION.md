# 🎯 Manual Railway Completion Steps

## **Current Status**
- ✅ Code pushed to GitHub with full application upgrade
- ✅ Package.json updated to use `server.js`
- ✅ Webhook endpoints ready
- 🔄 **MANUAL RAILWAY SETUP REQUIRED**

## **Complete These Steps in Railway Dashboard:**

### **Step 1: Navigate to onpurpose Service**
1. Go to: `https://railway.app/project/5d985c43-0c94-4349-98dd-ddc42b9481fc`
2. Click on the **onpurpose** service card
3. Click **Variables** tab

### **Step 2: Add Environment Variables**
**Add these 21 variables one by one:**

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
PGDATABASE=${{Postgres.PGDATABASE}}
NODE_ENV=production
PORT=3000
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars
APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
CORS_ORIGIN=https://${{RAILWAY_PUBLIC_DOMAIN}}
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRODUCT_ID=prod_your_product_id
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key
EMAIL_FROM=noreply@onpurpose.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### **Step 3: Trigger Deployment**
1. Go to **Deployments** tab
2. Click **Deploy** button
3. Monitor build logs

### **Step 4: Test Full Application**
Once deployed, test these endpoints:
- `https://onpurpose-production-a60a.up.railway.app/health`
- `https://onpurpose-production-a60a.up.railway.app/api`
- `https://onpurpose-production-a60a.up.railway.app/webhook/stripe`

## **Expected Results**
- PostgreSQL connection with SSL
- Stripe payment processing
- SendGrid email functionality
- Full OnPurpose marketplace features

**Ready for production use once environment variables are added!**
