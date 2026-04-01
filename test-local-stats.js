const http = require('http');

// Test local stats endpoint
async function testLocalStats() {
  console.log('=== LOCAL STATS TEST ===\n');
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/stats',
      method: 'GET'
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.end();
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);
    
    if (response.status === 200) {
      console.log('✓ GET /api/stats → 200');
    } else {
      console.log('✗ GET /api/stats →', response.status);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testLocalStats();
