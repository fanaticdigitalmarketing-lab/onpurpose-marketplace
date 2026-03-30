# 🛍️ Stripe Product Integration for OnPurpose

## Product ID Added
**Product ID**: `prod_Sw2EKUwHb6Bzqq`

## Integration Points

### 1. Payment Intent Metadata
Your payment intents now include the product ID in metadata:
```javascript
metadata: {
  bookingId: bookingId?.toString() || '',
  productId: process.env.STRIPE_PRODUCT_ID || '',
}
```

### 2. Environment Variable
```
STRIPE_PRODUCT_ID=prod_Sw2EKUwHb6Bzqq
```

## Use Cases

### Product Tracking
- Link payments to specific products
- Analytics and reporting
- Inventory management
- Revenue attribution

### Webhook Enhancement
Product ID will be available in webhook events for:
- Payment tracking by product
- Automated fulfillment
- Customer communication
- Business intelligence

### Future Features
- Product-specific pricing
- Subscription management
- Inventory updates
- Customer purchase history

## Railway Configuration
Add to Railway Variables:
```
STRIPE_PRODUCT_ID=prod_Sw2EKUwHb6Bzqq
```

Your OnPurpose marketplace now tracks product associations with all payments.
