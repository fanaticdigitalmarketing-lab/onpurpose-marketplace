# 🔧 Netlify Git Reference Error - Fix Guide

## 🚨 **Error Analysis**

**Error**: `User git error while checking for ref refs/heads/main`

**Root Cause**: Netlify cannot find the `main` branch reference in the repository.

## ✅ **Fix Steps Applied**

### 1. Git Repository Initialization
```bash
git init                    # Initialize git repository
git add .                   # Stage all files
git commit -m "Initial commit - OnPurpose NYC hospitality platform"
git branch -M main          # Create and switch to main branch
```

### 2. GitHub Repository Setup
- **Create New Repository**: https://github.com/new
- **Repository Name**: OnPurpose
- **Description**: NYC hospitality platform - Connection, not dating
- **Visibility**: Public (for Netlify integration)

### 3. Connect Local to Remote
After creating GitHub repository:
```bash
git remote add origin https://github.com/[USERNAME]/OnPurpose.git
git push -u origin main
```

### 4. Update Netlify Settings
- **Site Settings** → **Build & Deploy** → **Repository**
- **Branch**: Ensure set to `main`
- **Repository URL**: Verify correct GitHub URL

## 🎯 **Expected Resolution**

Once GitHub repository is created and connected:
1. **Push code** to GitHub main branch
2. **Netlify will detect** the main branch reference
3. **Build will proceed** successfully
4. **OnPurpose will deploy** at https://queoper.netlify.app

## 📋 **Next Steps**

1. **Create GitHub repository** (Firefox tab opened)
2. **Add remote origin** and push code
3. **Verify Netlify repository settings**
4. **Trigger new deployment**
5. **Test OnPurpose endpoints**

**OnPurpose NYC deployment will be complete once git repository is properly connected! 🚀**
