# 🚂 Railway Configuration Files for OnPurpose

## Created Railway Config Files:

### 1. railway.toml
```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
PORT = "3000"

[services.web]
source = "."
```

### 2. railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 10
  },
  "environments": {
    "production": {
      "variables": {
        "NODE_ENV": "production",
        "PORT": "3000"
      }
    }
  }
}
```

## Configuration Features:
- **Health Check**: `/health` endpoint monitoring
- **Auto Restart**: On failure with retry limit
- **Nixpacks Builder**: Automatic build detection
- **Production Environment**: Optimized settings

## Next Steps:
1. Commit config files to wisserd/onpurpose repository
2. Deploy to Railway (will use these configs automatically)
3. Railway will detect Node.js app and configure accordingly

These config files optimize Railway deployment for your OnPurpose marketplace.
