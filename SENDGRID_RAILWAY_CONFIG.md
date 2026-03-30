# 📧 SendGrid Configuration for Railway Deployment

## Issue: Domain Authentication Errors
You're seeing CNAME errors because SendGrid domain authentication requires a custom domain, but you're using Railway's subdomain (`onpurpose.up.railway.app`).

## Solution: Skip Domain Authentication for Now

### Option 1: Use SendGrid Without Domain Authentication (Recommended)
1. **Skip domain verification** in SendGrid
2. **Get API key only**: Settings → API Keys → Create API Key
3. **Use default SendGrid domain** for sending emails
4. **Email will send from**: `noreply@sendgrid.net` (or similar)

### Option 2: Use Railway's Built-in Email (Alternative)
Railway doesn't provide email services, so stick with SendGrid.

## SendGrid Setup for Railway:

### 1. Get API Key Only
- Go to SendGrid → Settings → API Keys
- Create API Key: "OnPurpose Railway"
- Permissions: "Mail Send"
- Copy API key (starts with `SG.`)

### 2. Skip Domain Authentication
- Don't worry about CNAME records for now
- Domain authentication is for production with custom domains

### 3. Update Environment Variables
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your_api_key_here
EMAIL_FROM=noreply@sendgrid.net
```

## For Future Custom Domain:
When you get a custom domain (like `onpurpose.com`):
1. Point domain to Railway
2. Set up SendGrid domain authentication
3. Update email settings to use custom domain

## Current Priority:
✅ Get SendGrid API key
✅ Deploy to Railway
✅ Test basic functionality
🔄 Custom domain setup (later)

Your marketplace will work perfectly with SendGrid's default domain for now!
