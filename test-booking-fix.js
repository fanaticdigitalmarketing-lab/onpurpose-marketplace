const http = require('http');

// Quick fix test for booking issues
async function testBookingFix() {
  console.log('🔧 BOOKING FIX TESTS\n');
  
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
  
  // Get auth token
  const loginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'test1725069750000@example.com',
    password: 'password123'
  });
  
  if (loginResponse.status !== 200) {
    console.log('❌ Login failed');
    return;
  }
  
  const token = loginResponse.body.token;
  console.log('✅ Login successful');
  
  // Create a service for testing
  const serviceData = {
    title: 'Booking Test Service',
    description: 'Service for booking testing',
    price: 75.00,
    category: 'booking-test',
    duration: 45,
    isOnline: true
  };
  
  const serviceResponse = await makeRequest('POST', '/api/services', serviceData, {
    'Authorization': `Bearer ${token}`
  });
  
  if (serviceResponse.status !== 201) {
    console.log('❌ Service creation failed:', serviceResponse.body);
    return;
  }
  
  const serviceId = serviceResponse.body.id;
  console.log('✅ Service created:', serviceId);
  
  // Test booking with proper date format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  const bookingData = {
    serviceId: serviceId,
    date: dateStr,
    time: '14:00'
  };
  
  console.log('📅 Booking data:', bookingData);
  
  const bookingResponse = await makeRequest('POST', '/api/bookings', bookingData, {
    'Authorization': `Bearer ${token}`
  });
  
  console.log('📊 Booking response:', bookingResponse.status, bookingResponse.body);
  
  if (bookingResponse.status === 201) {
    console.log('✅ Booking creation successful');
  } else {
    console.log('❌ Booking creation failed');
  }
}

testBookingFix().catch(console.error);
