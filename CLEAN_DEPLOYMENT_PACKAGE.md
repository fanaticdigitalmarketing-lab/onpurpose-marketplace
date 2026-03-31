# OnPurpose Backend - Clean Deployment Package

## Files Included
- server.js (with all 7 registration fixes)
- package.json 
- package-lock.json
- Procfile
- railway.json
- .env.example
- config/ (security middleware)
- middleware/ (auth, validation)
- models/ (database models)
- routes/ (API routes)
- services/ (email, trust score)

## Railway Deployment Instructions

### Step 1: Create New Railway Project
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Click "Configure GitHub app"
4. Select: Create new repository
5. Repository name: `onpurpose-backend-clean`
6. Make it private
7. Click "Create & Deploy"

### Step 2: Set Environment Variables
In Railway dashboard → Variables → Add:

```
NODE_ENV=production
DATABASE_URL=postgresql://railway:password@host:port/database
JWT_SECRET=YOUR_64_CHAR_HEX_SECRET_HERE
REFRESH_TOKEN_SECRET=YOUR_64_CHAR_HEX_SECRET_HERE
BCRYPT_PEPPER=YOUR_32_CHAR_HEX_PEPPER_HERE
QR_SECRET=YOUR_32_CHAR_HEX_SECRET_HERE
RESEND_API_KEY=YOUR_RESEND_API_KEY
EMAIL_FROM=OnPurpose <noreply@onpurpose.earth>
CORS_ORIGINS=https://onpurpose.earth,https://www.onpurpose.earth
FRONTEND_URL=https://onpurpose.earth
PLATFORM_FEE_PERCENT=15
RATE_LIMIT_MAX=100
```

### Step 3: Generate Secrets
Run this command to generate secrets:
```bash
npm run generate:secrets
```

### Step 4: Deploy
1. Railway will auto-deploy when you push
2. Monitor deployment logs
3. Test health endpoint: `https://your-app-url.railway.app/api/health`

### Step 5: Test Registration
Test the registration endpoint:
```bash
curl -X POST https://your-app-url.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpassword123","role":"customer"}'
```

### Step 6: Update Frontend
Update frontend API URL in `onpurpose-web/src/App.js`:
```javascript
const API_URL = 'https://your-app-url.railway.app/api';
```

## Features Included
✅ All 7 registration fixes implemented
✅ Enhanced error logging
✅ Request logging middleware  
✅ Database health checks
✅ Improved error responses
✅ CORS properly configured
✅ Rate limiting
✅ Security headers
✅ JWT authentication
✅ Email notifications
✅ Database models
✅ API routes

## Support
Once deployed, your OnPurpose registration will work perfectly with all the improvements!
