# 🔧 OnPurpose Platform - Netlify Build Settings Configuration

## **Build Settings for Netlify UI - 23:21 PM**

### **✅ Recommended Build Settings**

#### **Base Directory**
```
.
```
*The root directory where Netlify installs dependencies and runs build commands*

#### **Build Command**
```
echo 'OnPurpose Platform Build Complete' && exit 0
```
*Simple static site build with explicit success exit code*

#### **Publish Directory**
```
.
```
*Root directory containing all OnPurpose platform HTML files*

#### **Functions Directory**
```
netlify/functions
```
*Directory for serverless functions (if needed in future)*

### **✅ Alternative Build Commands**
If the current build command fails, try these alternatives:

**Option 1 - Minimal:**
```
exit 0
```

**Option 2 - No Build Command:**
```
(leave empty)
```

**Option 3 - Simple Echo:**
```
echo "Build complete"
```

### **✅ File Structure Reference**
```
OnPurpose-Files/
├── index.html                    (landing page)
├── host-application.html         (host signup)
├── admin-dashboard.html          (admin interface)
├── privacy-policy.html           (legal)
├── terms-of-service.html         (legal)
├── host-guest-agreement.html     (legal)
├── package.json                  (dependencies)
├── netlify.toml                  (config)
└── .env                          (environment vars)
```

### **✅ Environment Variables**
Set these in Netlify UI under Environment Variables:
```
NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require

NETLIFY_DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require

NODE_ENV=production
PLATFORM_NAME=OnPurpose
PLATFORM_TAGLINE=Connection, Not Dating
NYC_PILOT_TARGET_HOSTS=50
PLATFORM_FEE_PERCENTAGE=20
HOST_RATE_MIN=35
HOST_RATE_MAX=75
MONTHLY_REVENUE_TARGET=3000
```

**Configure these settings in Netlify UI for successful OnPurpose platform deployment.**
