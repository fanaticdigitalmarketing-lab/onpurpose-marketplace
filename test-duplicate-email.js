const http = require('http');

// Test duplicate email handling
async function testDuplicateEmail() {
  console.log('=== DUPLICATE EMAIL TEST ===\n');
  
  try {
    // First registration
    const data1 = JSON.stringify({
      name: 'Test User',
      email: 'duplicate@example.com',
      password: 'password123'
    });
    
    const options1 = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data1.length
      }
    };
    
    const response1 = await new Promise((resolve, reject) => {
      const req = http.request(options1, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.write(data1);
      req.end();
    });
    
    console.log('First registration:', response1.status);
    
    // Second registration with same email
    const data2 = JSON.stringify({
      name: 'Test User 2',
      email: 'duplicate@example.com',
      password: 'password456'
    });
    
    const options2 = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data2.length
      }
    };
    
    const response2 = await new Promise((resolve, reject) => {
      const req = http.request(options2, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.write(data2);
      req.end();
    });
    
    console.log('Duplicate registration:', response2.status);
    console.log('Response body:', response2.body);
    
    if (response2.status === 400) {
      console.log('✓ Duplicate email properly rejected');
    } else {
      console.log('✗ Duplicate email not properly handled');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDuplicateEmail();
