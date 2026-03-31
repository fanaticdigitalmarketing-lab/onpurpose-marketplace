# 🚀 RENDER DEPLOYMENT - RELIABLE & FREE

## Step 1: Go to Render
1. Go to https://render.com
2. Click "Sign Up" (free)
3. Sign up with GitHub (easiest)

## Step 2: Create New Web Service
1. Click "New" → "Web Service"
2. Click "Connect" GitHub account
3. Authorize Render to access your repositories
4. Select: `onpurpose-backend-clean`
5. Click "Connect"

## Step 3: Configure Service
Set these values:
- **Name**: `onpurpose-backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (default)

## Step 4: Environment Variables
Add these in the "Environment" section:
```bash
NODE_ENV=production
JWT_SECRET=a46196e9fd815e3cc0c346669bd7bf0b55d2841173b1dec950448016fef30e66
REFRESH_TOKEN_SECRET=83c60cd4b9b689aaa500a42713bf3a5327eb68e06f176fb785ac021c346e227e
BCRYPT_PEPPER=8fb9d1b4c3996fee294052a25f932289
QR_SECRET=29a6ae970c8535101279ace6089f53ab
EMAIL_FROM=OnPurpose <noreply@onpurpose.earth>
CORS_ORIGINS=https://onpurpose.earth
FRONTEND_URL=https://onpurpose.earth
PLATFORM_FEE_PERCENT=15
RATE_LIMIT_MAX=100
```

## Step 5: Add Database
1. Click "New" → "PostgreSQL"
2. Name: `onpurpose-db`
3. Click "Create"
4. Copy the DATABASE_URL from database settings
5. Add it to your web service environment variables

## Step 6: Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Your URL will be: `https://onpurpose-backend.onrender.com`

## Step 7: Test
- Health: `https://onpurpose-backend.onrender.com/api/health`
- Registration: Test at https://onpurpose.earth

## Step 8: Update Frontend
Update `onpurpose-web/src/App.js`:
```javascript
const API_URL = 'https://onpurpose-backend.onrender.com/api';
```

## 🎯 Why Render?
✅ Free tier available
✅ Reliable hosting
✅ Automatic HTTPS
✅ GitHub integration
✅ PostgreSQL database included
✅ Custom domain support
✅ Easy environment variables

**This will give you a permanent, reliable backend!** 🚀
