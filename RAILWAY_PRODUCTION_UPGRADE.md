# 🚀 Railway Production Upgrade Guide

## **Current Status**
- ✅ Basic deployment working at: `https://onpurpose-production-a60a.up.railway.app`
- ✅ Webhook endpoints live and functional
- 🔄 **UPGRADING TO FULL APPLICATION**

## **Step 1: Package.json Updated**
- ✅ Changed main entry from `index.js` → `server.js`
- ✅ Updated start script to use full OnPurpose application

## **Step 2: Environment Variables Required**
**Add these 21 variables in Railway Dashboard:**

### **Database (PostgreSQL)**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
PGDATABASE=${{Postgres.PGDATABASE}}
```

### **Application**
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars
APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
CORS_ORIGIN=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

### **Stripe Integration**
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRODUCT_ID=prod_your_product_id
```

### **SendGrid Email**
```
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key
EMAIL_FROM=noreply@onpurpose.com
```

### **Security & Performance**
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

## **Step 3: Manual Railway Setup**

### **A. Access Railway Dashboard**
1. Go to: `https://railway.app/project/5d985c43-0c94-4349-98dd-ddc42b9481fc`
2. Click on **onpurpose** service
3. Go to **Variables** tab

### **B. Add Environment Variables**
1. Click **+ New Variable**
2. Add each variable from the list above
3. Use **exact** variable names and values
4. **Save** after each addition

### **C. Trigger Deployment**
1. Go to **Deployments** tab
2. Click **Deploy** button
3. Monitor build logs for success

## **Step 4: Expected Results**
- **Health Check**: `GET /health` → Database connection status
- **API Endpoints**: Full OnPurpose marketplace functionality
- **Stripe Payments**: Working payment processing
- **Email Notifications**: SendGrid integration active
- **PostgreSQL**: SSL connection with pooling

## **Step 5: Testing Checklist**
- [ ] `/health` returns database connection success
- [ ] `/api` returns API status
- [ ] Stripe webhook receives events
- [ ] SendGrid sends emails
- [ ] No PostgreSQL connection errors in logs

**Ready for full production deployment!**
