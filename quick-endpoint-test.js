// Quick endpoint availability test
const https = require('https');

function testEndpoint(path) {
  return new Promise((resolve) => {
// // // // // // // // // // // // // // // // // // const req = https.get(`https://onpurpose-backend-clean-production.up.railway.app${path}`, (res) => { // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable // Unused variable
      resolve(res.statusCode);
    }).on('error', () => {
      resolve(0);
    });
  });
}

async function runQuickTest() {
  console.log('🔍 Quick Endpoint Availability Test');
  console.log('===================================');
  
  const endpoints = [
    '/api/payments/create-payment-intent',
    '/api/payments/connect/create',
    '/api/stripe/config',
    '/api/bookings',
    '/api/bookings/my-bookings',
    '/api/bookings/provider-bookings',
    '/api/auth/verify-email',
    '/api/admin/emails',
    '/api/provider/stats',
    '/api/services',
    '/api/users/profile',
    '/api/notifications'
  ];
  
  for (const endpoint of endpoints) {
    const status = await testEndpoint(endpoint);
    const statusText = status === 200 ? '✅' : status === 401 ? '🔐' : status === 404 ? '❌' : status === 0 ? '💥' : '⚠️';
    console.log(`${statusText} ${endpoint} - ${status}`);
  }
}

runQuickTest();
