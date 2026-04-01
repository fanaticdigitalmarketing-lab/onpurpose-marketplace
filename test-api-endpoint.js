// Test specific API endpoints
const https = require('https');

function testEndpoint(method, path, body = null) {
  return new Promise((resolve) => {
    const url = new URL('https://onpurpose.earth' + path);
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({
            status: res.statusCode,
            data: parsed,
            success: res.statusCode < 400
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: responseBody,
            success: res.statusCode < 400
          });
        }
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
    if (data) req.write(data);
    req.end();
  });
}

async function testSpecificEndpoints() {
  console.log('🔍 TESTING SPECIFIC API ENDPOINTS');
  console.log('=====================================');

  // Test login
  console.log('\n📡 Testing login endpoint...');
  const loginResult = await testEndpoint('POST', '/api/auth/login', {
    email: 'test@example.com',
    password: 'test'
  });
  console.log(`Status: ${loginResult.status}`);
  console.log(`Response: ${JSON.stringify(loginResult.data, null, 2)}`);

  // Test user profile without token
  console.log('\n📡 Testing user profile without token...');
  const profileResult = await testEndpoint('GET', '/api/users/profile');
  console.log(`Status: ${profileResult.status}`);
  console.log(`Response: ${JSON.stringify(profileResult.data, null, 2)}`);

  // Test admin stats without token
  console.log('\n📡 Testing admin stats without token...');
  const statsResult = await testEndpoint('GET', '/api/stats');
  console.log(`Status: ${statsResult.status}`);
  console.log(`Response: ${JSON.stringify(statsResult.data, null, 2)}`);

  // Test file upload without token
  console.log('\n📡 Testing file upload without token...');
  const uploadResult = await testEndpoint('POST', '/api/users/avatar');
  console.log(`Status: ${uploadResult.status}`);
  console.log(`Response: ${JSON.stringify(uploadResult.data, null, 2)}`);

  // Test notifications without token
  console.log('\n📡 Testing notifications without token...');
  const notifResult = await testEndpoint('GET', '/api/notifications');
  console.log(`Status: ${notifResult.status}`);
  console.log(`Response: ${JSON.stringify(notifResult.data, null, 2)}`);

  // Test provider stats without token
  console.log('\n📡 Testing provider stats without token...');
  const providerStatsResult = await testEndpoint('GET', '/api/provider/stats');
  console.log(`Status: ${providerStatsResult.status}`);
  console.log(`Response: ${JSON.stringify(providerStatsResult.data, null, 2)}`);
}

testSpecificEndpoints().catch(console.error);
