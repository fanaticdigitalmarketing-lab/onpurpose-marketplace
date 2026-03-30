# ✅ Railway Deployment Checklist

## Current Steps in Progress:
🔄 **Deploy from GitHub repo** (`stylerforbes/OnPurpose`)
🔄 **Add PostgreSQL service**
🔄 **Set environment variables** (copy/paste ready)

## After Environment Variables Are Set:

### 1. Generate Custom Domain
- **Settings** → **Domains** → **Generate Domain**
- **Subdomain**: `onpurpose`
- **Result**: `https://onpurpose.up.railway.app`

### 2. Wait for Build to Complete
- Monitor deployment logs
- Ensure no build errors

### 3. Run Database Migration
**Railway Console/Run Command:**
```bash
npm run migrate
```

### 4. Test Endpoints
- **Health**: `https://onpurpose.up.railway.app/health`
- **API Info**: `https://onpurpose.up.railway.app/api`

### 5. Test Payment Flow
- **Test Card**: 4242 4242 4242 4242
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## 🎯 Success Indicators:
- ✅ App responds to health check
- ✅ Stripe test payment processes
- ✅ Webhook receives events
- ✅ Database connected

Your marketplace will be production-ready!
