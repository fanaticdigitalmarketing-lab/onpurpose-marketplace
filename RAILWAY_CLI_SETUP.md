# 🚂 Railway CLI Setup for OnPurpose

## Project Link Command:
```bash
railway link -p 5d985c43-0c94-4349-98dd-ddc42b9481fc
```

## Railway CLI Installation Options:

### Option 1: Windows Package Manager
```powershell
winget install Railway.CLI
```

### Option 2: Direct Download
1. Visit: https://github.com/railwayapp/cli/releases
2. Download `railway-windows-amd64.exe`
3. Rename to `railway.exe`
4. Add to PATH or place in project directory

### Option 3: NPM (if Node.js installed)
```bash
npm install -g @railway/cli
```

## After Installation:

### 1. Link to Project
```bash
railway link -p 5d985c43-0c94-4349-98dd-ddc42b9481fc
```

### 2. Login to Railway
```bash
railway login
```

### 3. Deploy Application
```bash
railway up
```

### 4. View Logs
```bash
railway logs
```

### 5. Set Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set DATABASE_URL="${{ Postgres-jMk7.DATABASE_URL }}"
```

## Project Details:
- **Project ID**: `5d985c43-0c94-4349-98dd-ddc42b9481fc`
- **Domain**: `https://onpurpose.up.railway.app`
- **Database Service**: `Postgres-jMk7`

## Quick Commands:
```bash
# Check status
railway status

# Open dashboard
railway open

# Run locally with Railway variables
railway run npm start

# Push and deploy
railway up
```

Your OnPurpose marketplace can be managed via Railway CLI once installed and linked to project `5d985c43-0c94-4349-98dd-ddc42b9481fc`.
