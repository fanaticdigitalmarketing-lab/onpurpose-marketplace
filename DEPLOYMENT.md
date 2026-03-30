# 🚀 OnPurpose Deployment Guide

## 📋 Deployment Overview

Deploy your OnPurpose marketplace to production with:
- **Backend**: Railway (Node.js + PostgreSQL)
- **Frontend**: Netlify (React)

---

## 🔧 Backend Deployment (Railway)

### 1. Prepare Repository
```bash
# Copy backend files to your repository root
cp -r backend/* ./
git add .
git commit -m "Add production-ready backend"
git push origin main
```

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect Node.js app

### 3. Configure Environment Variables
In Railway dashboard → Settings → Variables, add:

**Required Variables:**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum
CORS_ORIGIN=https://your-site.netlify.app
```

**Optional Variables:**
```
RATE_LIMIT_MAX=100
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Set Up PostgreSQL
1. In Railway, click "New" → "PostgreSQL"
2. Copy the DATABASE_URL from the database service
3. Add it to your app's environment variables
4. Your app will auto-redeploy with the database connection

---

## 🌐 Frontend Deployment (Netlify)

### 1. Prepare Frontend
```bash
cd frontend
npm install
npm run build
```

### 2. Configure Environment Variables
Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

### 3. Deploy to Netlify
**Option A: Drag & Drop**
1. Run `npm run build`
2. Drag the `build` folder to [netlify.com](https://netlify.com)

**Option B: Git Integration**
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`

### 4. Update CORS
In Railway environment variables, set:
```
CORS_ORIGIN=https://your-netlify-site.netlify.app
```

---

## 🔗 Important Configuration Details

### Backend Production Features
- ✅ **CORS** configured for your Netlify domain
- ✅ **Rate limiting** to prevent abuse
- ✅ **Security headers** with Helmet.js
- ✅ **Error handling** with proper HTTP status codes
- ✅ **Environment-based logging** (disabled in production)

### Frontend Production Features
- ✅ **Environment variables** for API URL
- ✅ **Build optimization** with Create React App
- ✅ **Security headers** via Netlify
- ✅ **SPA routing** support
- ✅ **Auto-deployment** on git push

---

## 🧪 Testing Your Deployment

### 1. Backend Health Check
```bash
curl https://your-backend.railway.app/
```
Should return:
```json
{
  "message": "OnPurpose API is running!",
  "environment": "production"
}
```

### 2. Frontend Load Test
Visit your Netlify URL and verify:
- ✅ Page loads without errors
- ✅ Can register/login
- ✅ Can view experiences
- ✅ Can create experiences
- ✅ Can book experiences

### 3. Cross-Origin Test
Check browser console for CORS errors. If you see any, update the CORS_ORIGIN in Railway.

---

## 🚨 Troubleshooting

### Common Issues

**CORS Errors:**
```bash
# Update Railway environment variable
CORS_ORIGIN=https://your-exact-netlify-site.netlify.app
```

**Database Connection:**
```bash
# Verify DATABASE_URL format
postgresql://user:password@host:port/database
```

**Build Failures:**
```bash
# Check Railway logs for specific errors
# Verify all required environment variables are set
```

**Frontend API Errors:**
```bash
# Verify REACT_APP_API_URL is correct
# Check browser Network tab for failed requests
```

---

## 📱 Post-Deployment Checklist

- [ ] Backend health endpoint responding
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Can create experiences
- [ ] Can book experiences
- [ ] Email notifications working (if configured)
- [ ] No CORS errors in browser console
- [ ] Mobile responsive design working

---

## 🔄 CI/CD Pipeline

Your apps are now set up for automatic deployments:

**Railway:**
- Auto-deploys on git push to main branch
- Restarts on environment variable changes

**Netlify:**
- Auto-deploys on git push to main branch
- Optimizes and caches build assets

---

## 🎯 Next Steps

1. **Test with real users** (2-5 people)
2. **Monitor error logs** in Railway dashboard
3. **Set up analytics** (Google Analytics, etc.)
4. **Configure custom domain** (optional)
5. **Add monitoring** (Sentry, etc.)

Your OnPurpose marketplace is now **production-ready** and deployed! 🚀
