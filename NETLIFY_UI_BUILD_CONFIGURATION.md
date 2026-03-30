# 🔧 OnPurpose Platform - Netlify UI Build Configuration

## **Build Settings for Netlify Dashboard - 23:21 PM**

### **✅ Build Settings Configuration**

| Setting | Value | Description |
|---------|-------|-------------|
| **Base directory** | `.` | Root directory for dependency installation |
| **Build command** | `echo 'OnPurpose Platform Build Complete' && exit 0` | Static site build with success exit |
| **Publish directory** | `.` | Directory containing HTML files |
| **Functions directory** | `netlify/functions` | Serverless functions location |

### **✅ Step-by-Step Configuration**

1. **Go to Site Settings** → **Build & deploy** → **Build settings**

2. **Set Base Directory:**
   ```
   .
   ```

3. **Set Build Command:**
   ```
   echo 'OnPurpose Platform Build Complete' && exit 0
   ```

4. **Set Publish Directory:**
   ```
   .
   ```

5. **Set Functions Directory:**
   ```
   netlify/functions
   ```

### **✅ Alternative Build Commands**
If build fails, try these alternatives:

**Minimal:**
```
exit 0
```

**Empty:**
```
(leave blank)
```

**Simple:**
```
echo "Build complete"
```

### **✅ Environment Variables**
Add under **Environment variables** section:
- `NETLIFY_DATABASE_URL`
- `NETLIFY_DATABASE_URL_UNPOOLED`  
- `NODE_ENV=production`
- `PLATFORM_NAME=OnPurpose`
- `NYC_PILOT_TARGET_HOSTS=50`

**Apply these settings in Netlify UI for successful OnPurpose deployment.**
