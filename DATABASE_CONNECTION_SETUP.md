# 🔗 Database Connection Setup

## Updated Environment Variables:

### `.env` file:
```
DATABASE_URL=your_connection_string_here
```

### `railway-variables.json`:
```json
{
  "DATABASE_URL": "your_connection_string_here"
}
```

## Railway Setup Options:

### Option 1: Use Railway PostgreSQL Service Reference
```
DATABASE_URL=${{ Postgres-jMk7.DATABASE_URL }}
```

### Option 2: Direct Connection String
Replace `your_connection_string_here` with your actual PostgreSQL connection string:
```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

## For Railway Deployment:
- **Recommended**: Use `${{ Postgres-jMk7.DATABASE_URL }}` to reference the Railway PostgreSQL service
- **Alternative**: Provide direct connection string if using external database

## Database Configuration:
The `config/database.js` is already configured for SSL connections:
```javascript
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
```

Replace `your_connection_string_here` with your actual database connection string or use Railway service reference.
