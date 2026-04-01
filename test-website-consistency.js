const http = require('http');

// Test to verify main website works like iOS version
async function testWebsiteConsistency() {
  console.log('🔍 TESTING WEBSITE CONSISTENCY WITH iOS VERSION\n');
  
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
  
  console.log('📱 TESTING MAIN WEBSITE FUNCTIONALITY\n');
  
  // Test 1: Main page loads
  await runTest('Main page loads with proper content', async () => {
    const response = await makeRequest('GET', '/');
    if (response.status === 200) {
      const content = response.rawBody;
      const hasOnPurposeTitle = content.includes('OnPurpose — Book People, Not Places');
      const hasDesignSystem = content.includes('--navy:#1a2744');
      const hasiOSOptimizations = content.includes('-webkit-tap-highlight-color: transparent');
      const hasModalSystem = content.includes('modal-overlay');
      const hasToastSystem = content.includes('toast');
      const hasAuthSystem = content.includes('openSignIn()');
      const hasServiceGrid = content.includes('services-grid');
      
      return { 
        passed: hasOnPurposeTitle && hasDesignSystem && hasiOSOptimizations && hasModalSystem && hasToastSystem && hasAuthSystem && hasServiceGrid,
        details: `Title: ${hasOnPurposeTitle}, Design System: ${hasDesignSystem}, iOS Optimizations: ${hasiOSOptimizations}, Modal: ${hasModalSystem}, Toast: ${hasToastSystem}, Auth: ${hasAuthSystem}, Services: ${hasServiceGrid}`
      };
    }
    return { passed: false, error: `Expected 200, got ${response.status}` };
  });
  
  // Test 2: API endpoints work
  await runTest('API endpoints are functional', async () => {
    const healthResponse = await makeRequest('GET', '/api/health');
    const servicesResponse = await makeRequest('GET', '/api/services');
    
    return { 
      passed: healthResponse.status === 200 && servicesResponse.status === 200,
      details: `Health: ${healthResponse.status}, Services: ${servicesResponse.status}`
    };
  });
  
  // Test 3: Authentication system works
  await runTest('Authentication system is functional', async () => {
    const timestamp = Date.now();
    const userData = {
      name: 'Test User',
      email: `consistency${timestamp}@example.com`,
      password: 'password123'
    };
    
    const registerResponse = await makeRequest('POST', '/api/auth/register', userData);
    
    if (registerResponse.status === 201 && registerResponse.body.token) {
      const loginResponse = await makeRequest('POST', '/api/auth/login', {
        email: userData.email,
        password: userData.password
      });
      
      return { 
        passed: loginResponse.status === 200 && loginResponse.body.token,
        details: `Register: ${registerResponse.status}, Login: ${loginResponse.status}`
      };
    }
    
    return { passed: false, error: `Registration failed: ${registerResponse.status}` };
  });
  
  // Test 4: Service creation works
  await runTest('Service creation system works', async () => {
    const timestamp = Date.now();
    const userData = {
      name: 'Provider User',
      email: `provider${timestamp}@example.com`,
      password: 'password123'
    };
    
    const registerResponse = await makeRequest('POST', '/api/auth/register', userData);
    
    if (registerResponse.status === 201 && registerResponse.body.token) {
      const serviceData = {
        title: 'Test Service',
        description: 'A test service for consistency checking',
        price: 99.99,
        category: 'testing',
        duration: 60,
        isOnline: true
      };
      
      const serviceResponse = await makeRequest('POST', '/api/services', serviceData, {
        'Authorization': `Bearer ${registerResponse.body.token}`
      });
      
      return { 
        passed: serviceResponse.status === 201,
        details: `Service creation: ${serviceResponse.status}`
      };
    }
    
    return { passed: false, error: `Provider registration failed` };
  });
  
  // Test 5: Booking system works
  await runTest('Booking system is functional', async () => {
    const timestamp = Date.now();
    
    // Create provider
    const providerData = {
      name: 'Service Provider',
      email: `provider${timestamp}@example.com`,
      password: 'password123'
    };
    
    const providerResponse = await makeRequest('POST', '/api/auth/register', providerData);
    
    if (providerResponse.status === 201) {
      // Create service
      const serviceData = {
        title: 'Bookable Service',
        description: 'Service for booking test',
        price: 150.00,
        category: 'booking-test',
        duration: 45,
        isOnline: true
      };
      
      const serviceResponse = await makeRequest('POST', '/api/services', serviceData, {
        'Authorization': `Bearer ${providerResponse.body.token}`
      });
      
      if (serviceResponse.status === 201) {
        // Create customer
        const customerData = {
          name: 'Service Customer',
          email: `customer${timestamp}@example.com`,
          password: 'password123'
        };
        
        const customerResponse = await makeRequest('POST', '/api/auth/register', customerData);
        
        if (customerResponse.status === 201) {
          // Create booking
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dateStr = tomorrow.toISOString().split('T')[0];
          
          const bookingData = {
            serviceId: serviceResponse.body.id,
            date: dateStr,
            time: '14:00'
          };
          
          const bookingResponse = await makeRequest('POST', '/api/bookings', bookingData, {
            'Authorization': `Bearer ${customerResponse.body.token}`
          });
          
          return { 
            passed: bookingResponse.status === 201,
            details: `Booking creation: ${bookingResponse.status}`
          };
        }
      }
    }
    
    return { passed: false, error: 'Booking system setup failed' };
  });
  
  console.log('\n🎨 TESTING DESIGN SYSTEM CONSISTENCY\n');
  
  // Test 6: Design system consistency
  await runTest('Design system matches iOS version', async () => {
    const response = await makeRequest('GET', '/');
    const content = response.rawBody;
    
    // Check for iOS design system elements
    const hasNavyColor = content.includes('--navy:#1a2744');
    const hasBlueColor = content.includes('--blue:#2563d4');
    const hasShadowSystem = content.includes('--shadow:0 4px 24px rgba(37,99,212,0.10)');
    const hasButtonStyles = content.includes('btn-primary');
    const hasCardStyles = content.includes('service-card');
    const hasResponsiveDesign = content.includes('@media(max-width:768px)');
    
    return { 
      passed: hasNavyColor && hasBlueColor && hasShadowSystem && hasButtonStyles && hasCardStyles && hasResponsiveDesign,
      details: `Colors: ${hasNavyColor && hasBlueColor}, Shadows: ${hasShadowSystem}, Buttons: ${hasButtonStyles}, Cards: ${hasCardStyles}, Responsive: ${hasResponsiveDesign}`
    };
  });
  
  // Test 7: iOS optimizations present
  await runTest('iOS optimizations are present', async () => {
    const response = await makeRequest('GET', '/');
    const content = response.rawBody;
    
    const hasTapHighlight = content.includes('-webkit-tap-highlight-color: transparent');
    const hasSmoothScrolling = content.includes('-webkit-overflow-scrolling: touch');
    const hasFontSmoothing = content.includes('-webkit-font-smoothing:antialiased');
    const hasAppearance = content.includes('-webkit-appearance: none');
    const hasSafeArea = content.includes('env(safe-area-inset');
    
    return { 
      passed: hasTapHighlight && hasSmoothScrolling && hasFontSmoothing && hasAppearance,
      details: `Tap Highlight: ${hasTapHighlight}, Smooth Scroll: ${hasSmoothScrolling}, Font Smoothing: ${hasFontSmoothing}, Appearance: ${hasAppearance}, Safe Area: ${hasSafeArea}`
    };
  });
  
  console.log('\n📊 FINAL RESULTS\n');
  console.log('================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 PERFECT! Main website works exactly like iOS version!');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('\n✅ GOOD! Main website mostly matches iOS version');
  } else {
    console.log('\n❌ NEEDS WORK! Main website has significant differences from iOS version');
  }
  
  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: (passedTests / totalTests) * 100
  };
}

// Run the consistency test
testWebsiteConsistency().catch(console.error);
