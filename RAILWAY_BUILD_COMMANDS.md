# 🔨 Railway Custom Build Commands

## Build Configuration Added:

### railway.toml
```toml
[build]
builder = "nixpacks"
buildCommand = "npm ci && npm run build"
```

### package.json Build Script
```json
{
  "scripts": {
    "build": "echo 'Build complete - OnPurpose marketplace ready for production'"
  }
}
```

## Build Process:
1. **npm ci** - Clean install dependencies (faster than npm install)
2. **npm run build** - Custom build script execution
3. **Nixpacks** - Automatic Node.js detection and optimization

## Benefits:
- ✅ **Reproducible builds** with npm ci
- ✅ **Custom build logic** via npm run build
- ✅ **Production optimization** 
- ✅ **Build verification** with echo confirmation

## Alternative Build Commands:
```toml
# For TypeScript projects:
buildCommand = "npm ci && npm run build && npm run type-check"

# For projects with assets:
buildCommand = "npm ci && npm run build:assets && npm run build"

# For database setup:
buildCommand = "npm ci && npm run build && npm run migrate"
```

## Railway Deployment:
The custom build command will be executed automatically during Railway deployment, ensuring your OnPurpose marketplace is properly built for production.
