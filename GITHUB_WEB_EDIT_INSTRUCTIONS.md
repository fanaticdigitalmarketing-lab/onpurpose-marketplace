# 📝 GitHub Web Edit Instructions

## Current Status:
The GitHub edit page is loading. Here's how to update the database.js file directly on GitHub:

## Step-by-Step Instructions:

### 1. Wait for Page to Load
The GitHub editor should show the current `config/database.js` content

### 2. Replace Entire File Content
Select all text (Ctrl+A) and replace with this enhanced database configuration:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', (client) => {
  console.log('✅ Connected to PostgreSQL database');
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
});

pool.on('error', (err, client) => {
  console.error('❌ Database connection error:', err);
  console.error('Connection string format:', process.env.DATABASE_URL ? 'Present' : 'Missing');
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed on startup:', err);
  } else {
    console.log('✅ Database connection test successful');
    release();
  }
});

module.exports = pool;
```

### 3. Add Commit Message
In the commit message box at the bottom, enter:
```
Fix PostgreSQL connection configuration for Railway deployment
```

### 4. Commit Changes
Click "Commit changes" button

## What This Fix Does:
- Adds connection pooling with 20 max connections
- Sets connection timeout to 2000ms
- Adds idle timeout of 30000ms
- Improves error logging and debugging
- Tests connection on application startup
- Maintains SSL configuration for Railway

## After Commit:
- Railway will automatically detect the GitHub push
- New deployment will start with the database fix
- Monitor Railway dashboard for deployment progress

This fix should resolve the PostgreSQL connection issues that caused the previous deployment failure.
