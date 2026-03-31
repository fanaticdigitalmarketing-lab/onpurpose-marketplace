# 🚀 Quick Local Test Setup

## Option 1: Local Server Test (Immediate)

Let me start the backend locally to test registration:

### Step 1: Set Environment Variables
Create `.env` file with these values:

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=sqlite:./test.sqlite
JWT_SECRET=a46196e9fd815e3cc0c346669bd7bf0b55d2841173b1dec950448016fef30e66
REFRESH_TOKEN_SECRET=83c60cd4b9b689aaa500a42713bf3a5327eb68e06f176fb785ac021c346e227e
BCRYPT_PEPPER=8fb9d1b4c3996fee294052a25f932289
QR_SECRET=29a6ae970c8535101279ace6089f53ab
EMAIL_FROM=OnPurpose <noreply@onpurpose.earth>
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://onpurpose.earth
FRONTEND_URL=https://onpurpose.earth
PLATFORM_FEE_PERCENT=15
RATE_LIMIT_MAX=100
```

### Step 2: Start Server
```bash
npm start
```

### Step 3: Test Registration
Server will run on: http://localhost:3001
Test endpoint: http://localhost:3001/api/auth/register

### Step 4: Update Frontend
Temporarily update frontend to use local backend:
```javascript
const API_URL = 'http://localhost:3001/api';
```

## Option 2: Glitch Deployment (5 minutes)

1. Go to https://glitch.com
2. "New Project" → "Import from GitHub"
3. Enter: `fanaticdigitalmarketing-lab/onpurpose-backend-clean`
4. Wait for import
5. Add environment variables
6. Get URL and update frontend

## Option 3: Render Deployment (10 minutes)

1. Go to https://render.com
2. Sign up for free
3. "New" → "Web Service"
4. Connect GitHub
5. Select: `onpurpose-backend-clean`
6. Deploy!

## 🎯 Which option do you prefer?
- **Local test** (immediate)
- **Glitch** (5 minutes)
- **Render** (10 minutes)

I'll set up whichever you choose!
