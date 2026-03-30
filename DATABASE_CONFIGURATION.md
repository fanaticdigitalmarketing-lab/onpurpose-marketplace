# 🗄️ OnPurpose Platform - Database Configuration

## **PostgreSQL Database Connection - Neon**

**Database URL:** 
```
postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

## **Environment Variable Configuration**

### **NETLIFY_DATABASE_URL**
All deployment contexts configured with same database:

| Deploy Context | Database URL |
|---------------|-------------|
| **Production** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |
| **Deploy Preview** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |
| **Branch Deploy** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |
| **Local Development** | postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require |

## **Database Features**
- ✅ **SSL Required** - Secure connection
- ✅ **Connection Pooling** - Optimized performance
- ✅ **Channel Binding** - Enhanced security
- ✅ **Multi-context Support** - Production, preview, branch, local

## **Platform Integration**
- **Host Applications** - Stored in PostgreSQL
- **User Authentication** - Database-backed
- **Booking System** - Full transaction support
- **Admin Dashboard** - Real-time data access
- **NYC Pilot Data** - 50 host profiles and bookings

**Database is fully configured and ready for OnPurpose platform operations.**
