# 🔗 Stripe Webhook Events for OnPurpose

## Recommended Events to Enable

When creating your webhook at https://dashboard.stripe.com/webhooks, select these events:

### Core Payment Events
- `payment_intent.succeeded` → Payment completed successfully
- `payment_intent.payment_failed` → Payment failed
- `payment_intent.canceled` → Payment was canceled

### Checkout Events  
- `checkout.session.completed` → Customer completed checkout
- `checkout.session.expired` → Checkout session expired

### Subscription Events (for future features)
- `invoice.payment_succeeded` → Subscription payment succeeded
- `invoice.payment_failed` → Subscription payment failed
- `customer.subscription.created` → New subscription
- `customer.subscription.deleted` → Subscription canceled

### Dispute Events
- `charge.dispute.created` → Customer disputed a charge
- `charge.dispute.closed` → Dispute resolved

## Webhook Configuration

**Endpoint URL**: `https://onpurpose.up.railway.app/api/payment/webhook`

**Events to Select** (minimum for OnPurpose):
```
payment_intent.succeeded
payment_intent.payment_failed
checkout.session.completed
invoice.payment_failed
customer.subscription.deleted
```

## Updated Webhook Handler

Your payment webhook now handles:
- ✅ `payment_intent.succeeded` → Updates booking to completed
- ✅ `payment_intent.payment_failed` → Marks booking as failed
- ✅ `checkout.session.completed` → Handles checkout completion
- ✅ `invoice.payment_failed` → Handles subscription failures
- ✅ `customer.subscription.deleted` → Handles cancellations

## Testing Webhooks

Use Stripe CLI to test locally:
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
stripe trigger payment_intent.succeeded
```

Your webhook endpoint will log all events and handle the important ones for your marketplace.
