# OnPurpose Web App

A modern React web application for the OnPurpose human services marketplace.

## 🚀 Quick Deploy to Netlify

### Option 1: Drag & Drop (Fastest)
1. Go to [netlify.com](https://netlify.com)
2. Sign in or create an account
3. **Drag the `build` folder** directly onto the deploy area
4. Your site will be live instantly at a random Netlify URL!

### Option 2: GitHub Connected (Recommended for updates)
1. Push this code to GitHub
2. In Netlify, click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Use these settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
5. Deploy!

## ✅ Features

- 🌐 **Platform Detection** - Automatically detects mobile vs web
- 🔐 **Working Authentication** - Login & registration with Railway backend
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🎨 **Modern UI** - Beautiful, professional design
- 🔗 **API Integration** - Connected to Railway backend
- 📊 **Dashboard** - Services, bookings, and provider tools

## 🔧 Configuration

### Backend API
The app connects to: `https://ydmxe6sf.up.railway.app/api`

### Netlify Redirects
API calls are automatically redirected to the Railway backend:
```
/api/* → https://ydmxe6sf.up.railway.app/api/*
```

## 📱 Testing

1. **Registration Test:**
   - Visit your deployed site
   - Click "Get Started" → "Create Account"
   - Fill out the form and submit
   - Check the debug panel for API calls

2. **Mobile Test:**
   - Open on mobile device
   - Verify mobile badge appears
   - Test responsive design

## 🌐 Live Deployment

Once deployed, your app will be available at:
- Netlify provides a random URL (e.g., `amazing-tesla-123456.netlify.app`)
- You can add a custom domain later

## 🔗 Integration Notes

- **Frontend:** This React app (Netlify)
- **Backend:** Railway API (`https://ydmxe6sf.up.railway.app`)
- **Database:** PostgreSQL/SQLite on Railway
- **Email:** Resend integration for notifications

## 🚀 Production Features

- ✅ Optimized build (minified JS/CSS)
- ✅ Security headers configured
- ✅ API proxy to Railway backend
- ✅ Mobile-first responsive design
- ✅ Error handling and user feedback
- ✅ Real-time debugging information

## 📞 Support

For any issues:
- **Email:** onpurposeearth@gmail.com
- **GitHub:** Check repository issues
- **Railway:** Check backend logs if API issues
