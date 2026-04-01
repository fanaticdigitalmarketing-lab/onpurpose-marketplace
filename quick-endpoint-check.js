// Quick endpoint check while server is running
const http = require('http');

async function checkEndpoint(path) {
  return new Promise((resolve) => {
    const req = http.get({
      hostname: 'localhost',
      port: 3000,
      path: path,
      timeout: 1000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          success: res.statusCode < 400,
          data: data.substring(0, 100)
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({ error: error.message, success: false });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Timeout', success: false });
    });
  });
}

async function runQuickCheck() {
  console.log('🔍 Quick endpoint check...');
  
  const endpoints = [
    '/api/ideas/trending',
    '/api/ideas/generate-advanced',
    '/api/referrals/generate'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const result = await checkEndpoint(endpoint);
      console.log(`${endpoint}: ${result.status || 'ERROR'} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.log(`${endpoint}: ERROR - ${error.message}`);
    }
  }
}

runQuickCheck();
