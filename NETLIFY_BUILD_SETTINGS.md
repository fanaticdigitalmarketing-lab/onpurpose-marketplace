# ⚙️ OnPurpose Platform - Netlify Build Settings

## **Build Configuration for OnPurpose Platform**

### **Base Directory**
```
.
```
*The root directory where Netlify installs dependencies and runs build commands*

### **Build Command**
```
echo 'Static site deployment - OnPurpose Platform'
```
*Simple echo command since this is a static site deployment*

### **Publish Directory**
```
.
```
*Root directory containing all platform files (index.html, host-application.html, etc.)*

### **Functions Directory**
```
netlify/functions
```
*Directory for Netlify Functions (if needed for future backend operations)*

## **Alternative Build Settings**

### **For Static Site (Recommended)**
- **Base directory:** `.` (root)
- **Build command:** `echo 'OnPurpose Platform Build Complete'`
- **Publish directory:** `.` (root)
- **Functions directory:** `netlify/functions`

### **For Node.js Build (If Needed)**
- **Base directory:** `.`
- **Build command:** `npm run build`
- **Publish directory:** `dist` or `build`
- **Functions directory:** `netlify/functions`

## **Current OnPurpose Platform Files**
All files are in root directory:
- `index.html`
- `host-application.html`
- `admin-dashboard.html`
- `privacy-policy.html`
- `terms-of-service.html`
- `host-guest-agreement.html`
- `package.json`
- `netlify.toml`

**Recommended settings for OnPurpose platform static deployment.**
