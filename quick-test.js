// Quick test for server endpoints
const http = require('http');

function testEndpoint(path) {
  return new Promise((resolve) => {
    const req = http.get({
      hostname: 'localhost',
      port: 3000,
      path: path,
      timeout: 2000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data.substring(0, 200)
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({ error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('Testing server endpoints...');
  
  const endpoints = [
    '/api/ideas/trending',
    '/api/ideas/generate-advanced',
    '/api/referrals/generate'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const result = await testEndpoint(endpoint);
      console.log(`Result:`, result);
    } catch (error) {
      console.log(`Error:`, error.message);
    }
  }
}

runTests();
