const http = require('http');

// Test direct backend connection
async function testBackend() {
  console.log('Testing backend health...');
  
  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    
    if (response.status === 200) {
      console.log('✓ Backend health check passed');
      console.log('✓ Database connected:', data.database === 'connected');
      return true;
    } else {
      console.log('✗ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('✗ Backend connection failed:', error.message);
    return false;
  }
}

// Test API endpoints
async function testAPI() {
  console.log('\nTesting API endpoints...');
  
  const tests = [
    { name: 'GET /api/health', url: 'http://localhost:3000/api/health' },
    { name: 'GET /api/services', url: 'http://localhost:3000/api/services' },
  ];
  
  let passed = 0;
  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      if (response.status === 200) {
        console.log(`✓ ${test.name} → ${response.status}`);
        passed++;
      } else {
        console.log(`✗ ${test.name} → ${response.status}`);
      }
    } catch (error) {
      console.log(`✗ ${test.name} → Error: ${error.message}`);
    }
  }
  
  return passed === tests.length;
}

// Main test runner
async function runTests() {
  console.log('=== BACKEND TEST SUITE ===\n');
  
  const backendOk = await testBackend();
  const apiOk = await testAPI();
  
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Backend Health: ${backendOk ? 'PASS' : 'FAIL'}`);
  console.log(`API Endpoints: ${apiOk ? 'PASS' : 'FAIL'}`);
  console.log(`Overall: ${(backendOk && apiOk) ? 'PASS' : 'FAIL'}`);
  
  process.exit((backendOk && apiOk) ? 0 : 1);
}

runTests().catch(console.error);
