# Railway Deployment Instructions

## Current Status
❌ Railway backend at https://ydmxe6sf.up.railway.app is NOT deployed
❌ Returns "Application not found" error

## Required Actions

### Option 1: Deploy via Railway Dashboard
1. Go to https://railway.app
2. Login to your account
3. Click "New Project" → "Deploy from GitHub"
4. Select: fanaticdigitalmarketing-lab/onpurpose-marketplace
5. Choose branch: main (or create a new branch without secrets)
6. Set environment variables:
   - NODE_ENV=production
   - DATABASE_URL=postgresql://railway:password@host:port/database
   - JWT_SECRET=64_char_hex_string
   - REFRESH_TOKEN_SECRET=64_char_hex_string
   - BCRYPT_PEPPER=32_char_hex_string
   - RESEND_API_KEY=your_resend_key
   - EMAIL_FROM=OnPurpose <noreply@onpurpose.earth>

### Option 2: Remove Secrets and Push
1. Remove files containing API keys from commit
2. Push clean version to trigger auto-deploy

### Option 3: Manual Railway CLI Deploy
1. Install Railway CLI: npm install -g @railway/cli
2. Login: railway login
3. Deploy: railway deploy

## Frontend Status
✅ Frontend deployed at https://onpurpose.earth
✅ All 7 registration fixes implemented
✅ Ready to connect once backend is deployed

## Test Result
```json
{
  "status": "error",
  "code": 404,
  "message": "Application not found"
}
```

## Next Steps
Deploy Railway backend to enable registration functionality.
