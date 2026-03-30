# 📁 GitHub Manual Upload Guide - OnPurpose

## 🎯 **Complete These Steps**

### 1. Create GitHub Repository
In the opened GitHub tab (https://github.com/new):

**Repository Settings**:
- **Repository name**: `OnPurpose`
- **Description**: `NYC hospitality platform - Connection, not dating`
- **Visibility**: Public (required for free Netlify integration)
- **Initialize**: Leave unchecked (we have files ready)

### 2. Upload Critical Files
After creating repository, upload these essential files:

**Core Platform Files**:
- `index.html` - Landing page with OnPurpose branding
- `package.json` - Dependencies and build scripts
- `netlify.toml` - Build configuration
- `_redirects` - SPA routing rules
- `netlify/functions/server.js` - API serverless function

**Configuration Files**:
- `.env.production` - Environment variables template
- `README.md` - Project documentation

### 3. Upload Method
**Option A: Drag & Drop**
- Drag files from Windows Explorer to GitHub web interface
- Add commit message: "Initial commit - OnPurpose NYC platform"

**Option B: Upload Button**
- Click "uploading an existing file"
- Select multiple files
- Commit changes

### 4. Verify Upload
Ensure these key files are visible in repository:
- Landing page loads properly
- Netlify configuration present
- API function structure correct

## 🔗 **Next Steps After Upload**

1. **Copy repository URL** (e.g., https://github.com/USERNAME/OnPurpose)
2. **Update Netlify settings** with new repository URL
3. **Trigger deployment** from Netlify dashboard
4. **Test endpoints** once deployed

**Complete the GitHub repository creation and file upload to resolve the git reference error! 🚀**
