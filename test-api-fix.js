const https = require('https');

function testEndpoint(path) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'onpurpose.earth',
      path: path,
      method: 'GET'
    }, (res) => {
      console.log(`GET ${path}: ${res.statusCode} ${res.statusCode === 404 ? '✅' : '❌'}`);
      resolve(res.statusCode);
    });
    req.on('error', () => {
      console.log(`GET ${path}: Network Error ❌`);
      resolve(0);
    });
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`GET ${path}: Timeout ❌`);
      resolve(0);
    });
    req.end();
  });
}

async function testAPI() {
  console.log('🔌 Testing API 404 fix:');
  await testEndpoint('/nonexistent');
  await testEndpoint('/api/nonexistent');
  await testEndpoint('/api/definitely-not-a-route');
}

testAPI();
