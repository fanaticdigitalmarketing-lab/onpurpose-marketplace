# 🔐 OnPurpose Platform - Environment Variables Configuration

## **Environment Variables for Netlify Deployment**

### **Database Configuration**

#### **NETLIFY_DATABASE_URL**
```
postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

#### **NETLIFY_DATABASE_URL_UNPOOLED**
```
postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

### **Platform Configuration**

#### **NODE_ENV**
```
production
```

#### **PLATFORM_NAME**
```
OnPurpose
```

#### **PLATFORM_TAGLINE**
```
Connection, Not Dating
```

#### **NYC_PILOT_TARGET_HOSTS**
```
50
```

#### **PLATFORM_FEE_PERCENTAGE**
```
20
```

#### **HOST_RATE_MIN**
```
35
```

#### **HOST_RATE_MAX**
```
75
```

### **.env File Contents**
```env
# Database Configuration
NETLIFY_DATABASE_URL=postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
NETLIFY_DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# Platform Configuration
NODE_ENV=production
PLATFORM_NAME=OnPurpose
PLATFORM_TAGLINE=Connection, Not Dating

# NYC Pilot Configuration
NYC_PILOT_TARGET_HOSTS=50
PLATFORM_FEE_PERCENTAGE=20
HOST_RATE_MIN=35
HOST_RATE_MAX=75

# Revenue Target
MONTHLY_REVENUE_TARGET=3000
```

**These environment variables configure the OnPurpose platform for production deployment with database connections and NYC pilot settings.**
