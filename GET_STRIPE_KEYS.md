# 🔑 How to Get Your Stripe API Keys Safely

## Step 1: Sign in to Your Own Stripe Account
1. Go to: https://dashboard.stripe.com/login
2. Sign in with YOUR OWN Stripe account
3. If you don't have one, create a new account at: https://dashboard.stripe.com/register

## Step 2: Get API Keys
1. In Stripe Dashboard → **Developers** → **API Keys**
2. Copy these keys:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)

## Step 3: Create Webhook
1. Go to: **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://onpurpose.up.railway.app/api/payment/webhook`
4. **Events to send**: 
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Webhook signing secret** (starts with `whsec_...`)

## Step 4: Update Railway Variables
Replace these in Railway Variables tab:
```
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

## Security Note
- Never share your Stripe secret keys
- Use test keys during development
- Only use live keys in production
- Keep credentials secure and private
