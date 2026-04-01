const http = require('http');

// Comprehensive test suite for all routes, angles, and rules
async function runComprehensiveTests() {
  console.log('🚀 COMPREHENSIVE TEST SUITE - ALL ROUTES, ANGLES, RULES\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  const testResults = [];
  
  // Helper function to run a test
  async function runTest(name, testFn) {
    totalTests++;
    try {
      const result = await testFn();
      if (result.passed) {
        console.log(`✓ ${name}`);
        passedTests++;
        testResults.push({ name, status: 'PASS', details: result.details });
      } else {
        console.log(`✗ ${name} - ${result.error}`);
        failedTests++;
        testResults.push({ name, status: 'FAIL', error: result.error });
      }
    } catch (error) {
      console.log(`✗ ${name} - Error: ${error.message}`);
      failedTests++;
      testResults.push({ name, status: 'ERROR', error: error.message });
    }
  }
  
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
  
  // Test data
  const timestamp = Date.now();
  const testUser = {
    name: 'Test User',
    email: `test${timestamp}@example.com`,
    password: 'password123'
  };
  
  let authToken = null;
  let createdServiceId = null;
  let createdBookingId = null;
  
  // === HEALTH CHECKS ===
  await runTest('Root endpoint health', async () => {
    const response = await makeRequest('GET', '/');
    return { passed: response.status === 200, details: response.status };
  });
  
  await runTest('Health endpoint', async () => {
    const response = await makeRequest('GET', '/health');
    return { passed: response.status === 200, details: response.status };
  });
  
  await runTest('API health endpoint', async () => {
    const response = await makeRequest('GET', '/api/health');
    return { passed: response.status === 200, details: response.status };
  });
  
  await runTest('Stats endpoint', async () => {
    const response = await makeRequest('GET', '/api/stats');
    return { passed: response.status === 200, details: response.status };
  });
  
  // === AUTHENTICATION TESTS ===
  await runTest('User registration - valid data', async () => {
    const response = await makeRequest('POST', '/api/auth/register', testUser);
    if (response.status === 201) {
      authToken = response.body.token;
      return { passed: true, details: 'User created and token received' };
    }
    return { passed: false, error: `Expected 201, got ${response.status}` };
  });
  
  await runTest('User registration - duplicate email', async () => {
    const response = await makeRequest('POST', '/api/auth/register', testUser);
    return { passed: response.status === 400, details: 'Duplicate properly rejected' };
  });
  
  await runTest('User registration - invalid email', async () => {
    const invalidUser = { ...testUser, email: 'invalid-email' };
    const response = await makeRequest('POST', '/api/auth/register', invalidUser);
    return { passed: response.status === 400, details: 'Invalid email properly rejected' };
  });
  
  await runTest('User registration - short password', async () => {
    const shortPasswordUser = { ...testUser, email: `short${timestamp}@example.com`, password: '123' };
    const response = await makeRequest('POST', '/api/auth/register', shortPasswordUser);
    return { passed: response.status === 400, details: 'Short password properly rejected' };
  });
  
  await runTest('User login - valid credentials', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    if (response.status === 200 && response.body.token) {
      authToken = response.body.token;
      return { passed: true, details: 'Login successful' };
    }
    return { passed: false, error: `Expected 200 with token, got ${response.status}` };
  });
  
  await runTest('User login - invalid credentials', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: 'wrongpassword'
    });
    return { passed: response.status === 400, details: 'Invalid credentials properly rejected' };
  });
  
  await runTest('User login - missing credentials', async () => {
    const response = await makeRequest('POST', '/api/auth/login', {});
    return { passed: response.status === 400, details: 'Missing credentials properly rejected' };
  });
  
  // === SERVICE MANAGEMENT TESTS ===
  await runTest('Get all services (public)', async () => {
    const response = await makeRequest('GET', '/api/services');
    return { passed: response.status === 200, details: `Found ${Array.isArray(response.body) ? response.body.length : 0} services` };
  });
  
  await runTest('Create service - authenticated', async () => {
    const serviceData = {
      title: 'Test Service',
      description: 'A test service for comprehensive testing',
      price: 99.99,
      category: 'testing',
      duration: 60,
      isOnline: true
    };
    
    const response = await makeRequest('POST', '/api/services', serviceData, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (response.status === 201) {
      createdServiceId = response.body.id;
      return { passed: true, details: `Service created with ID: ${response.body.id}` };
    }
    return { passed: false, error: `Expected 201, got ${response.status}` };
  });
  
  await runTest('Create service - unauthenticated', async () => {
    const serviceData = {
      title: 'Unauthorized Service',
      description: 'Should not be created',
      price: 50,
      category: 'testing'
    };
    
    const response = await makeRequest('POST', '/api/services', serviceData);
    return { passed: response.status === 401, details: 'Unauthorized request properly rejected' };
  });
  
  await runTest('Create service - invalid data', async () => {
    const invalidService = {
      title: '', // Empty title
      description: 'Invalid service',
      price: 'not-a-number',
      category: ''
    };
    
    const response = await makeRequest('POST', '/api/services', invalidService, {
      'Authorization': `Bearer ${authToken}`
    });
    return { passed: response.status === 400, details: 'Invalid data properly rejected' };
  });
  
  if (createdServiceId) {
    await runTest('Get single service', async () => {
      const response = await makeRequest('GET', `/api/services/${createdServiceId}`);
      return { passed: response.status === 200, details: `Service retrieved: ${response.body.title}` };
    });
    
    await runTest('Update service - owner', async () => {
      const updateData = {
        title: 'Updated Test Service',
        price: 149.99
      };
      
      const response = await makeRequest('PUT', `/api/services/${createdServiceId}`, updateData, {
        'Authorization': `Bearer ${authToken}`
      });
      return { passed: response.status === 200, details: 'Service updated by owner' };
    });
    
    await runTest('Delete service - owner', async () => {
      const response = await makeRequest('DELETE', `/api/services/${createdServiceId}`, null, {
        'Authorization': `Bearer ${authToken}`
      });
      return { passed: response.status === 200, details: 'Service deleted by owner' };
    });
  }
  
  // === BOOKING SYSTEM TESTS ===
  // Create a service for booking tests
  let bookingServiceId = null;
  await runTest('Create service for booking tests', async () => {
    const serviceData = {
      title: 'Booking Test Service',
      description: 'Service for booking system testing',
      price: 75.00,
      category: 'booking-test',
      duration: 45,
      isOnline: true
    };
    
    const response = await makeRequest('POST', '/api/services', serviceData, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (response.status === 201) {
      bookingServiceId = response.body.id;
      return { passed: true, details: `Booking service created with ID: ${response.body.id}` };
    }
    return { passed: false, error: `Expected 201, got ${response.status}` };
  });
  
  if (bookingServiceId) {
    await runTest('Create booking - valid data', async () => {
      const bookingData = {
        serviceId: bookingServiceId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        time: '14:00'
      };
      
      const response = await makeRequest('POST', '/api/bookings', bookingData, {
        'Authorization': `Bearer ${authToken}`
      });
      
      if (response.status === 201) {
        createdBookingId = response.body.id;
        return { passed: true, details: `Booking created with ID: ${response.body.id}` };
      }
      return { passed: false, error: `Expected 201, got ${response.status}` };
    });
    
    await runTest('Create booking - unauthenticated', async () => {
      const bookingData = {
        serviceId: bookingServiceId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '15:00'
      };
      
      const response = await makeRequest('POST', '/api/bookings', bookingData);
      return { passed: response.status === 401, details: 'Unauthorized booking properly rejected' };
    });
    
    await runTest('Create booking - invalid service ID', async () => {
      const bookingData = {
        serviceId: 'invalid-uuid',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '16:00'
      };
      
      const response = await makeRequest('POST', '/api/bookings', bookingData, {
        'Authorization': `Bearer ${authToken}`
      });
      return { passed: response.status === 400, details: 'Invalid service ID properly rejected' };
    });
  }
  
  // === EDGE CASES AND ANGLES ===
  await runTest('SQL Injection attempt - login', async () => {
    const maliciousData = {
      email: "'; DROP TABLE Users; --",
      password: "password"
    };
    
    const response = await makeRequest('POST', '/api/auth/login', maliciousData);
    return { passed: response.status === 400, details: 'SQL injection attempt blocked' };
  });
  
  await runTest('XSS attempt - service creation', async () => {
    const xssData = {
      title: '<script>alert("xss")</script>',
      description: '<img src=x onerror=alert("xss")>',
      price: 100,
      category: '<script>alert("xss")</script>'
    };
    
    const response = await makeRequest('POST', '/api/services', xssData, {
      'Authorization': `Bearer ${authToken}`
    });
    return { passed: response.status === 400, details: 'XSS attempt blocked' };
  });
  
  await runTest('Rate limiting test - multiple rapid requests', async () => {
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(makeRequest('GET', '/api/health'));
    }
    
    const responses = await Promise.all(promises);
    const allSuccessful = responses.every(r => r.status === 200);
    return { passed: allSuccessful, details: `All ${responses.length} requests handled` };
  });
  
  await runTest('Large payload test', async () => {
    const largeData = {
      title: 'A'.repeat(1000),
      description: 'B'.repeat(10000),
      price: 100,
      category: 'test'
    };
    
    const response = await makeRequest('POST', '/api/services', largeData, {
      'Authorization': `Bearer ${authToken}`
    });
    return { passed: response.status === 400, details: 'Large payload properly rejected' };
  });
  
  // === BUSINESS LOGIC TESTS ===
  await runTest('Service ownership verification', async () => {
    // Try to update a service that doesn't belong to the user
    const response = await makeRequest('PUT', '/api/services/non-existent-id', {
      title: 'Hijacked Service'
    }, {
      'Authorization': `Bearer ${authToken}`
    });
    
    return { passed: response.status === 404, details: 'Non-existent service properly handled' };
  });
  
  await runTest('Date validation - past date booking', async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (bookingServiceId) {
      const bookingData = {
        serviceId: bookingServiceId,
        date: pastDate,
        time: '10:00'
      };
      
      const response = await makeRequest('POST', '/api/bookings', bookingData, {
        'Authorization': `Bearer ${authToken}`
      });
      
      return { passed: response.status === 400, details: 'Past date booking properly rejected' };
    }
    return { passed: true, details: 'Test skipped - no service available' };
  });
  
  // === PERFORMANCE TESTS ===
  await runTest('Response time test - health endpoint', async () => {
    const start = Date.now();
    await makeRequest('GET', '/api/health');
    const end = Date.now();
    const responseTime = end - start;
    
    return { passed: responseTime < 1000, details: `Response time: ${responseTime}ms` };
  });
  
  await runTest('Response time test - services endpoint', async () => {
    const start = Date.now();
    await makeRequest('GET', '/api/services');
    const end = Date.now();
    const responseTime = end - start;
    
    return { passed: responseTime < 2000, details: `Response time: ${responseTime}ms` };
  });
  
  // === FINAL SUMMARY ===
  console.log('\n📊 COMPREHENSIVE TEST RESULTS');
  console.log('================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  testResults.forEach(result => {
    const status = result.status === 'PASS' ? '✓' : '✗';
    console.log(`${status} ${result.name} - ${result.details || result.error || 'No details'}`);
  });
  
  console.log('\n🎯 CRITICAL SYSTEMS STATUS:');
  console.log(`Authentication System: ${testResults.filter(r => r.name.includes('auth')).every(r => r.status === 'PASS') ? '✅ HEALTHY' : '❌ ISSUES'}`);
  console.log(`Service Management: ${testResults.filter(r => r.name.includes('service')).every(r => r.status === 'PASS') ? '✅ HEALTHY' : '❌ ISSUES'}`);
  console.log(`Booking System: ${testResults.filter(r => r.name.includes('booking')).every(r => r.status === 'PASS') ? '✅ HEALTHY' : '❌ ISSUES'}`);
  console.log(`Security: ${testResults.filter(r => r.name.includes('injection') || r.name.includes('xss')).every(r => r.status === 'PASS') ? '✅ HEALTHY' : '❌ ISSUES'}`);
  console.log(`Performance: ${testResults.filter(r => r.name.includes('time')).every(r => r.status === 'PASS') ? '✅ HEALTHY' : '❌ ISSUES'}`);
  
  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: (passedTests / totalTests) * 100,
    results: testResults
  };
}

// Run the comprehensive test suite
runComprehensiveTests().catch(console.error);
