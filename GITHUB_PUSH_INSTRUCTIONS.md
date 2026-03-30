# 📤 GitHub Push Instructions - OnPurpose

## Current Status:
✅ **GitHub Repository**: `wisserd/onpurpose` exists and accessible
✅ **Database Fixes**: Applied to `config/database.js`
✅ **Railway Variables**: Updated with proper syntax
❌ **Code Push**: Database fixes not yet pushed to GitHub

## Manual Push Required:

### Option 1: GitHub Desktop
1. Open GitHub Desktop
2. Select OnPurpose repository
3. Review changes to `config/database.js`
4. Commit message: "Fix PostgreSQL connection for Railway deployment"
5. Push to origin/main

### Option 2: GitHub Web Interface
1. Go to https://github.com/wisserd/onpurpose
2. Navigate to `config/database.js`
3. Click "Edit this file" (pencil icon)
4. Replace content with updated database configuration
5. Commit directly to main branch

### Option 3: Command Line (if git available)
```bash
git add config/database.js
git commit -m "Fix PostgreSQL connection configuration for Railway"
git push origin main
```

## Files to Push:
- `config/database.js` (enhanced connection pooling)
- All new documentation files (optional)

## After Push:
1. Railway will auto-deploy from GitHub
2. Monitor Railway deployment logs
3. Test health endpoint: `https://onpurpose.up.railway.app/health`

The database connection fix needs to be pushed to GitHub to trigger Railway auto-deployment.
