# 🚀 Railway Environment Variables

## ✅ Generated Secrets
Copy and paste these into Railway dashboard → Variables:

```bash
NODE_ENV=production
JWT_SECRET=a46196e9fd815e3cc0c346669bd7bf0b55d2841173b1dec950448016fef30e66
REFRESH_TOKEN_SECRET=83c60cd4b9b689aaa500a42713bf3a5327eb68e06f176fb785ac021c346e227e
BCRYPT_PEPPER=8fb9d1b4c3996fee294052a25f932289
QR_SECRET=29a6ae970c8535101279ace6089f53ab
EMAIL_FROM=OnPurpose <noreply@onpurpose.earth>
CORS_ORIGINS=https://onpurpose.earth,https://www.onpurpose.earth
FRONTEND_URL=https://onpurpose.earth
PLATFORM_FEE_PERCENT=15
RATE_LIMIT_MAX=100
```

## 📋 Additional Variables Needed
You'll need to add these yourself:

```bash
DATABASE_URL=postgresql://railway:password@host:port/database
RESEND_API_KEY=your_resend_api_key_here
```

### Database URL
Railway will automatically provide this when you add a PostgreSQL service.

### RESEND_API_KEY
Get this from: https://resend.com/api-keys

## 🚀 Deployment Steps

### 1. Go to Railway
https://railway.app → "New Project" → "Deploy from GitHub"

### 2. Select Repository
Choose: `onpurpose-backend-clean`

### 3. Add PostgreSQL Service
- Click "+ New" → "Add Service" → "PostgreSQL"
- Railway will provide the DATABASE_URL

### 4. Add Environment Variables
Copy all the variables above into Railway dashboard → Variables

### 5. Deploy
Click "Deploy" and wait for deployment to complete

### 6. Test
- Health: `https://your-app-url.railway.app/api/health`
- Registration: Test at https://onpurpose.earth

## 🎉 Success!
Once deployed, your OnPurpose registration will work perfectly with all 7 fixes!
