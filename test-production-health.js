// Quick Production Health Check
// Tests basic connectivity to production environment

const https = require('https');

function checkHealth(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          success: res.statusCode === 200
        });
      });
    });
    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        data: err.message,
        success: false
      });
    });
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        data: 'Request timeout',
        success: false
      });
    });
  });
}

async function runHealthChecks() {
  console.log('🔍 ONPURPOSE PRODUCTION HEALTH CHECK');
  console.log('=====================================');
  
  const checks = [
    { name: 'Frontend Health', url: 'https://onpurpose.earth/health' },
    { name: 'Backend Health', url: 'https://onpurpose-backend-clean-production.up.railway.app/health' },
    { name: 'API Test', url: 'https://onpurpose.earth/api/health' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    console.log(`\n📡 Checking ${check.name}...`);
    try {
      const result = await checkHealth(check.url);
      if (result.success) {
        console.log(`  ✅ PASS: ${check.name} (${result.status})`);
        console.log(`  Response: ${result.data.substring(0, 100)}...`);
        passed++;
      } else {
        console.log(`  ❌ FAIL: ${check.name} (${result.status})`);
        console.log(`  Error: ${result.data}`);
        failed++;
      }
    } catch (err) {
      console.log(`  ❌ ERROR: ${check.name} - ${err.message}`);
      failed++;
    }
  }
  
  console.log('\n=====================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Health Score: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('🎉 All systems operational!');
  } else {
    console.log('⚠️  Some systems need attention.');
  }
}

runHealthChecks().catch(console.error);
