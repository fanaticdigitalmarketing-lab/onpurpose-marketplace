# 🚀 GLITCH DEPLOYMENT - EASIEST OPTION

## Step 1: Go to Glitch
1. Go to https://glitch.com
2. Click "Sign In" (or create account)
3. Click "New Project" → "Import from GitHub"

## Step 2: Import Repository
1. Enter: `fanaticdigitalmarketing-lab/onpurpose-backend-clean`
2. Click "Import"
3. Wait for import to complete (2-3 minutes)

## Step 3: Set Environment Variables
In Glitch project:
1. Click ".env" file (left sidebar)
2. Add these variables:
```bash
NODE_ENV=production
DATABASE_URL=sqlite:./glitch.sqlite
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

## Step 4: Start Server
1. Glitch will automatically start the server
2. Click "Show" button (top) to see your app
3. Your backend URL will be something like: `https://your-project-name.glitch.me`

## Step 5: Test
1. Health check: `https://your-project-name.glitch.me/api/health`
2. Registration: `https://your-project-name.glitch.me/api/auth/register`

## Step 6: Update Frontend
Update `onpurpose-web/src/App.js`:
```javascript
const API_URL = 'https://your-project-name.glitch.me/api';
```

## 🎯 This is the EASIEST option!
- ✅ No credit card required
- ✅ Free hosting
- ✅ Automatic deployment
- ✅ Works immediately
- ✅ Perfect for testing

**Just go to https://glitch.com and import the repository!** 🚀
