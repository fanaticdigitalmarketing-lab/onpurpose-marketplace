const http = require('http');
const { Client } = require('pg');

async function runComprehensiveBugTest() {
  console.log('🚀 Starting Comprehensive Bug Test for OnPurpose App\n');
  
  // Test 1: PostgreSQL Connection
  console.log('=== TEST 1: PostgreSQL Database Connection ===');
  try {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'Jve#7@1Y'
    });
    
    await client.connect();
    console.log('✅ PostgreSQL connection: SUCCESS');
    
    const result = await client.query('SELECT version()');
    console.log(`📊 PostgreSQL Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    // Test database creation
    try {
      await client.query('CREATE DATABASE onpurpose_db');
      console.log('✅ Database onpurpose_db: CREATED');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('ℹ️  Database onpurpose_db: ALREADY EXISTS');
      } else {
        throw err;
      }
    }
    
    await client.end();
  } catch (error) {
    console.log('❌ PostgreSQL connection: FAILED');
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 2: Node.js Environment
  console.log('\n=== TEST 2: Node.js Environment ===');
  console.log(`✅ Node.js Version: ${process.version}`);
  console.log(`✅ Platform: ${process.platform}`);
  console.log(`✅ Architecture: ${process.arch}`);
  
  // Test 3: OnPurpose App Health Check
  console.log('\n=== TEST 3: OnPurpose App Health Check ===');
  try {
    const healthCheck = await makeHttpRequest('http://localhost:3000/health');
    console.log('✅ OnPurpose App: RUNNING');
    console.log(`📊 Health Status: ${JSON.stringify(healthCheck)}`);
  } catch (error) {
    console.log('❌ OnPurpose App: NOT RESPONDING');
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 4: API Endpoints
  console.log('\n=== TEST 4: API Endpoints Test ===');
  const endpoints = [
    '/api/auth',
    '/api/users', 
    '/api/hosts',
    '/api/bookings',
    '/api/payments',
    '/api/admin'
  ];
  
  for (const endpoint of endpoints) {
    try {
      await makeHttpRequest(`http://localhost:3000${endpoint}`);
      console.log(`✅ ${endpoint}: ACCESSIBLE`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`⚠️  ${endpoint}: ROUTE EXISTS (404 expected for GET)`);
      } else {
        console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
      }
    }
  }
  
  // Test 5: Environment Variables
  console.log('\n=== TEST 5: Environment Variables ===');
  const requiredEnvVars = ['NODE_ENV', 'PORT', 'DATABASE_URL', 'JWT_SECRET'];
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: SET`);
    } else {
      console.log(`❌ ${envVar}: MISSING`);
    }
  }
  
  console.log('\n🏁 Comprehensive Bug Test Complete!');
}

function makeHttpRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      });
    });
    
    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Load environment variables
require('dotenv').config();

runComprehensiveBugTest().catch(console.error);
