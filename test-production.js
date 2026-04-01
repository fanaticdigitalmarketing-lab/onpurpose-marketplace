// Test production API endpoints
async function testProductionAPI() {
  console.log('=== PRODUCTION API TESTS ===\n');
  
  const tests = [
    { name: 'GET /api/health', url: 'https://onpurpose.earth/api/health' },
    { name: 'GET /api/stats', url: 'https://onpurpose.earth/api/stats' },
  ];
  
  let passed = 0;
  for (const test of tests) {
    try {
      const response = await fetch(test.url);
      const data = await response.json();
      
      if (response.status === 200) {
        console.log(`✓ ${test.name} → ${response.status}`);
        if (test.name.includes('health')) {
          console.log(`  Status: ${data.status || 'unknown'}`);
        }
        passed++;
      } else {
        console.log(`✗ ${test.name} → ${response.status}`);
      }
    } catch (error) {
      console.log(`✗ ${test.name} → Error: ${error.message}`);
    }
  }
  
  console.log(`\n=== PRODUCTION TEST SUMMARY ===`);
  console.log(`API Endpoints: ${passed}/${tests.length} passed`);
  console.log(`Overall: ${passed === tests.length ? 'PASS' : 'FAIL'}`);
  
  return passed === tests.length;
}

testProductionAPI().catch(console.error);
