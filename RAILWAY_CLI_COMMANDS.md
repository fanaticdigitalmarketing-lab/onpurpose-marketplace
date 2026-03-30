# 🚂 Railway CLI Commands for OnPurpose

## Project ID: ad3cab3f-b75d-4a44-86c8-d5dc893f615f

## Manual Commands to Run:

### 1. Install Railway CLI (Windows PowerShell)
```powershell
iwr https://railway.com/install.ps1 -useb | iex
```

### 2. Link to Project
```bash
railway link -p ad3cab3f-b75d-4a44-86c8-d5dc893f615f
```

### 3. Run Database Migration
```bash
railway run npm run migrate
```

### 4. Check Service Status
```bash
railway status
```

### 5. View Logs
```bash
railway logs
```

### 6. Test Commands
```bash
# Test health endpoint
railway run curl https://onpurpose.up.railway.app/health

# Test API endpoint  
railway run curl https://onpurpose.up.railway.app/api
```

## Alternative: Railway Dashboard
If CLI doesn't work:
1. Go to Railway Dashboard
2. Select OnPurpose service
3. Run Command → `npm run migrate`
4. Check logs for deployment status

## Expected Results:
- Migration creates database tables
- Health endpoint returns `{"status": "OK"}`
- App ready for payment testing
