const { Client } = require('pg');

async function testDatabaseConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Jve#7@1Y'
  });

  try {
    console.log('🔌 Testing PostgreSQL connection...');
    await client.connect();
    console.log('✅ Database connected successfully');

    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version);

    // Test database creation
    try {
      await client.query('CREATE DATABASE onpurpose_db');
      console.log('✅ Database onpurpose_db created');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('ℹ️  Database onpurpose_db already exists');
      } else {
        throw err;
      }
    }

    // List databases
    const dbResult = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.log('📋 Available databases:', dbResult.rows.map(row => row.datname));

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await client.end();
  }
  return true;
}

testDatabaseConnection();
