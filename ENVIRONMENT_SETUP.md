# 🔑 Environment Setup for Autonomous System

## 🚀 Required Environment Variables

To activate the complete autonomous system, set these environment variables:

### 🤖 OpenAI API Key
```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Purpose:**
- Powers AI fix generation with GPT-4.1
- Enables intelligent code analysis
- Provides senior engineer-level fixes

**Setup Methods:**
1. **Environment Variable (Windows):**
   ```bash
   set OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **.env file:**
   ```env
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Railway Dashboard:**
   - Go to Railway service settings
   - Add `OPENAI_API_KEY` to environment variables

---

### 📝 GitHub Token
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Purpose:**
- Enables automatic GitHub commits
- Maintains version control history
- Provides repository access for fixes

**Setup Methods:**
1. **Environment Variable (Windows):**
   ```bash
   set GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **.env file:**
   ```env
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Railway Dashboard:**
   - Go to Railway service settings
   - Add `GITHUB_TOKEN` to environment variables

---

## 🔧 Complete Setup Instructions

### 📋 Step 1: Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Copy the key (starts with `sk-`)

### 📋 Step 2: Get GitHub Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select permissions:
   - **Repository access**: `fanaticdigitalmarketing-lab/onpurpose-backend-clean`
   - **Permissions**: `Contents` (read/write)
   - **Scope**: `repo` (full control)
4. Copy the token (starts with `ghp_`)

### 📋 Step 3: Set Environment Variables

#### Option A: Railway Dashboard (Recommended)
1. Go to [Railway Dashboard](https://railway.app/project/hopeful-tranquility/service/onpurpose-backend-clean)
2. Click on "Variables" tab
3. Add both variables:
   - Name: `OPENAI_API_KEY`, Value: `sk-xxxxxxxx...`
   - Name: `GITHUB_TOKEN`, Value: `ghp_xxxxxxxxx...`
4. Railway will automatically redeploy with new variables

#### Option B: Local Development
1. Create `.env` file in project root:
   ```env
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
2. Restart your local server

#### Option C: Windows Environment
```bash
set OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
set GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
npm start
```

---

## 🎯 System Activation

### ✅ After Setting Variables:
1. **Railway Deployment** (if using Railway dashboard)
   - Variables automatically applied
   - System redeploys with full capabilities
   - Autonomous workflow becomes active

2. **Local Development** (if using .env or environment)
   - Restart your application
   - System gains AI and GitHub capabilities
   - Full autonomous workflow available

### 🚀 What Gets Activated:
- **🤖 AI-Powered Fixes**: GPT-4.1 generates intelligent fixes
- **📝 GitHub Auto-Commit**: Fixes automatically committed to repository
- **🌐 Deployment Automation**: Changes deployed to production
- **🔄 Complete Workflow**: End-to-end autonomous operation

---

## 🔍 Testing Setup

### Verify OpenAI Integration:
```javascript
const { generateFix } = require('./ai-fix-engine');

const testFix = await generateFix(
  { type: 'test_error', details: 'Test issue' },
  'test.js'
);
console.log('AI fix test:', testFix ? '✅ Working' : '❌ Failed');
```

### Verify GitHub Integration:
```javascript
const { commitFix } = require('./github-auto-fix');

const testCommit = await commitFix(
  'test.txt',
  'test content',
  'Test commit'
);
console.log('GitHub test:', testCommit ? '✅ Working' : '❌ Failed');
```

---

## 🛡️ Security Best Practices

### 🔒 Keep Tokens Secure:
- **Never commit** tokens to repository
- **Use environment variables** instead of hardcoding
- **Rotate tokens regularly** (every 90 days)
- **Monitor usage** in OpenAI and GitHub dashboards

### 🚨 Token Permissions:
- **OpenAI**: Only need API access, no admin permissions
- **GitHub**: Repository-specific access, not organization-wide
- **Minimum required scope** for both services

---

## 📊 System Status After Setup

### ✅ Full Autonomous System Active:
- **Issue Detection**: ✅ Working
- **AI Fix Generation**: ✅ Active with OpenAI
- **Backup & Rollback**: ✅ Safety system ready
- **GitHub Commits**: ✅ Auto-committing enabled
- **Deployment**: ✅ Railway automation active
- **Complete Workflow**: ✅ End-to-end operation

### 🎯 Capabilities:
- **Zero-touch maintenance**: System fixes itself
- **AI intelligence**: Senior engineer-level fixes
- **Version control**: Automatic GitHub integration
- **Production deployment**: Instant updates
- **Quality assurance**: Validation and rollback

---

## 🚀 Ready to Launch!

Once both environment variables are set:

🤖 **The autonomous system will:**
- Detect issues automatically
- Generate intelligent AI fixes
- Create backups before changes
- Apply fixes safely
- Validate results
- Commit successful fixes to GitHub
- Deploy improvements to production
- Learn and improve over time

🎉 **Your system becomes truly autonomous and self-maintaining!**

---

## 📞 Support & Troubleshooting

### Common Issues:
- **401 Unauthorized**: Check token validity
- **403 Forbidden**: Verify permissions
- **API limits**: Check OpenAI usage
- **Repository access**: Confirm GitHub permissions

### Quick Fixes:
1. **Regenerate tokens** if expired
2. **Check permissions** in service dashboards
3. **Verify Railway variables** are set correctly
4. **Monitor logs** for error messages

---

**🔑 Set both environment variables to activate the complete autonomous AI-powered self-maintaining system!**
