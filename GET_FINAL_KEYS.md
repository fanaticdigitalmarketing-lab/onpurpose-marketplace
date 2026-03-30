# 🔑 Get Final API Keys - Step by Step

## Tab 1: Stripe Webhook (https://dashboard.stripe.com/webhooks)

### Create Webhook:
1. **Click**: "Add endpoint"
2. **Endpoint URL**: `https://onpurpose.up.railway.app/api/payment/webhook`
3. **Select Events**:
   ```
   ✓ payment_intent.succeeded
   ✓ payment_intent.payment_failed
   ✓ checkout.session.completed
   ✓ invoice.payment_failed
   ✓ customer.subscription.deleted
   ```
4. **Click**: "Add endpoint"
5. **Copy**: Webhook signing secret (starts with `whsec_...`)

## Tab 2: SendGrid (https://sendgrid.com)

### Get API Key:
1. **Sign up** or **Sign in**
2. **Go to**: Settings → API Keys
3. **Click**: "Create API Key"
4. **Name**: "OnPurpose Marketplace"
5. **Permissions**: "Full Access" or "Mail Send"
6. **Copy**: API Key (starts with `SG.`)

## Final Environment Variables:

```
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
EMAIL_PASS=SG.your_sendgrid_api_key_here
```

## Ready to Deploy!

Once you have both keys:
1. Create GitHub repository: "OnPurpose"
2. Push code to GitHub
3. Deploy on Railway
4. Add environment variables
5. Test at: https://onpurpose.up.railway.app
