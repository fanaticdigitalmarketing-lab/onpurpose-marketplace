# 🚨 EMERGENCY RESTORE INSTRUCTIONS 🚨

## If the website breaks or files get corrupted:

### 1. QUICK RESTORE (Windows)
```powershell
# Run this PowerShell command to restore all protected files
.\protection.ps1
```

### 2. QUICK RESTORE (Linux/Mac)
```bash
# Run this shell script to restore all protected files
./protection.sh
```

### 3. MANUAL RESTORE
Copy files from `/backups/` back to original locations:
- `backups/config/railway.toml.backup` → `railway.toml`
- `backups/config/netlify.toml.backup` → `netlify.toml`
- `backups/config/_redirects.backup` → `_redirects`
- `backups/code/index.html.backup` → `index.html`
- `backups/code/dashboard.html.backup` → `frontend/dashboard.html`

### 4. VERIFY DEPLOYMENT
- Check Netlify: https://onpurpose.earth
- Check Railway: https://onpurpose-backend-clean-production.up.railway.app/health
- Test API calls: https://onpurpose.earth/api/stats

### 5. iOS COMPATIBILITY TEST
- Test on iPhone/Safari
- Verify touch interactions work
- Check form submissions
- Confirm scrolling behavior

## ⚠️ IMPORTANT:
- Always test changes in development first
- Never modify locked configuration files
- Keep backups up to date
- Monitor protection logs in `backups/protection.log`

## 🆘 EMERGENCY CONTACTS:
- Netlify Support: For frontend issues
- Railway Support: For backend issues  
- Check PROTECTION_MANIFEST.md for full documentation
