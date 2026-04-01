const http = require('http');

// Test register request with debug
async function testRegisterError() {
  console.log('=== REGISTER ERROR DEBUG ===\n');
  
  try {
    const data = JSON.stringify({
      name: 'Error Test User',
      email: 'errortest@example.com',
      password: 'password123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testRegisterError();
