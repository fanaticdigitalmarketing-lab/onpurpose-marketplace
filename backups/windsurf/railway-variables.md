# Railway Environment Variables - BACKUP
# Project: hopeful-tranquility
# Service: onpurpose-backend-clean
# Created: March 31, 2026

## REQUIRED VARIABLES

### RESEND_API_KEY
```
[SET IN RAILWAY ENVIRONMENT VARIABLES]
```
- Purpose: Email sending via Resend
- Source: https://resend.com/
- Status: ACTIVE

### STRIPE_SECRET_KEY
```
[SET IN RAILWAY ENVIRONMENT VARIABLES]
```
- Purpose: Stripe payment processing
- Source: https://dashboard.stripe.com/
- Status: TEST MODE (upgrade to live later)

### EMAIL_FROM
```
OnPurpose <noreply@onpurpose.earth>
```
- Purpose: Default email sender
- Status: CONFIGURED

### FRONTEND_URL
```
https://onpurpose.earth
```
- Purpose: Frontend URL for email links
- Status: CONFIGURED

## SETUP INSTRUCTIONS

1. Go to Railway project: hopeful-tranquility
2. Select service: onpurpose-backend-clean
3. Click "Variables" tab
4. Add each variable above
5. Railway will auto-redeploy

## VERIFICATION

After adding variables, run:
```bash
node test-registration.js
```

Expected: All 10 tests pass

## NOTES

- Keep RESEND_API_KEY secure
- Test Stripe key first, upgrade to live later
- Domain verification needed for onpurpose.earth emails
- Variables are case-sensitive
