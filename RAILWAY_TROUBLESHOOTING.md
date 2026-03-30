# 🔧 Railway Deployment Troubleshooting

## Current Status: App Not Responding
**URL**: https://onpurpose.up.railway.app
**Status**: 404 Not Found (normal during initial deployment)

## Troubleshooting Steps:

### 1. Check Railway Dashboard
- **Deployments** → Check build status
- **Logs** → Look for build/runtime errors
- **Variables** → Verify all environment variables are set

### 2. Common Issues & Solutions:

**Build Failing:**
- Check package.json scripts
- Verify Node.js version compatibility
- Check for missing dependencies

**App Not Starting:**
- Verify PORT environment variable is set
- Check server.js for correct port binding
- Look for database connection errors

**Database Issues:**
- Ensure PostgreSQL service is added
- Verify DATABASE_URL is auto-generated
- Run migrations after app starts

### 3. Database Migration Commands:
**Option 1 - Railway CLI:**
```bash
railway run npm run migrate
```

**Option 2 - Railway Dashboard:**
- Go to your service → Run Command
- Enter: `npm run migrate`

### 4. Expected Timeline:
- **Build**: 2-5 minutes
- **Start**: 1-2 minutes
- **Database**: Auto-connects
- **Total**: 5-10 minutes

### 5. Test Endpoints (once live):
```
Health: https://onpurpose.up.railway.app/health
API: https://onpurpose.up.railway.app/api
Payment: https://onpurpose.up.railway.app/api/payment/create-intent
```

## Next Steps:
1. Wait for build to complete
2. Check Railway logs for errors
3. Run database migration
4. Test endpoints
