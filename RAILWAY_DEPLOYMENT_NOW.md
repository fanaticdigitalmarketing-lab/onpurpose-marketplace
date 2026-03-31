# 🚀 Railway Deployment Instructions

## ✅ GitHub Repository Ready!
Your clean backend is now at: https://github.com/fanaticdigitalmarketing-lab/onpurpose-backend-clean

## 📋 Railway Deployment Steps

### 1. Deploy to Railway
1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Connect your GitHub account (if not already connected)
4. Select: **`onpurpose-backend-clean`**
5. Click **"Deploy"**

### 2. Set Environment Variables
In Railway dashboard → **Variables**, add these:

```bash
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

### 3. Generate Secrets
Run this command to generate secrets:
```bash
npm run generate:secrets
```

### 4. Test Deployment
Once deployed, test these endpoints:
- Health: `https://your-app-url.railway.app/api/health`
- Registration: `https://your-app-url.railway.app/api/auth/register`

### 5. Update Frontend
Update frontend API URL in `onpurpose-web/src/App.js`:
```javascript
const API_URL = 'https://your-new-railway-url.railway.app/api';
```

## 🎯 What's Included
✅ All 7 registration fixes implemented
✅ Enhanced error logging and debugging
✅ Database health checks
✅ Improved error responses
✅ CORS properly configured
✅ Security middleware
✅ JWT authentication
✅ Email notifications

## 🚀 Ready to Deploy!
Your clean backend is ready for immediate Railway deployment!

**Once deployed, your OnPurpose registration will work perfectly!** 🎉
