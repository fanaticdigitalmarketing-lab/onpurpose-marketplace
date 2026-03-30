# 🎯 OnPurpose Deployment Completion Guide

## Project ID: ad3cab3f-b75d-4a44-86c8-d5dc893f615f

## Manual Steps to Complete:

### 1. Install Railway CLI (PowerShell as Administrator)
```powershell
iwr https://railway.com/install.ps1 -useb | iex
```

### 2. Link to Your Project
```bash
railway link -p ad3cab3f-b75d-4a44-86c8-d5dc893f615f
```

### 3. Run Database Migration
```bash
railway run npm run migrate
```

### 4. Test Application
```bash
# Check status
railway status

# View logs
railway logs

# Test health endpoint
curl https://onpurpose.up.railway.app/health
```

## Alternative: Railway Dashboard Method
1. Go to https://railway.app
2. Select OnPurpose project
3. **Run Command** → Enter: `npm run migrate`
4. Check **Logs** for deployment status
5. Test URLs in browser:
   - https://onpurpose.up.railway.app/health
   - https://onpurpose.up.railway.app/api

## Payment Testing
Once app responds:
- **Test Card**: 4242 4242 4242 4242
- **Expiry**: 12/25
- **CVC**: 123

## Success Indicators:
- Health endpoint returns: `{"status": "OK"}`
- API endpoint returns app information
- Payment processing works with test card
- Stripe webhooks receive events

Your OnPurpose marketplace is enterprise-ready!
