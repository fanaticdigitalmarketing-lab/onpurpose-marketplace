# 🧪 OnPurpose Final Testing Guide

## Test URLs (after domain generation):
```
Health Check: https://onpurpose.up.railway.app/health
API Info: https://onpurpose.up.railway.app/api
Payment Test: https://onpurpose.up.railway.app/api/payment/create-intent
Webhook: https://onpurpose.up.railway.app/api/payment/webhook
```

## Test Payment:
- **Card**: 4242 4242 4242 4242
- **Expiry**: 12/25 (any future date)
- **CVC**: 123 (any 3 digits)
- **Expected**: Payment succeeds

## Test Cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184

## Webhook Testing:
- Stripe Dashboard → Webhooks → Test webhook
- Check Railway logs for webhook events

Your marketplace is ready for enterprise use!
