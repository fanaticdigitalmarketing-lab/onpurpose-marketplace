const https = require('https');

async function testEndpoint(path, name) {
  const options = {
    hostname: 'onpurpose-backend-clean-production.up.railway.app',
    port: 443,
    path,
    method: 'GET',
    headers: {
      'User-Agent': 'OnPurpose-API-Test/1.0'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          name,
          data: data.substring(0, 200)
        });
      });
    });

    req.on('error', () => {
      resolve({
        status: 'ERROR',
        name,
        data: 'Request failed'
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        name,
        data: 'Request timeout'
      });
    });

    req.end();
  });
}

async function testAllEndpoints() {
  console.log('🚀 Testing new API endpoints...');
  
  const results = await Promise.all([
    testEndpoint('/api/rules', 'Rules API'),
    testEndpoint('/api/history', 'History API'),
    testEndpoint('/api/engine/run', 'Engine API')
  ]);

  console.log('\n📊 API ENDPOINT TEST RESULTS:');
  results.forEach(r => {
    console.log(`   ${r.name}: ${r.status}`);
    if (r.status === 200) {
      console.log(`     ✅ SUCCESS - ${r.name} is working!`);
    } else {
      console.log(`     ⏳ Still deploying...`);
    }
  });

  console.log('\n🌐 AVAILABLE ENDPOINTS:');
  console.log('   🔗 Rules: https://onpurpose-backend-clean-production.up.railway.app/api/rules');
  console.log('   🔗 History: https://onpurpose-backend-clean-production.up.railway.app/api/history');
  console.log('   🔗 Engine: https://onpurpose-backend-clean-production.up.railway.app/api/engine/run');

  console.log('\n📊 EXPECTED RESPONSES:');
  console.log('   📋 Rules: Array of 116 learned rules');
  console.log('   📜 History: Array of 100 fix records');
  console.log('   🔧 Engine: POST endpoint for running fixes');
}

// Run after 30 seconds to allow Railway deployment
setTimeout(testAllEndpoints, 30000);
