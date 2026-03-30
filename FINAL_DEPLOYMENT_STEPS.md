# 🚀 Final OnPurpose Deployment Steps

## Step 1: Monitor Railway Build
**Railway Dashboard → Deployments:**
- Wait for green checkmark (build complete)
- Check logs for: "Server listening on port 3000"

## Step 2: Run Database Migration
**After app starts successfully:**
```bash
# Railway Dashboard → OnPurpose service → Run Command:
npm run migrate
```

## Step 3: Test Endpoints
**Once migration completes:**
```
Health Check: https://onpurpose.up.railway.app/health
API Info: https://onpurpose.up.railway.app/api
```

## Step 4: Payment Testing
**Test Card Details:**
- **Number**: 4242 4242 4242 4242
- **Expiry**: 12/25 (any future date)
- **CVC**: 123 (any 3 digits)

## Step 5: Webhook Verification
**Stripe Dashboard:**
- Webhooks → Test webhook delivery
- Check Railway logs for webhook events

## Expected Results:
✅ Health returns: `{"status": "OK"}`
✅ Payment processes successfully
✅ Webhooks receive events
✅ Email notifications work

Your enterprise-ready marketplace will be live once these steps complete!
