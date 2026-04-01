const https = require('https');

console.log('🚀 TESTING ALL ENDPOINTS - FINAL VERIFICATION');
console.log('==========================================');

const testEndpoint = async (path, name) => {
  const options = {
    hostname: 'onpurpose-backend-clean-production.up.railway.app',
    port: 443,
    path,
    method: 'GET',
    headers: {
      'User-Agent': 'OnPurpose-Final-Test/1.0'
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
          success: res.statusCode === 200,
          dataLength: data.length
        });
      });
    });

    req.on('error', () => {
      resolve({
        status: 'ERROR',
        name,
        success: false,
        dataLength: 0
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        name,
        success: false,
        dataLength: 0
      });
    });

    req.end();
  });
};

const testEngineEndpoint = async () => {
  const data = JSON.stringify({});
  const options = {
    hostname: 'onpurpose-backend-clean-production.up.railway.app',
    port: 443,
    path: '/api/engine/run',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          name: 'Engine API',
          success: res.statusCode === 200,
          data: responseData
        });
      });
    });

    req.on('error', () => {
      resolve({
        status: 'ERROR',
        name: 'Engine API',
        success: false,
        data: ''
      });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        name: 'Engine API',
        success: false,
        data: ''
      });
    });

    req.write(data);
    req.end();
  });
};

(async () => {
  const [rules, history, engine] = await Promise.all([
    testEndpoint('/api/rules', 'Rules API'),
    testEndpoint('/api/history', 'History API'),
    testEngineEndpoint()
  ]);

  console.log('\n📊 ENDPOINT TEST RESULTS:');
  [rules, history, engine].forEach(r => {
    console.log(`   ${r.name}: ${r.status} ${r.success ? '✅' : '❌'}`);
  });

  const allWorking = [rules, history, engine].every(r => r.success);

  if (allWorking) {
    console.log('\n🎉🎉🎉 ALL ENDPOINTS WORKING! 🎉🎉🎉');
    console.log('\n🌐 BROWSER ACCESS:');
    console.log('   Engine: https://onpurpose-backend-clean-production.up.railway.app/api/engine/run');
    console.log('   Rules: https://onpurpose-backend-clean-production.up.railway.app/api/rules');
    console.log('   History: https://onpurpose-backend-clean-production.up.railway.app/api/history');
    console.log('\n🎯 FULL AUTO SYSTEM COMPLETE!');
  } else {
    console.log('\n⚠️ Some endpoints may still be deploying...');
  }
})();
