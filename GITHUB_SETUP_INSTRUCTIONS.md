# 🚀 GitHub Repository Creation Instructions

## Step 1: Create GitHub Repository
1. Go to https://github.com
2. Click **"New repository"** (green button, top right)
3. Repository name: **`onpurpose-backend-clean`**
4. Description: **`OnPurpose Backend - Clean deployment with registration fixes`**
5. Make it **Private** 🔒
6. **DO NOT** initialize with README (we already have files)
7. Click **"Create repository"**

## Step 2: Push Files to GitHub
Once repository is created, GitHub will show you commands. Use these:

```bash
cd onpurpose-backend-clean
git remote add origin https://github.com/YOUR_USERNAME/onpurpose-backend-clean.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Railway
1. Go to https://railway.app
2. Click **"New Project"**
3. Click **"Deploy from GitHub"**
4. Connect your GitHub account
5. Select: **`onpurpose-backend-clean`**
6. Click **"Deploy"**

## Step 4: Set Environment Variables
In Railway dashboard → **Variables**, add:

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

## Step 5: Generate Secrets
Run this to generate secrets:
```bash
npm run generate:secrets
```

## 🎯 I'll Help You!
Once you create the GitHub repository, tell me and I'll:
1. Push the files for you
2. Help set up Railway deployment
3. Configure environment variables
4. Test the deployment

**Just create the GitHub repo and I'll handle the rest!** 🚀
