const http = require('http');

// Test booking with two different users
async function testTwoUserBooking() {
  console.log('🔧 TWO USER BOOKING TEST\n');
  
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
  
  // Create provider user
  const providerData = {
    name: 'Service Provider',
    email: `provider${Date.now()}@example.com`,
    password: 'password123'
  };
  
  const providerResponse = await makeRequest('POST', '/api/auth/register', providerData);
  
  if (providerResponse.status !== 201) {
    console.log('❌ Provider registration failed:', providerResponse.body);
    return;
  }
  
  const providerToken = providerResponse.body.token;
  console.log('✅ Provider registration successful');
  
  // Create a service
  const serviceData = {
    title: 'Professional Service',
    description: 'A professional service for booking',
    price: 150.00,
    category: 'professional',
    duration: 60,
    isOnline: true
  };
  
  const serviceResponse = await makeRequest('POST', '/api/services', serviceData, {
    'Authorization': `Bearer ${providerToken}`
  });
  
  if (serviceResponse.status !== 201) {
    console.log('❌ Service creation failed:', serviceResponse.body);
    return;
  }
  
  const serviceId = serviceResponse.body.id;
  console.log('✅ Service created:', serviceId);
  
  // Create customer user
  const customerData = {
    name: 'Service Customer',
    email: `customer${Date.now()}@example.com`,
    password: 'password123'
  };
  
  const customerResponse = await makeRequest('POST', '/api/auth/register', customerData);
  
  if (customerResponse.status !== 201) {
    console.log('❌ Customer registration failed:', customerResponse.body);
    return;
  }
  
  const customerToken = customerResponse.body.token;
  console.log('✅ Customer registration successful');
  
  // Test booking with customer
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
    'Authorization': `Bearer ${customerToken}`
  });
  
  console.log('📊 Booking response:', bookingResponse.status, bookingResponse.body);
  
  if (bookingResponse.status === 201) {
    console.log('✅ Booking creation successful');
    console.log('🎉 TWO-USER BOOKING SYSTEM WORKING!');
  } else {
    console.log('❌ Booking creation failed');
  }
}

testTwoUserBooking().catch(console.error);
