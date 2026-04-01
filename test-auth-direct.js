const http = require('http');

// Test backend authentication directly
async function testAuthDirect() {
  console.log('=== DIRECT AUTH TESTS ===\n');
  
  let passed = 0;
  let total = 0;
  const timestamp = Date.now();
  
  // Test 1: Register new user
  try {
    total++;
    const data = JSON.stringify({
      name: 'Test User',
      email: `test${timestamp}@example.com`,
      password: 'password123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
    
    const result = JSON.parse(response.body);
    if (response.status === 201 && result.accessToken) {
      console.log('✓ POST /api/auth/register → 201 + accessToken');
      passed++;
    } else if (response.status === 201 && result.token) {
      console.log('✓ POST /api/auth/register → 201 + token');
      passed++;
    } else {
      console.log('✗ POST /api/auth/register →', response.status);
    }
  } catch (error) {
    console.log('✗ POST /api/auth/register → Error:', error.message);
  }
  
  // Test 2: Login with correct credentials
  try {
    total++;
    const data = JSON.stringify({
      email: `test${timestamp}@example.com`,
      password: 'password123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
    
    const result = JSON.parse(response.body);
    if (response.status === 200 && result.accessToken) {
      console.log('✓ POST /api/auth/login → 200 + accessToken');
      passed++;
    } else if (response.status === 200 && result.token) {
      console.log('✓ POST /api/auth/login → 200 + token');
      passed++;
    } else {
      console.log('✗ POST /api/auth/login →', response.status);
    }
  } catch (error) {
    console.log('✗ POST /api/auth/login → Error:', error.message);
  }
  
  // Test 3: Register duplicate email
  try {
    total++;
    const data = JSON.stringify({
      name: 'Test User 2',
      email: 'test@example.com',
      password: 'password456'
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
    
    if (response.status === 400) {
      console.log('✓ POST /api/auth/register duplicate → 400');
      passed++;
    } else {
      console.log('✗ POST /api/auth/register duplicate →', response.status);
    }
  } catch (error) {
    console.log('✗ POST /api/auth/register duplicate → Error:', error.message);
  }
  
  // Test 4: Get services
  try {
    total++;
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/services',
      method: 'GET'
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.end();
    });
    
    const result = JSON.parse(response.body);
    if (response.status === 200 && Array.isArray(result)) {
      console.log('✓ GET /api/services → 200 + array');
      passed++;
    } else {
      console.log('✗ GET /api/services →', response.status);
    }
  } catch (error) {
    console.log('✗ GET /api/services → Error:', error.message);
  }
  
  console.log(`\n=== DIRECT TEST SUMMARY ===`);
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Overall: ${passed === total ? 'PASS' : 'FAIL'}`);
  
  return passed === total;
}

testAuthDirect().catch(console.error);
