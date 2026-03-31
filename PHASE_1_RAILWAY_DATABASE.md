# Phase 1: Database Schema Update - RAILWAY POSTGRESQL

## 🎯 Your Current Setup

### **Backend: Railway**
- URL: `https://onpurpose-backend-clean-production.up.railway.app`
- Database: **Railway PostgreSQL** (NOT Neon)
- Server: Uses Sequelize ORM with `server.js`

### **Current Database Models (Sequelize)**
Your `server.js` already defines these tables:
- ✅ Users
- ✅ Services  
- ✅ Bookings
- ✅ Reviews
- ✅ Availability
- ✅ BlockedDates
- ✅ EarlyAccess

---

## ⚠️ ISSUE IDENTIFIED

The checklist references **Neon database** and **Netlify functions**, but you're actually using:
- **Railway PostgreSQL** (not Neon)
- **Railway backend** with Sequelize models (not Netlify functions)

The schema files (`database-schema-update.sql`) are designed for a different architecture than what you have deployed.

---

## 🔧 CORRECT APPROACH FOR YOUR SETUP

### **Option 1: Use Your Current Sequelize Models (Recommended)**

Your Railway backend already has database models defined in `server.js`. To add new tables:

1. **Add new Sequelize models** to `server.js`
2. **Run Sequelize sync** to create tables automatically
3. **No manual SQL needed**

### **Option 2: Add SQL Schema to Railway Database**

If you want to add the new tables manually:

1. **Access Railway Dashboard**: https://railway.app
2. **Find your PostgreSQL service**
3. **Open PostgreSQL console** or use connection string
4. **Execute SQL** from `database-schema-update.sql`

---

## 📋 What Tables Need To Be Added?

Based on the checklist, these tables should be added:

### **HostApplications** - For host recruitment
```javascript
const HostApplication = sequelize.define('HostApplication', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING(100), allowNull: false },
  lastName: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  category: { type: DataTypes.STRING(100), allowNull: false },
  experience: { type: DataTypes.TEXT, allowNull: false },
  portfolio: { type: DataTypes.TEXT },
  bio: { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING(255) },
  hourlyRate: { type: DataTypes.DECIMAL(10, 2) },
  availability: { type: DataTypes.STRING(100) },
  status: { type: DataTypes.STRING(50), defaultValue: 'pending' },
  reviewNotes: { type: DataTypes.TEXT },
  reviewedBy: { type: DataTypes.INTEGER },
  reviewedAt: { type: DataTypes.DATE }
});
```

### **Experiences** - Host offerings
```javascript
const Experience = sequelize.define('Experience', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hostId: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  duration: { type: DataTypes.INTEGER },
  maxGuests: { type: DataTypes.INTEGER, defaultValue: 1 },
  basePrice: { type: DataTypes.DECIMAL(10, 2) },
  category: { type: DataTypes.STRING(100) },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});
```

### **HostAvailability** - Scheduling
```javascript
const HostAvailability = sequelize.define('HostAvailability', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hostId: { type: DataTypes.INTEGER },
  dayOfWeek: { type: DataTypes.INTEGER },
  startTime: { type: DataTypes.TIME },
  endTime: { type: DataTypes.TIME },
  isRecurring: { type: DataTypes.BOOLEAN, defaultValue: true },
  specificDate: { type: DataTypes.DATEONLY },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }
});
```

---

## ✅ RECOMMENDED ACTION

**Skip the Neon/Netlify functions approach** - that's for a different architecture.

Instead, let's verify what's actually needed for YOUR Railway deployment:

1. Check if these tables are actually needed for your current features
2. If yes, add them as Sequelize models to `server.js`
3. Deploy to Railway and let Sequelize create the tables

---

## 🤔 QUESTION FOR YOU

**What features are you actually trying to enable?**

- Host application system?
- Experience booking system?
- Something else?

Let me know and I'll help you implement it correctly for your Railway + Sequelize setup, not the Neon + Netlify functions architecture that the checklist assumes.
