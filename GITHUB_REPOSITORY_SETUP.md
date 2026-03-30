# 🔧 GitHub Repository Setup for OnPurpose

## 🚨 **Git Reference Error Resolution**

**Issue**: Netlify build failed with `User git error while checking for ref refs/heads/main`

**Root Cause**: No GitHub repository connected with main branch

## ✅ **Steps to Complete**

### 1. Create GitHub Repository
**Firefox tab opened**: https://github.com/new

**Repository Settings**:
- **Name**: `OnPurpose`
- **Description**: `NYC hospitality platform - Connection, not dating`
- **Visibility**: Public
- **Initialize**: Do NOT add README, .gitignore, or license (we have files already)

### 2. Connect Local Repository
After creating GitHub repo, run these commands:

```bash
# Add GitHub remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/OnPurpose.git

# Push to GitHub
git push -u origin main
```

### 3. Update Netlify Settings
- Go to Netlify Site Settings → Build & Deploy → Repository
- Verify repository URL matches GitHub repo
- Ensure branch is set to `main`

## 🎯 **Current Git Status**

**Local Repository**:
- ✅ Git initialized
- ✅ All files staged and committed
- ✅ Main branch created
- ⏳ Needs GitHub remote connection

**Files Ready for Push**:
- OnPurpose platform code
- Netlify configuration (netlify.toml, _redirects)
- Environment variables template
- Documentation and guides

## 🚀 **Next Actions**

1. **Create GitHub repository** using the opened tab
2. **Copy repository URL** from GitHub
3. **Add remote origin** with the URL
4. **Push main branch** to GitHub
5. **Verify Netlify connection** and redeploy

**Once GitHub repository is connected, OnPurpose NYC will deploy successfully! 🌟**
