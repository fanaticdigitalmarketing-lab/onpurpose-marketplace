const http = require('http');

async function testAPIEndpoints() {
  console.log('🔍 Testing OnPurpose API Endpoints\n');
  
  const baseUrl = 'http://localhost:3000';
  const endpoints = [
    { path: '/health', method: 'GET', expected: 200 },
    { path: '/api/auth', method: 'GET', expected: [404, 405] },
    { path: '/api/users', method: 'GET', expected: [401, 404, 405] },
    { path: '/api/hosts', method: 'GET', expected: [401, 404, 405] },
    { path: '/api/bookings', method: 'GET', expected: [401, 404, 405] },
    { path: '/api/payments', method: 'GET', expected: [401, 404, 405] },
    { path: '/api/admin', method: 'GET', expected: [401, 404, 405] }
  ];

  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest(baseUrl + endpoint.path);
      const statusCode = result.statusCode;
      const expectedCodes = Array.isArray(endpoint.expected) ? endpoint.expected : [endpoint.expected];
      
      if (expectedCodes.includes(statusCode)) {
        console.log(`✅ ${endpoint.path}: PASS (${statusCode})`);
      } else {
        console.log(`⚠️  ${endpoint.path}: UNEXPECTED (${statusCode}, expected ${endpoint.expected})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.path}: ERROR - ${error.message}`);
    }
  }
  
  console.log('\n📊 API Endpoint Testing Complete');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          data: data,
          headers: response.headers
        });
      });
    });
    
    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

testAPIEndpoints().catch(console.error);
