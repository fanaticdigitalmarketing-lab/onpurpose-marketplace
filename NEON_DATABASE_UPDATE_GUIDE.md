# Neon Database Update Guide - OnPurpose NYC

## 🎯 Database Schema Update Instructions

### **Step 1: Access Neon Console**
1. Open Firefox browser
2. Navigate to: https://console.neon.tech/
3. Log in to your Neon account
4. Select your OnPurpose database project

### **Step 2: Execute SQL Schema Updates**
1. Click on "SQL Editor" in the left sidebar
2. Copy the entire contents of `database-schema-update.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute all commands

### **Step 3: Verify Table Creation**
After execution, verify these tables were created:
- `HostApplications` - Host recruitment applications
- `Experiences` - Host experience offerings  
- `HostAvailability` - Host scheduling system

### **Step 4: Verify Column Additions**
Check that these columns were added to existing tables:
- `Hosts` table: bio, profilePhoto, portfolioImages, availability, verificationStatus, hourlyRate, location, totalEarnings, responseRate
- `Bookings` table: experienceId, guestCount, specialRequests, meetingLocation, hostNotes, guestNotes

### **Step 5: Verify Sample Data**
Confirm 5 sample NYC hosts were inserted into `HostApplications`:
- Maria Rodriguez (Local Expert, Queens)
- David Chen (Cultural Guide, Manhattan)
- Sarah Williams (Wellness Coach, Manhattan)
- Alex Thompson (Creative Mentor, Brooklyn)
- Jennifer Kim (Professional Networker, Manhattan)

### **Step 6: Check Indexes**
Verify performance indexes were created:
- Host applications by status and category
- Hosts by location and verification status
- Experiences by host and category

---

## 📋 SQL Commands Summary

The schema update includes:

### **New Tables Created:**
```sql
-- Host application management
CREATE TABLE "HostApplications" (...)

-- Host experience offerings
CREATE TABLE "Experiences" (...)

-- Host availability scheduling
CREATE TABLE "HostAvailability" (...)
```

### **Enhanced Existing Tables:**
```sql
-- Enhanced Hosts table
ALTER TABLE "Hosts" ADD COLUMN bio TEXT;
ALTER TABLE "Hosts" ADD COLUMN "profilePhoto" VARCHAR(255);
-- ... additional columns

-- Enhanced Bookings table  
ALTER TABLE "Bookings" ADD COLUMN "experienceId" INTEGER;
-- ... additional columns
```

### **Sample Data Inserted:**
- 5 NYC hosts across all categories
- Hourly rates from $45-75
- Verified status and location data

---

## ✅ Post-Update Verification

### **Test Database Connectivity**
1. Verify Netlify functions can connect to updated database
2. Test host application submission endpoint
3. Confirm admin dashboard can retrieve applications

### **Validate Data Structure**
1. Check all foreign key relationships
2. Verify JSONB availability column format
3. Test index performance on large datasets

### **Environment Variables**
Ensure these are set in Netlify:
- `NETLIFY_DATABASE_URL` - Your Neon connection string
- `JWT_SECRET` - For authentication
- `STRIPE_SECRET_KEY` - For payments

---

## 🚨 Troubleshooting

### **Common Issues:**
- **Permission Errors:** Ensure database user has CREATE/ALTER privileges
- **Connection Timeouts:** Check Neon database is active (not sleeping)
- **Foreign Key Errors:** Verify referenced tables exist before creating relationships

### **Rollback Plan:**
If issues occur, you can drop new tables:
```sql
DROP TABLE IF EXISTS "HostAvailability";
DROP TABLE IF EXISTS "Experiences"; 
DROP TABLE IF EXISTS "HostApplications";
```

---

## 🎯 Success Criteria

Database update is complete when:
✅ All new tables created successfully  
✅ Existing tables enhanced with new columns  
✅ Sample NYC host data inserted  
✅ Performance indexes created  
✅ Netlify functions can connect and query  

**After completion, mark database update task as COMPLETE in TODO list.**
