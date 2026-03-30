# 🗄️ OnPurpose Platform - Dual Database Configuration

## **PostgreSQL Database - Neon (Dual Configuration)**

### **NETLIFY_DATABASE_URL (Pooled)**
```
postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

### **NETLIFY_DATABASE_URL_UNPOOLED (Direct)**
```
postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

## **Environment Variable Configuration**

### **Pooled Connection (Default)**
| Deploy Context | Database URL (Pooled) |
|---------------|----------------------|
| **Production** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |
| **Deploy Preview** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |
| **Branch Deploy** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |
| **Local Development** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |

### **Unpooled Connection (Direct)**
| Deploy Context | Database URL (Unpooled) |
|---------------|------------------------|
| **Production** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |
| **Deploy Preview** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |
| **Branch Deploy** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |
| **Local Development** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |

## **Connection Types**
- **Pooled:** Optimized for high-concurrency web applications
- **Unpooled:** Direct database connection for specific operations
- **SSL Required:** Both connections use secure SSL with channel binding
- **Multi-context:** Both configurations available across all deployment contexts

**OnPurpose platform has dual database configuration for optimal performance and flexibility.**
