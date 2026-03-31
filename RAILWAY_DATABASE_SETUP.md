# 🗄️ Railway PostgreSQL Database Setup - CRITICAL

## ⚠️ CURRENT ISSUE
Your backend is using SQLite (`sqlite:./dev.sqlite`) which is **file-based** and gets **deleted on every Railway deployment**. This is why you're losing all user data and service listings.

## ✅ SOLUTION: Add PostgreSQL Database to Railway

### Step 1: Add PostgreSQL to Railway Project
1. Go to https://railway.app/
2. Open your project: **hopeful-tranquility**
3. Click **"+ New"** button
4. Select **"Database"** → **"Add PostgreSQL"**
5. Wait for the database to provision (takes ~30 seconds)

### Step 2: Link Database to Backend Service
1. In Railway, click on your **onpurpose-backend-clean** service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Click **"Add Reference"**
5. Select your **PostgreSQL** database
6. Choose **DATABASE_URL** from the dropdown
7. Click **"Add"**

This will automatically set: `DATABASE_URL=${{Postgres.DATABASE_URL}}`

### Step 3: Verify Database Connection
After deployment, check the logs:
- You should see: `✅ Database connection established successfully`
- You should see: `📊 Database URL: postgresql://***:***@...`

### Step 4: Initialize Database Tables
The backend will automatically create all tables on first startup using Sequelize sync.

## 🔍 How to Verify It's Working

### Check Railway Logs:
```
✅ Database connection established successfully
📊 Database URL: postgresql://postgres:***@...
🔄 Database synced successfully
```

### Test Account Creation:
1. Go to https://onpurpose.earth
2. Click "Sign In" → "Sign up as a provider"
3. Create an account
4. Check Railway logs for: `✅ User registered successfully`

### Verify Data Persistence:
1. Create a test account
2. Trigger a Railway redeployment (push a small change)
3. Try to sign in with the same account
4. **It should work!** (Previously it would fail)

## 📊 Database Tables Created Automatically:
- **Users** - All user accounts (customers, providers, admins)
- **Services** - Service listings from providers
- **Bookings** - All booking records
- **Reviews** - Service reviews
- **Availability** - Provider availability schedules
- **Payments** - Payment transaction records

## ⚡ IMPORTANT NOTES:
1. **Never delete the PostgreSQL database** - all data will be lost
2. **DATABASE_URL is automatically set** by Railway when you link the database
3. **SSL is already configured** in the code for production PostgreSQL
4. **Backups**: Railway PostgreSQL includes automatic backups on paid plans

## 🚨 If Account Creation Still Fails:
Check these in Railway logs:
1. Database connection errors
2. Validation errors (email format, password length)
3. Duplicate email errors
4. CORS errors from frontend

## Current Backend Configuration:
```javascript
// server.js line 35
const dbUrl = process.env.DATABASE_URL || 'sqlite:./dev.sqlite';
```

Once DATABASE_URL is set in Railway, it will use PostgreSQL instead of SQLite.
