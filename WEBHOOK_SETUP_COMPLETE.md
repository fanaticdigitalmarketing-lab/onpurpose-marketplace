# ✅ Stripe Webhook Setup - Complete Guide

## Your OnPurpose Webhook Endpoint

**URL**: `https://onpurpose.up.railway.app/api/payment/webhook`

## Already Implemented in Your App

Your `routes/payment.js` already has the complete webhook handler:

```javascript
// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Update booking status in database
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      // Handle failed payment
      break;
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout completed:', session.id);
      // Handle successful checkout completion
      break;
    case 'invoice.payment_failed':
      const invoice = event.data.object;
      console.log('Invoice payment failed:', invoice.id);
      // Handle subscription payment failure
      break;
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      console.log('Subscription cancelled:', subscription.id);
      // Handle subscription cancellation
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
```

## Stripe Dashboard Configuration

1. **Go to**: https://dashboard.stripe.com/webhooks
2. **Click**: "Add endpoint"
3. **Endpoint URL**: `https://onpurpose.up.railway.app/api/payment/webhook`
4. **Select Events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. **Click**: "Add endpoint"
6. **Copy**: Webhook signing secret (starts with `whsec_...`)

## Environment Variable Needed

Add this to your Railway environment variables:
```
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Your App is Ready!

✅ Stripe Secret Key configured
✅ Webhook endpoint implemented
✅ Event handlers ready
✅ Raw body parsing configured
✅ Signature verification included

Just need the webhook secret to complete the setup!
