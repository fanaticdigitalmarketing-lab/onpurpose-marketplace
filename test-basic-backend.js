const http = require('http');

// Test basic backend functionality
async function testBasicBackend() {
  console.log('=== BASIC BACKEND TESTS ===\n');
  
  const tests = [
    { name: 'GET /', url: 'http://localhost:3000/' },
    { name: 'GET /health', url: 'http://localhost:3000/health' },
    { name: 'GET /api/health', url: 'http://localhost:3000/api/health' },
    { name: 'GET /api/stats', url: 'http://localhost:3000/api/stats' },
  ];
  
  let passed = 0;
  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      const data = await response.json();
      
      if (response.status === 200) {
        console.log(`✓ ${test.name} → ${response.status}`);
        if (test.name.includes('health')) {
          console.log(`  Database: ${data.database || 'unknown'}`);
        }
        passed++;
      } else {
        console.log(`✗ ${test.name} → ${response.status}`);
      }
    } catch (error) {
      console.log(`✗ ${test.name} → Error: ${error.message}`);
    }
  }
  
  return passed;
}

// Test auth endpoints (without database dependency)
async function testAuthEndpoints() {
  console.log('\n=== AUTH ENDPOINTS TESTS ===\n');
  
  const tests = [
    { 
      name: 'POST /api/auth/register (invalid)', 
      url: 'http://localhost:3000/api/auth/register',
      method: 'POST',
      body: { email: 'invalid', password: '123' }
    },
    { 
      name: 'POST /api/auth/login (missing)', 
      url: 'http://localhost:3000/api/auth/login',
      method: 'POST',
      body: {}
    },
  ];
  
  let passed = 0;
  for (const test of tests) {
    try {
      const options = {
        method: test.method || 'GET',
        headers: { 'Content-Type': 'application/json' },
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(test.url, options);
      
      if (response.status >= 400 && response.status < 500) {
        console.log(`✓ ${test.name} → ${response.status} (expected error)`);
        passed++;
      } else {
        console.log(`✗ ${test.name} → ${response.status} (unexpected)`);
      }
    } catch (error) {
      console.log(`✗ ${test.name} → Error: ${error.message}`);
    }
  }
  
  return passed;
}

// Main test runner
async function runTests() {
  const basicPassed = await testBasicBackend();
  const authPassed = await testAuthEndpoints();
  
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Basic Backend: ${basicPassed}/4 passed`);
  console.log(`Auth Endpoints: ${authPassed}/2 passed`);
  console.log(`Overall: ${(basicPassed + authPassed) >= 5 ? 'PASS' : 'FAIL'}`);
  
  process.exit((basicPassed + authPassed) >= 5 ? 0 : 1);
}

runTests().catch(console.error);
