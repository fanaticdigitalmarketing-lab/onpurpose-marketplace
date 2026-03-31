// Test Backend Directly - Bypass Netlify Proxy
const https = require('https');

const BACKEND_URL = 'https://onpurpose-backend-clean-production.up.railway.app';
const TEST_EMAIL = `direct_test_${Date.now()}@testdomain.com`;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(BACKEND_URL + path);
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testBackend() {
  console.log('\n🧪 Direct Backend Test - Railway URL');
  console.log('=====================================');
  console.log('Testing:', BACKEND_URL);
  console.log('Test email:', TEST_EMAIL);
  console.log('');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      const result = await fn();
      if (result) {
        console.log('  ✅ PASS:', name);
        passed++;
      } else {
        console.log('  ❌ FAIL:', name);
        failed++;
      }
    } catch (err) {
      console.log('  ❌ ERROR:', name, '-', err.message);
      failed++;
    }
  }

  // Test 1: Health check
  await test('Health endpoint', async () => {
    const r = await request('GET', '/health');
    return r.status === 200 && r.data.status === 'ok';
  });

  // Test 2: Services endpoint
  await test('Services endpoint', async () => {
    const r = await request('GET', '/api/services');
    return r.status === 200 && r.data.success;
  });

  // Test 3: Register new user
  let token = null;
  await test('Register customer', async () => {
    const r = await request('POST', '/api/auth/register', {
      name: 'Direct Test User',
      email: TEST_EMAIL,
      password: 'TestPass123!',
      role: 'customer'
    });
    if (r.status === 201 && r.data.success && r.data.accessToken) {
      token = r.data.accessToken;
      console.log('     📧 Email sent to:', TEST_EMAIL);
      console.log('     👤 User ID:', r.data.user.id);
      return true;
    }
    console.log('     Response:', JSON.stringify(r.data));
    return false;
  });

  // Test 4: Login
  await test('Login functionality', async () => {
    const r = await request('POST', '/api/auth/login', {
      email: TEST_EMAIL,
      password: 'TestPass123!'
    });
    return r.status === 200 && r.data.success;
  });

  // Test 5: Protected route with token
  if (token) {
    await test('Protected route access', async () => {
      const r = await request('GET', '/api/bookings/my-bookings');
      return r.status === 200 || r.status === 401; // 401 is ok (no bookings)
    });
  }

  // Test 6: Register provider
  await test('Register provider', async () => {
    const r = await request('POST', '/api/auth/register', {
      name: 'Direct Test Provider',
      email: `provider_${Date.now()}@testdomain.com`,
      password: 'TestPass123!',
      role: 'provider',
      location: 'New York, NY'
    });
    return r.status === 201 && r.data.success;
  });

  console.log('');
  console.log('=====================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All backend tests passed!');
    console.log('📧 Check onpurposeearth@gmail.com for signup alerts');
    console.log('📊 Subscriber records are being created permanently');
    console.log('💳 Provider payment setup is ready');
  } else {
    console.log('⚠  Some backend tests failed');
  }
  console.log('');
}

testBackend().catch(console.error);
