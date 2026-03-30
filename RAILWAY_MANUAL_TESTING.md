# 🧪 Manual Railway Testing Guide

## Project ID: ad3cab3f-b75d-4a44-86c8-d5dc893f615f

## Railway CLI Installation (Windows):
```powershell
# Run in PowerShell as Administrator:
iwr https://railway.com/install.ps1 -useb | iex
```

## Manual Testing Steps:

### 1. Test Application Directly
Open these URLs in browser:
```
https://onpurpose.up.railway.app/health
https://onpurpose.up.railway.app/api
https://onpurpose.up.railway.app
```

### 2. Railway Dashboard Method
1. Go to Railway Dashboard
2. Select OnPurpose project
3. **Run Command**: `npm run migrate`
4. Check **Logs** for deployment status
5. Verify **Services** are running

### 3. Database Migration Commands
```bash
# After Railway CLI is installed:
railway link -p ad3cab3f-b75d-4a44-86c8-d5dc893f615f
railway run npm run migrate
railway logs
```

### 4. Payment Testing
Once app is live, test with:
- **Card**: 4242 4242 4242 4242
- **Expiry**: 12/25
- **CVC**: 123

### 5. Webhook Testing
- Stripe Dashboard → Webhooks → Test webhook
- Check Railway logs for webhook events

## Expected Results:
- Health endpoint: `{"status": "OK"}`
- Payment processing works
- Webhooks receive events
- Database connected

Your OnPurpose marketplace should be live shortly!
