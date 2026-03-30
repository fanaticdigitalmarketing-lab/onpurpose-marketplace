# 🚀 OnPurpose Deployment Package

## 📦 Files to Deploy

### Root Directory
```
netlify.toml
package.json
package-lock.json
index.html
host-application.html
admin-dashboard.html
privacy-policy.html
terms-of-service.html
host-guest-agreement.html
```

### Netlify Functions
```
netlify/
  └── functions/
      ├── api.js
      ├── database.js
      └── health.js
```

## 🔧 Deployment Steps

1. **Create a new site** on Netlify
2. **Drag and drop** the files from the root directory
3. **Configure build settings**:
   - Build command: `echo 'Build complete' && exit 0`
   - Publish directory: `.`
   - Functions directory: `netlify/functions`

4. **Set environment variables** in Netlify:
   ```
   NODE_ENV=production
   NETLIFY_DATABASE_URL=your_pooled_connection_string
   NETLIFY_DATABASE_URL_UNPOOLED=your_unpooled_connection_string
   ```

## ✅ Verification

After deployment, verify:
1. Main site loads: `https://YOUR_SITE_NAME.netlify.app`
2. Health check: `/.netlify/functions/health`
3. API endpoints respond correctly

## 📝 Notes
- Database connection uses Neon PostgreSQL
- Environment variables must be set before deployment
- Check Netlify logs for any deployment issues
