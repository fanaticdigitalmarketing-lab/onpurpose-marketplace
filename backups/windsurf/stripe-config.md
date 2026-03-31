# Stripe Connect Configuration - BACKUP
# Created: March 31, 2026

## STRIPE CONNECT SETUP

### Provider Payment Flow
1. Provider clicks "Connect my bank account"
2. Creates Stripe Express account
3. Completes onboarding flow
4. Receives 85% of booking payments
5. OnPurpose keeps 15% platform fee

### API Endpoints

#### Create Stripe Connect Account
```
POST /api/payments/connect/create
```
- Requires: Provider authentication
- Creates: Stripe Express account
- Returns: Onboarding URL

#### Check Stripe Connect Status  
```
GET /api/payments/connect/status
```
- Requires: Provider authentication
- Returns: Account setup status
- States: not_connected, connected, ready

### Frontend Integration

#### Dashboard Payment Setup
- File: `frontend/dashboard.html`
- Navigation: "Payment Setup" (providers only)
- States: Not connected, Connected, Not ready
- Functions: `setupStripe()`, `loadStripeStatus()`

#### Return URL Handling
- Success: `?stripe=success` → Shows success message
- Refresh: `?stripe=refresh` → Shows completion prompt

### CONFIGURATION DETAILS

#### Stripe Account Type
- Type: Express
- Capabilities: card_payments, transfers
- Payouts: Automatic to provider bank account

#### Onboarding Flow
1. Account creation via API
2. Redirect to Stripe onboarding
3. Provider completes identity verification
4. Bank account connection
5. Account ready for payouts

#### Fee Structure
- Customer pays: Full service price
- Provider receives: 85% (after 15% platform fee)
- OnPurpose receives: 15% platform fee

### TESTING

#### Test Environment
- Use test Stripe keys
- Use test bank accounts (provided by Stripe)
- No real money transferred

#### Production Setup
- Upgrade to live Stripe keys
- Real bank accounts required
- Actual money transfers

### SECURITY

#### Webhook Handling
- Endpoint: `/api/webhooks/stripe`
- Events: Payment completed, account updated
- Security: Stripe signature verification

#### Data Protection
- Stripe handles sensitive bank data
- Only account IDs stored in database
- PCI compliance handled by Stripe

## VERIFICATION CHECKLIST

### Provider Setup Test:
- [ ] Register as provider
- [ ] Go to Payment Setup in dashboard
- [ ] Click "Connect my bank account"
- [ ] Complete Stripe onboarding
- [ ] Verify account shows as "connected"
- [ ] Test booking payment flow

### Admin Verification:
- [ ] Check Stripe dashboard for connected accounts
- [ ] Verify fee calculations (85/15 split)
- [ ] Test payout timing
- [ ] Review transaction history

## TROUBLESHOOTING

### Common Issues:
1. **Account not ready** - Provider needs to complete onboarding
2. **Payouts delayed** - Bank account verification pending
3. **Test mode** - Ensure using test keys for development

### Support:
- Stripe documentation: https://stripe.com/docs
- Connect guide: https://stripe.com/docs/connect
- Test accounts: https://stripe.com/docs/testing

## BACKUP STATUS

✅ Configuration documented
✅ API endpoints implemented
✅ Frontend integration complete
✅ Test procedures defined
✅ Security measures in place

**DO NOT MODIFY WITHOUT TESTING**
