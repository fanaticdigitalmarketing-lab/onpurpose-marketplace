# 🧪 OnPurpose Production Testing Guide

## Current Status:
- **Domain**: https://onpurpose.up.railway.app (deployment in progress)
- **Health Check**: Not yet responding (expected during initial deployment)

## Testing Checklist:

### 1. Domain Generation ⏳
- **Railway Dashboard** → **Settings** → **Domains**
- **Generate Domain**: Enter `onpurpose`
- **Expected Result**: `https://onpurpose.up.railway.app`

### 2. Build Monitoring ⏳
- **Railway Dashboard** → **Deployments** tab
- **Watch for**:
  - Build phase: `npm ci && npm run build`
  - Pre-deploy: `npm run migrate`
  - Start phase: `npm start`
  - Health check: `/health` endpoint

### 3. Endpoint Testing 🔄
Once deployment completes:

**Health Check:**
```
GET https://onpurpose.up.railway.app/health
Expected: {"status":"healthy","timestamp":"..."}
```

**API Info:**
```
GET https://onpurpose.up.railway.app/api
Expected: {"name":"OnPurpose API","version":"1.0.0"}
```

### 4. Payment Testing 💳
**Create Payment Intent:**
```
POST https://onpurpose.up.railway.app/api/payments/create-payment-intent
Content-Type: application/json

{
  "amount": 5000,
  "currency": "usd"
}
```

**Test Card:** `4242 4242 4242 4242`
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Expected**: Payment intent created with client_secret

### 5. Webhook Verification 🔗
**Stripe Dashboard:**
- Go to **Developers** → **Webhooks**
- Check webhook: `https://onpurpose.up.railway.app/api/webhooks/stripe`
- **Test Events**: Send test payment_intent.succeeded
- **Expected**: 200 OK response

### 6. Database Connection 🗄️
**Connection String:** `postgresql://postgres:password@metro.proxy.rlwy.net:10216/railway`
- Migration should run automatically on deployment
- Check Railway logs for "Database migration completed successfully"

### 7. Email Testing 📧
**SendGrid Integration:**
- SMTP: `smtp.sendgrid.net:587`
- API Key configured
- Test email notifications on user registration

## Expected Timeline:
- **Build**: 2-3 minutes
- **Migration**: 30 seconds
- **Health Check**: Available immediately after start
- **Full Functionality**: 3-5 minutes total

## Troubleshooting:
- **404 Errors**: Deployment still in progress
- **500 Errors**: Check environment variables
- **Database Errors**: Verify connection string
- **Payment Errors**: Check Stripe keys

## Success Criteria:
✅ Health endpoint returns 200
✅ API info endpoint responds
✅ Payment intents create successfully
✅ Webhooks receive events
✅ Database queries work
✅ Email notifications send

Your OnPurpose marketplace will be production-ready once all tests pass!
