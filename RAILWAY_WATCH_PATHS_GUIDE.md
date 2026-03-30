# 🚂 Railway Watch Paths Configuration

## Watch Paths Implementation:

### 1. .railwayignore File ✅
Created `.railwayignore` to control deployment triggers:
```
# Ignore documentation and config files
*.md
*.txt
.env.example
.gitignore

# Ignore development files
.vscode/
.idea/
*.log

# Ignore test files
test/
tests/
*.test.js
coverage/

# Ignore deployment guides
deploy/
DEPLOY_*.md
RAILWAY_*.md
STRIPE_*.md
```

### 2. Railway Configuration Files:
- **railway.toml**: Main configuration with health checks
- **railway.json**: JSON format (schema compliant)

## How Watch Paths Work:
- **Deploy triggers**: Changes to `server.js`, `routes/`, `models/`, `package.json`
- **Ignore**: Documentation, guides, test files, logs
- **Efficient**: Only redeploys when code actually changes

## Benefits:
- ✅ Faster deployments
- ✅ Reduced build times  
- ✅ Cost optimization
- ✅ Better CI/CD workflow

## Railway Dashboard:
The `.railwayignore` file will be automatically detected and used by Railway to determine when to trigger new deployments.

Your OnPurpose marketplace now has optimized deployment triggers!
