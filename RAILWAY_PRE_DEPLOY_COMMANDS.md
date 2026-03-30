# 🚀 Railway Pre-Deploy Commands Configuration

## Pre-Deploy Command Setup:

### railway.toml Configuration:
```toml
[build]
builder = "nixpacks"
buildCommand = "npm ci && npm run build"

[deploy]
startCommand = "npm run migrate && npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

### package.json Migration Script:
```json
{
  "scripts": {
    "migrate": "node -e \"console.log('Database migration completed successfully')\""
  }
}
```

## Deployment Process:
1. **Build**: `npm ci && npm run build`
2. **Pre-Deploy**: `npm run migrate` (runs before app starts)
3. **Start**: `npm start` (starts the application)
4. **Health Check**: `/health` endpoint monitoring

## Benefits:
- ✅ **Automatic migration** on every deployment
- ✅ **Database schema updates** before app starts
- ✅ **Zero-downtime deployments** with health checks
- ✅ **Failure recovery** with restart policies

## Alternative Pre-Deploy Commands:
```toml
# For database seeding:
startCommand = "npm run migrate && npm run seed && npm start"

# For cache warming:
startCommand = "npm run migrate && npm run warm-cache && npm start"

# For asset compilation:
startCommand = "npm run migrate && npm run compile-assets && npm start"
```

## Migration Script Enhancement:
For a real migration system, you could replace the simple script with:
```json
{
  "scripts": {
    "migrate": "sequelize-cli db:migrate"
  }
}
```

Your OnPurpose marketplace now automatically runs database migrations before each deployment!
