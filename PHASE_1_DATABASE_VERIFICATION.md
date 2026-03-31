# Phase 1: Database Schema Update - Verification Guide

## 🎯 Current Status Check

### **Database Connection Details**
- **Provider**: Neon PostgreSQL
- **Connection URL**: `postgresql://neondb_owner:npg_1ILnrDyJTOw7@ep-young-wind-ae1wrdxy-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require`
- **Environment Variable**: `NETLIFY_DATABASE_URL`

### **Required Tables to Verify**
1. ✅ `HostApplications` - Host recruitment applications
2. ✅ `Experiences` - Host experience offerings
3. ✅ `HostAvailability` - Host scheduling system
4. ✅ `Hosts` - Enhanced with new columns
5. ✅ `Bookings` - Enhanced with new columns

---

## 📋 Step-by-Step Verification Process

### **Step 1: Access Neon Console**
1. Open Firefox browser
2. Navigate to: https://console.neon.tech/
3. Log in to your Neon account
4. Select your OnPurpose database project

### **Step 2: Verify Tables Exist**
Run this query in Neon SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('HostApplications', 'Experiences', 'HostAvailability', 'Hosts', 'Bookings')
ORDER BY table_name;
```

**Expected Result**: Should return 5 rows showing all tables exist.

### **Step 3: Check HostApplications Table Structure**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'HostApplications'
ORDER BY ordinal_position;
```

**Expected Columns**:
- id, firstName, lastName, email, phone, category, experience, portfolio, bio, location, hourlyRate, availability, status, reviewNotes, reviewedBy, reviewedAt, createdAt, updatedAt

### **Step 4: Verify Sample Data**
```sql
SELECT COUNT(*) as total_applications,
       COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count
FROM "HostApplications";
```

**Expected Result**: Should show 5 total applications, 5 approved (if schema was already applied).

### **Step 5: Check Enhanced Hosts Table**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Hosts' 
AND column_name IN ('bio', 'profilePhoto', 'portfolioImages', 'availability', 'verificationStatus', 'hourlyRate', 'location', 'totalEarnings', 'responseRate');
```

**Expected Result**: Should return 9 rows showing all new columns exist.

---

## 🔧 If Tables Don't Exist - Execute Schema Update

### **Option 1: Use Clean Schema File (Recommended)**
Copy contents of `database-schema-clean.sql` and execute in Neon SQL Editor.

### **Option 2: Use Full Schema Update File**
Copy contents of `database-schema-update.sql` and execute in Neon SQL Editor.

### **Option 3: Use Fixed Schema File (If errors occur)**
Copy contents of `database-schema-update-fixed.sql` and execute in Neon SQL Editor.

---

## ✅ Verification Checklist

- [ ] Neon Console accessible
- [ ] Database connection active
- [ ] `HostApplications` table exists
- [ ] `Experiences` table exists
- [ ] `HostAvailability` table exists
- [ ] `Hosts` table has new columns (bio, profilePhoto, etc.)
- [ ] `Bookings` table has new columns (experienceId, guestCount, etc.)
- [ ] Sample NYC host data inserted (5 hosts)
- [ ] Performance indexes created
- [ ] Netlify functions can query new tables

---

## 🧪 Test Netlify Functions

After database verification, test these endpoints:

### **Test Host Application Submission**
```bash
curl -X POST https://queoper.netlify.app/.netlify/functions/host-application \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Host",
    "email": "test@example.com",
    "category": "Local Expert",
    "experience": "Test experience description"
  }'
```

**Expected**: 201 status with success message.

### **Test Admin Applications Retrieval**
```bash
curl https://queoper.netlify.app/.netlify/functions/admin-applications
```

**Expected**: 200 status with list of applications.

---

## 🚨 Troubleshooting

### **Issue: Tables Already Exist Error**
- **Solution**: Use `database-schema-update-fixed.sql` which has `IF NOT EXISTS` checks.

### **Issue: Foreign Key Constraint Errors**
- **Solution**: Ensure `Hosts` table exists before creating `Experiences` and `HostAvailability`.

### **Issue: Connection Timeout**
- **Solution**: Neon database may be sleeping. Run any query to wake it up, then retry.

### **Issue: Permission Denied**
- **Solution**: Verify database user has CREATE and ALTER privileges.

---

## 📊 Success Criteria

Phase 1 Database Update is **COMPLETE** when:

✅ All 3 new tables created successfully  
✅ Existing tables enhanced with new columns  
✅ 5 sample NYC hosts inserted into `HostApplications`  
✅ All performance indexes created  
✅ Netlify functions successfully query database  
✅ No errors in function logs  

---

## 🎯 Next Steps After Verification

Once Phase 1 Database is verified:
1. Mark Phase 1 as COMPLETE in checklist
2. Proceed to Phase 2: GitHub Repository Update
3. Test end-to-end host application flow
4. Monitor Netlify function logs for errors

---

**Railway Backend URL**: https://onpurpose-backend-clean-production.up.railway.app  
**Netlify Frontend URL**: https://queoper.netlify.app  
**Neon Console**: https://console.neon.tech
