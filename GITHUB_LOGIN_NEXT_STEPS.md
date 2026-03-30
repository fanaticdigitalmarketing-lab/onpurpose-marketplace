# GitHub Login & Repository Creation

## 🔐 Step 1: Sign in to GitHub
You need to sign in to GitHub first. In the browser:
1. Enter your GitHub username/email
2. Enter your password
3. Click "Sign in"

OR

- Click "Continue with Google" if you prefer
- Click "Create an account" if you don't have GitHub yet

## 🚀 Step 2: After Login - Create Repository
Once logged in, you'll be redirected to create a new repository:

**Fill in the form**:
- **Repository name**: `onpurpose-mvp`
- **Description**: `OnPurpose hospitality platform - Connection, not dating`
- **Visibility**: Private (recommended)
- **Initialize**: Leave all checkboxes UNCHECKED
- **Click**: "Create repository"

## 📋 Step 3: Push Code Commands
After creating the repository, GitHub will show you commands. Use these:

```bash
git branch -M main
git remote add origin [YOUR_REPO_URL_FROM_GITHUB]
git push -u origin main
```

## ⚡ Step 4: Connect to Railway
1. Go to Railway dashboard: https://railway.app/dashboard
2. Find your OnPurpose project
3. Settings → Connect to GitHub
4. Select `onpurpose-mvp` repository
5. Add environment variables

## 🎯 Ready for Full Integration
Once completed: Windsurf → GitHub → Railway → NYC Launch!
