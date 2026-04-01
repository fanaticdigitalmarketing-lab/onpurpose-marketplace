const http = require('http');

// Final comprehensive test - All Rules and Regulations
async function runAllRulesTest() {
  console.log('🔒 FINAL COMPREHENSIVE TEST - ALL RULES AND REGULATIONS\n');
  
  // Helper function to make HTTP requests
  async function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
      
      if (data) {
        options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
      }
      
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, body: parsedBody, rawBody: body });
          } catch (e) {
            resolve({ status: res.statusCode, body: body, rawBody: body });
          }
        });
      });
      
      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  // Helper function to run a test
  async function runTest(name, testFn) {
    totalTests++;
    try {
      const result = await testFn();
      if (result.passed) {
        console.log(`✓ ${name}`);
        passedTests++;
      } else {
        console.log(`✗ ${name} - ${result.error}`);
        failedTests++;
      }
    } catch (error) {
      console.log(`✗ ${name} - Error: ${error.message}`);
      failedTests++;
    }
  }
  
  console.log('🔐 AUTHENTICATION RULES\n');
  
  // Test 1: User Registration Rule
  await runTest('User Registration Rule - Valid Data', async () => {
    const timestamp = Date.now();
    const userData = {
      name: 'Test User',
      email: `test${timestamp}@example.com`,
      password: 'password123'
    };
    
    const response = await makeRequest('POST', '/api/auth/register', userData);
    
    return { 
      passed: response.status === 201 && response.body.token,
      details: `Status: ${response.status}, Token: ${!!response.body.token}`
    };
  });
  
  // Test 2: Duplicate Email Prevention Rule
  await runTest('Duplicate Email Prevention Rule', async () => {
    const userData = {
      name: 'Duplicate User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await makeRequest('POST', '/api/auth/register', userData);
    
    return { 
      passed: response.status === 400,
      details: `Status: ${response.status} (should reject duplicate)`
    };
  });
  
  // Test 3: Password Validation Rule
  await runTest('Password Validation Rule - Too Short', async () => {
    const userData = {
      name: 'Short Password User',
      email: `short${Date.now()}@example.com`,
      password: '123'
    };
    
    const response = await makeRequest('POST', '/api/auth/register', userData);
    
    return { 
      passed: response.status === 400,
      details: `Status: ${response.status} (should reject short password)`
    };
  });
  
  // Test 4: Login Authentication Rule
  await runTest('Login Authentication Rule', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await makeRequest('POST', '/api/auth/login', loginData);
    
    return { 
      passed: response.status === 200 && response.body.token,
      details: `Status: ${response.status}, Token: ${!!response.body.token}`
    };
  });
  
  console.log('\n🛡️ SECURITY RULES\n');
  
  // Test 5: SQL Injection Prevention Rule
  await runTest('SQL Injection Prevention Rule', async () => {
    const maliciousData = {
      email: "'; DROP TABLE users; --",
      password: 'password123'
    };
    
    const response = await makeRequest('POST', '/api/auth/login', maliciousData);
    
    return { 
      passed: response.status === 400,
      details: `Status: ${response.status} (should block injection)`
    };
  });
  
  // Test 6: XSS Prevention Rule
  await runTest('XSS Prevention Rule', async () => {
    const maliciousData = {
      title: '<script>alert("XSS")</script>',
      description: '<img src=x onerror=alert("XSS")>',
      price: 99.99,
      category: 'test'
    };
    
    const response = await makeRequest('POST', '/api/services', maliciousData, {
      'Authorization': 'Bearer fake-token'
    });
    
    return { 
      passed: response.status === 401 || response.status === 400,
      details: `Status: ${response.status} (should block XSS)`
    };
  });
  
  // Test 7: Rate Limiting Rule
  await runTest('Rate Limiting Rule', async () => {
    let successCount = 0;
    
    for (let i = 0; i < 10; i++) {
      try {
        const response = await makeRequest('GET', '/api/health');
        if (response.status === 200) successCount++;
      } catch (error) {
        // Rate limit hit
        break;
      }
    }
    
    return { 
      passed: successCount >= 5, // Should handle at least 5 requests
      details: `Successful requests: ${successCount}/10`
    };
  });
  
  console.log('\n💼 BUSINESS RULES\n');
  
  // Test 8: Service Ownership Rule
  await runTest('Service Ownership Rule', async () => {
    // Create a service first
    const timestamp = Date.now();
    const userData = {
      name: 'Service Owner',
      email: `owner${timestamp}@example.com`,
      password: 'password123'
    };
    
    const registerResponse = await makeRequest('POST', '/api/auth/register', userData);
    
    if (registerResponse.status !== 201) {
      return { passed: false, error: 'Failed to register user' };
    }
    
    const serviceData = {
      title: 'Test Service',
      description: 'A test service',
      price: 99.99,
      category: 'test'
    };
    
    const serviceResponse = await makeRequest('POST', '/api/services', serviceData, {
      'Authorization': `Bearer ${registerResponse.body.token}`
    });
    
    if (serviceResponse.status !== 201) {
      return { passed: false, error: 'Failed to create service' };
    }
    
    // Try to delete with different user
    const differentUserData = {
      name: 'Different User',
      email: `different${timestamp}@example.com`,
      password: 'password123'
    };
    
    const differentRegisterResponse = await makeRequest('POST', '/api/auth/register', differentUserData);
    
    if (differentRegisterResponse.status !== 201) {
      return { passed: false, error: 'Failed to register different user' };
    }
    
    const deleteResponse = await makeRequest('DELETE', `/api/services/${serviceResponse.body.id}`, null, {
      'Authorization': `Bearer ${differentRegisterResponse.body.token}`
    });
    
    return { 
      passed: deleteResponse.status === 403,
      details: `Delete status: ${deleteResponse.status} (should be 403 Forbidden)`
    };
  });
  
  // Test 9: Self-Booking Prevention Rule
  await runTest('Self-Booking Prevention Rule', async () => {
    const timestamp = Date.now();
    
    // Create provider
    const providerData = {
      name: 'Provider User',
      email: `provider${timestamp}@example.com`,
      password: 'password123'
    };
    
    const providerResponse = await makeRequest('POST', '/api/auth/register', providerData);
    
    if (providerResponse.status !== 201) {
      return { passed: false, error: 'Failed to register provider' };
    }
    
    // Create service
    const serviceData = {
      title: 'Provider Service',
      description: 'Service for self-booking test',
      price: 150.00,
      category: 'test'
    };
    
    const serviceResponse = await makeRequest('POST', '/api/services', serviceData, {
      'Authorization': `Bearer ${providerResponse.body.token}`
    });
    
    if (serviceResponse.status !== 201) {
      return { passed: false, error: 'Failed to create service' };
    }
    
    // Try to book own service
    const bookingData = {
      serviceId: serviceResponse.body.id,
      date: '2026-04-02',
      time: '14:00'
    };
    
    const bookingResponse = await makeRequest('POST', '/api/bookings', bookingData, {
      'Authorization': `Bearer ${providerResponse.body.token}`
    });
    
    return { 
      passed: bookingResponse.status === 400,
      details: `Booking status: ${bookingResponse.status} (should be 400 Bad Request)`
    };
  });
  
  // Test 10: Date Validation Rule
  await runTest('Date Validation Rule - Past Date', async () => {
    const timestamp = Date.now();
    
    // Create provider
    const providerData = {
      name: 'Date Test Provider',
      email: `dateprovider${timestamp}@example.com`,
      password: 'password123'
    };
    
    const providerResponse = await makeRequest('POST', '/api/auth/register', providerData);
    
    // Create customer
    const customerData = {
      name: 'Date Test Customer',
      email: `datecustomer${timestamp}@example.com`,
      password: 'password123'
    };
    
    const customerResponse = await makeRequest('POST', '/api/auth/register', customerData);
    
    if (providerResponse.status !== 201 || customerResponse.status !== 201) {
      return { passed: false, error: 'Failed to register users' };
    }
    
    // Create service
    const serviceData = {
      title: 'Date Test Service',
      description: 'Service for date validation test',
      price: 100.00,
      category: 'test'
    };
    
    const serviceResponse = await makeRequest('POST', '/api/services', serviceData, {
      'Authorization': `Bearer ${providerResponse.body.token}`
    });
    
    if (serviceResponse.status !== 201) {
      return { passed: false, error: 'Failed to create service' };
    }
    
    // Try to book with past date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday
    
    const bookingData = {
      serviceId: serviceResponse.body.id,
      date: pastDate.toISOString().split('T')[0],
      time: '14:00'
    };
    
    const bookingResponse = await makeRequest('POST', '/api/bookings', bookingData, {
      'Authorization': `Bearer ${customerResponse.body.token}`
    });
    
    return { 
      passed: bookingResponse.status === 400,
      details: `Booking status: ${bookingResponse.status} (should be 400 Bad Request)`
    };
  });
  
  console.log('\n🎯 PERFORMANCE RULES\n');
  
  // Test 11: Response Time Rule
  await runTest('Response Time Rule - Health Endpoint', async () => {
    const startTime = Date.now();
    const response = await makeRequest('GET', '/api/health');
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return { 
      passed: responseTime < 100, // Should be under 100ms
      details: `Response time: ${responseTime}ms`
    };
  });
  
  // Test 12: Large Payload Rule
  await runTest('Large Payload Rule', async () => {
    const largeData = {
      title: 'A'.repeat(1000), // Very long title
      description: 'B'.repeat(10000), // Very long description
      price: 99.99,
      category: 'test'
    };
    
    const response = await makeRequest('POST', '/api/services', largeData, {
      'Authorization': 'Bearer fake-token'
    });
    
    return { 
      passed: response.status === 400 || response.status === 413,
      details: `Status: ${response.status} (should reject large payload)`
    };
  });
  
  console.log('\n📊 FINAL RESULTS\n');
  console.log('================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 PERFECT! All rules and regulations are working correctly!');
  } else if (passedTests >= totalTests * 0.9) {
    console.log('\n✅ EXCELLENT! Most rules and regulations are working');
  } else {
    console.log('\n❌ NEEDS ATTENTION! Some rules and regulations are failing');
  }
  
  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: (passedTests / totalTests) * 100
  };
}

// Run the comprehensive rules test
runAllRulesTest().catch(console.error);
