# 🔧 Netlify Deployment Troubleshooting

## 🚨 Issue: Page Not Found on Netlify

Based on the Netlify support guide, here are the common causes and solutions:

### 1. Check Deploy Status
- **Deploy Logs**: Review build logs for errors
- **File Structure**: Ensure `index.html` is in the correct location
- **Build Output**: Verify files are being generated in the right directory

### 2. Common Fixes for OnPurpose

#### A. Verify Build Configuration
```toml
# netlify.toml
[build]
  base = "."
  command = "npm install && npm run build"
  publish = "."
  
[build.environment]
  NODE_VERSION = "18"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### B. Check File Structure
```
OnPurpose/
├── index.html          ← Landing page (root)
├── netlify.toml        ← Build config
├── package.json        ← Dependencies
└── netlify/
    └── functions/
        └── server.js   ← API endpoints
```

#### C. Verify index.html Location
The `index.html` file must be in the root directory for Netlify to serve it correctly.

### 3. Debug Steps

1. **Check Deploy Logs**: Look for build errors or missing files
2. **Verify File Upload**: Ensure all files are committed to Git
3. **Test Locally**: Run `npm start` to verify functionality
4. **Check Redirects**: Ensure API routes redirect to functions

### 4. OnPurpose Specific Checks

- **Environment Variables**: All 12 variables added to Netlify
- **Database Connection**: Neon PostgreSQL accessible
- **Function Deployment**: serverless-http wrapper working
- **Static Files**: index.html, styles, images uploaded

### 5. Quick Fixes

#### Force Redeploy
```bash
# Trigger new deployment
git commit --allow-empty -m "Force redeploy"
git push origin main
```

#### Clear Cache
- Go to Netlify dashboard → Site settings → Build & deploy → Clear cache

#### Check Function Logs
- Netlify dashboard → Functions → View logs for errors

## 🔍 Current Status Check

**URLs to Test**:
- https://queoper.netlify.app/ (Landing page)
- https://queoper.netlify.app/health (API health)
- https://queoper.netlify.app/api (API info)
- https://queoper.netlify.app/api/hosts (NYC hosts)

**Expected Results**:
- Landing page: OnPurpose branding and content
- Health: Database connection status
- API: Endpoint information
- Hosts: JSON array of NYC hosts

## 🚀 Resolution Steps

1. **Check Netlify deploy logs** for build errors
2. **Verify file structure** and index.html location
3. **Test environment variables** are properly set
4. **Force redeploy** if necessary
5. **Clear cache** and retry

**OnPurpose should be accessible at https://queoper.netlify.app once deployment issues are resolved! 🌟**
