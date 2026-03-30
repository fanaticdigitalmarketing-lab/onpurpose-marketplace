# 📤 GitHub Push - Manual Options

## Git Commands Not Available in PowerShell

Since git commands are not working in the current environment, use one of these manual methods:

### Option 1: GitHub Desktop (Recommended)
1. Open GitHub Desktop application
2. Select the OnPurpose repository
3. Review changes to `config/database.js`
4. Add commit message: "Fix PostgreSQL connection configuration for Railway deployment"
5. Click "Commit to main"
6. Click "Push origin"

### Option 2: GitHub Web Interface
1. Go to https://github.com/wisserd/onpurpose
2. Navigate to `config/database.js`
3. Click the pencil icon (Edit this file)
4. Replace the entire content with the updated database configuration:

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

5. Commit message: "Fix PostgreSQL connection configuration for Railway deployment"
6. Click "Commit changes"

### Option 3: VS Code Source Control
1. Open VS Code
2. Go to Source Control tab (Ctrl+Shift+G)
3. Stage changes to `config/database.js`
4. Add commit message: "Fix PostgreSQL connection configuration for Railway deployment"
5. Click "Commit"
6. Click "Push"

## After Push:
- Railway will automatically detect the GitHub push
- New deployment will start with the database fix
- Monitor Railway dashboard for deployment progress

Choose the method you prefer to push the critical database connection fix to GitHub.
