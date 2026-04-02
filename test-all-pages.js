const http = require('http');

async function testAllPages() {
  console.log('📄 TESTING ALL PAGES\n');
  
  const baseUrl = 'http://localhost:3000';
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  async function testPage(path, expectedStatus = 200) {
    totalTests++;
    return new Promise((resolve) => {
      const req = http.get(`${baseUrl}${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === expectedStatus) {
            console.log(`✓ ${path} - ${res.statusCode}`);
            passedTests++;
          } else {
            console.log(`✗ ${path} - Expected ${expectedStatus}, got ${res.statusCode}`);
            failedTests++;
          }
          resolve({
            path,
            status: res.statusCode,
            expected: expectedStatus,
            passed: res.statusCode === expectedStatus,
            contentLength: data.length
          });
        });
      });
      
      req.on('error', (error) => {
        console.log(`✗ ${path} - Error: ${error.message}`);
        failedTests++;
        resolve({
          path,
          status: 'error',
          expected: expectedStatus,
          passed: false,
          error: error.message
        });
      });
    });
  }
  
  // Test main pages
  await testPage('/', 200);
  await testPage('/index.html', 200);
  await testPage('/contact.html', 200);
  await testPage('/privacy.html', 200);
  await testPage('/provider.html', 200);
  await testPage('/dashboard.html', 200);
  
  // Test API endpoints
  await testPage('/api/health', 200);
  await testPage('/api/stats', 200);
  await testPage('/api/services', 200);
  await testPage('/api/auth/register', 405); // Should be POST only
  await testPage('/api/auth/login', 405); // Should be POST only
  await testPage('/api/bookings', 401); // Should require auth
  
  // Test static assets
  await testPage('/og-image.png', 200);
  await testPage('/manifest.json', 200);
  
  // Test invalid pages (should 404 or fallback to index)
  await testPage('/nonexistent-page', 200); // SPA fallback
  
  console.log('\n📊 PAGE TEST RESULTS');
  console.log('================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);
  
  if (passedTests === totalTests) {
    console.log('🎉 PERFECT! All pages are working correctly!');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('✅ EXCELLENT! Most pages are working');
  } else {
    console.log('❌ NEEDS ATTENTION! Some pages are failing');
  }
  
  return { totalTests, passedTests, failedTests };
}

testAllPages().catch(console.error);
