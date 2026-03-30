# 🔗 Final Stripe Webhook Setup for OnPurpose

## Your Production Setup (No ngrok needed!)

Since you're deploying to Railway, you skip local development steps:

### ✅ Already Done:
1. **Server Ready**: Your Node.js/Express app with webhook endpoint
2. **Stripe Secret Key**: Configured in environment variables
3. **Webhook Handler**: Complete implementation in `routes/payment.js`

### 🔹 Next Steps:

## 5. Register Webhook in Stripe Dashboard

**In Firefox (https://dashboard.stripe.com/webhooks):**

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
5. **Copy**: Webhook signing secret (`whsec_123...`)

## 6. Add Webhook Secret to Railway

In Railway Variables tab:
```
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

## 7. Test Your Webhook

After deployment, test with Stripe CLI:
```bash
stripe trigger payment_intent.succeeded
stripe trigger checkout.session.completed
```

Or use Stripe Dashboard → Webhooks → Send test webhook

## Your Webhook Endpoint Features:

✅ **Signature Verification**: Prevents fake requests
✅ **Raw Body Parsing**: Required for Stripe webhooks  
✅ **Multiple Events**: Handles all important payment events
✅ **Error Handling**: Proper logging and responses
✅ **Automatic Tax**: Enabled in payment intents

## Production URL:
`https://onpurpose.up.railway.app/api/payment/webhook`

Your webhook is enterprise-ready for production use!
