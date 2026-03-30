# 🔧 Railway Environment Variables Setup

## **Manual Setup Required**

Based on the Railway dashboard screenshot, you need to manually add environment variables to complete the full application upgrade.

## **Step-by-Step Instructions:**

### **1. Access onpurpose Service**
- Click on the **onpurpose** service in the Railway dashboard
- Navigate to the **Variables** tab

### **2. Add These 21 Environment Variables:**

**Copy and paste each variable exactly:**

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

### **3. For Each Variable:**
1. Click **+ New Variable**
2. Enter **Variable Name** (e.g., `DATABASE_URL`)
3. Enter **Value** (e.g., `${{Postgres.DATABASE_URL}}`)
4. Click **Add**
5. Repeat for all 21 variables

### **4. Deploy Application:**
1. Go to **Deployments** tab
2. Click **Deploy** button
3. Monitor logs for successful startup

### **5. Test Endpoints:**
- **Health**: `https://onpurpose-production-a60a.up.railway.app/health`
- **API**: `https://onpurpose-production-a60a.up.railway.app/api`

**The application will automatically redeploy with full functionality once variables are added.**
