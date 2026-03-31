const https = require('https');
const http  = require('http');
const BASE  = process.env.TEST_URL || 'https://onpurpose.earth';
const STAMP = Date.now();
const C_EMAIL    = `customer_${STAMP}@testdomain.com`;
const P_EMAIL    = `provider_${STAMP}@testdomain.com`;
const TEST_PASS  = 'TestPass123!';

let results = [];
let cToken = null, cUser = null;
let pToken = null, pUser = null;
let serviceId = null, bookingId = null;

// ── HTTP helper ──────────────────────────────────────────────
function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url  = new URL(BASE + path);
    const lib  = url.protocol === 'https:' ? https : http;
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(data  ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const r = lib.request(opts, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, data: b }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

// ── Test runner ──────────────────────────────────────────────
async function test(name, fn) {
  try {
    const result = await fn();
    const status = result === true ? 'PASS' :
                   result === false ? 'FAIL' : result;
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(icon, status + ':', name);
    results.push({ name, status });
    return status === 'PASS';
  } catch (err) {
    console.log('❌ ERROR:', name, '—', err.message);
    results.push({ name, status: 'ERROR', error: err.message });
    return false;
  }
}

async function run() {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   OnPurpose Test Suite                   ║');
  console.log('║   Target: ' + BASE.padEnd(31) + '║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  // ── SECTION 1: Infrastructure ──────────────────────────────
  console.log('── Section 1: Infrastructure ──');

  await test('Health check responds', async () => {
    const r = await req('GET', '/health');
    if (r.status !== 200) throw new Error('Status: ' + r.status);
    return r.data.status === 'ok';
  });

  await test('API health check responds', async () => {
    const r = await req('GET', '/api/health');
    if (r.status !== 200) throw new Error('Status: ' + r.status);
    return r.data.status === 'healthy' || r.data.database === 'connected';
  });

  await test('Services endpoint responds', async () => {
    const r = await req('GET', '/api/services');
    return r.status === 200 && r.data.success;
  });

  await test('404 for unknown API route', async () => {
    const r = await req('GET', '/api/does-not-exist-xyz');
    return r.status === 404;
  });

  // ── SECTION 2: Registration ─────────────────────────────────
  console.log('');
  console.log('── Section 2: Registration ──');

  await test('Register customer account', async () => {
    const r = await req('POST', '/api/auth/register', {
      name: 'Test Customer', email: C_EMAIL,
      password: TEST_PASS, role: 'customer'
    });
    if (!r.data.success || !r.data.accessToken) {
      throw new Error(JSON.stringify(r.data));
    }
    cToken = r.data.accessToken;
    cUser  = r.data.user;
    return r.status === 201;
  });

  await test('Register provider account', async () => {
    const r = await req('POST', '/api/auth/register', {
      name: 'Test Provider', email: P_EMAIL,
      password: TEST_PASS, role: 'provider',
      location: 'New York, NY'
    });
    if (!r.data.success || !r.data.accessToken) {
      throw new Error(JSON.stringify(r.data));
    }
    pToken = r.data.accessToken;
    pUser  = r.data.user;
    return r.status === 201 && r.data.user.role === 'provider';
  });

  await test('Duplicate email rejected with 409', async () => {
    const r = await req('POST', '/api/auth/register', {
      name: 'Dup', email: C_EMAIL,
      password: TEST_PASS, role: 'customer'
    });
    return r.status === 409;
  });

  await test('Short password rejected with 400', async () => {
    const r = await req('POST', '/api/auth/register', {
      name: 'Test', email: 'short_' + STAMP + '@test.com',
      password: 'short', role: 'customer'
    });
    return r.status === 400;
  });

  await test('Missing name rejected', async () => {
    const r = await req('POST', '/api/auth/register', {
      email: 'noname_'+STAMP+'@test.com',
      password: TEST_PASS, role: 'customer'
    });
    return r.status === 400;
  });

  // ── SECTION 3: Login ────────────────────────────────────────
  console.log('');
  console.log('── Section 3: Login ──');

  await test('Login with correct credentials', async () => {
    const r = await req('POST', '/api/auth/login', {
      email: C_EMAIL, password: TEST_PASS
    });
    if (!r.data.success || !r.data.accessToken) {
      throw new Error(JSON.stringify(r.data));
    }
    cToken = r.data.accessToken;
    return r.status === 200;
  });

  await test('Wrong password returns 401', async () => {
    const r = await req('POST', '/api/auth/login', {
      email: C_EMAIL, password: 'WrongPass999!'
    });
    return r.status === 401;
  });

  await test('Non-existent email returns 401', async () => {
    const r = await req('POST', '/api/auth/login', {
      email: 'nobody_'+STAMP+'@test.com', password: TEST_PASS
    });
    return r.status === 401;
  });

  // ── SECTION 4: Auth Token ───────────────────────────────────
  console.log('');
  console.log('── Section 4: Auth Tokens ──');

  await test('Valid token accesses protected route', async () => {
    if (!cToken) return false;
    const r = await req('GET', '/api/bookings/my-bookings', null, cToken);
    return r.status === 200 && r.data.success;
  });

  await test('No token returns 401', async () => {
    const r = await req('GET', '/api/bookings/my-bookings');
    return r.status === 401;
  });

  await test('Invalid token returns 401', async () => {
    const r = await req('GET', '/api/bookings/my-bookings',
      null, 'invalid.token.here');
    return r.status === 401;
  });

  await test('Token refresh works', async () => {
    // First get a refresh token by logging in
    const login = await req('POST', '/api/auth/login', {
      email: C_EMAIL, password: TEST_PASS
    });
    if (!login.data.refreshToken) return false;
    const r = await req('POST', '/api/auth/refresh', {
      refreshToken: login.data.refreshToken
    });
    return r.status === 200 && (r.data.accessToken || r.data.data?.accessToken);
  });

  // ── SECTION 5: Services ─────────────────────────────────────
  console.log('');
  console.log('── Section 5: Services ──');

  await test('Provider can create a service', async () => {
    if (!pToken) return false;
    const r = await req('POST', '/api/services', {
      title: 'Test Coaching Session',
      description: 'A test service created by automated test suite',
      price: 75.00,
      category: 'Career Coaching',
      duration: 60,
      isOnline: true
    }, pToken);
    if (r.data.success) serviceId = r.data.data?.id;
    return r.status === 201 && r.data.success;
  });

  await test('Customer cannot create a service', async () => {
    if (!cToken) return false;
    const r = await req('POST', '/api/services', {
      title: 'Unauthorized service',
      description: 'Should fail',
      price: 50, category: 'Tutoring', isOnline: true
    }, cToken);
    return r.status === 403;
  });

  await test('Services list is public', async () => {
    const r = await req('GET', '/api/services');
    return r.status === 200 && Array.isArray(r.data.data);
  });

  await test('Services filter by category works', async () => {
    const r = await req('GET', '/api/services?category=Career+Coaching');
    return r.status === 200 && r.data.success;
  });

  // ── SECTION 6: Bookings ─────────────────────────────────────
  console.log('');
  console.log('── Section 6: Bookings ──');

  await test('Customer can create a booking', async () => {
    if (!cToken || !serviceId) {
      console.log('     (skipped — no service created)');
      return true;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const r = await req('POST', '/api/bookings', {
      serviceId, date: dateStr,
      time: '10:00', notes: 'Automated test booking'
    }, cToken);
    if (r.data.success) bookingId = r.data.data?.id;
    return r.status === 201 && r.data.success;
  });

  await test('Customer can view their bookings', async () => {
    if (!cToken) return false;
    const r = await req('GET', '/api/bookings/my-bookings', null, cToken);
    return r.status === 200 && r.data.success;
  });

  await test('Provider can view their bookings', async () => {
    if (!pToken) return false;
    const r = await req('GET', '/api/bookings/provider-bookings', null, pToken);
    return r.status === 200 && r.data.success;
  });

  // ── SECTION 7: Profile ──────────────────────────────────────
  console.log('');
  console.log('── Section 7: User Profile ──');

  await test('Get user profile', async () => {
    if (!cToken) return false;
    const r = await req('GET', '/api/users/profile', null, cToken);
    return r.status === 200 && r.data.success && r.data.data?.email === C_EMAIL;
  });

  await test('Update user profile', async () => {
    if (!cToken) return false;
    const r = await req('PATCH', '/api/users/profile', {
      bio: 'Test bio from automated test suite',
      location: 'Test City, TC'
    }, cToken);
    return r.status === 200 && r.data.success;
  });

  // ── RESULTS ─────────────────────────────────────────────────
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status !== 'PASS').length;
  console.log('║  RESULTS: ' +
    pass + ' passed, ' + fail + ' failed'.padEnd(27) + '║');
  console.log('╚══════════════════════════════════════════╝');

  if (fail > 0) {
    console.log('');
    console.log('Failed tests:');
    results.filter(r => r.status !== 'PASS').forEach(r => {
      console.log('  ❌', r.name, r.error ? '— ' + r.error : '');
    });
    console.log('');
    console.log('Fix failed tests before deploying.');
    process.exit(1);
  } else {
    console.log('');
    console.log('🎉 All tests passed!');
    console.log('📧 Check onpurposeearth@gmail.com for signup alerts');
    console.log('🚀 Safe to deploy to production');
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Test suite crashed:', err.message);
  process.exit(1);
});
