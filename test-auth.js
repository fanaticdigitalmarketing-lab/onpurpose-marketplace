require('dotenv').config();
const https = require('https');
const http  = require('http');
const BASE  = process.env.TEST_URL || 'https://onpurpose.earth';
const STAMP = Date.now();
const EMAIL = `authtest_${STAMP}@testfix.com`;
const PASS  = 'AuthTest123!';

let token = null, refresh = null;

const P = '\x1b[32m✓\x1b[0m';
const F = '\x1b[31m✗\x1b[0m';
let pass = 0, fail = 0;

function req(method, path, body, authToken) {
  return new Promise((resolve, reject) => {
    const url  = new URL(BASE + path);
    const lib  = url.protocol === 'https:' ? https : http;
    const data = body ? JSON.stringify(body) : null;
    const r = lib.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: 'Bearer ' + authToken } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      }
    }, res => {
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

async function t(name, fn) {
  try {
    const ok = await fn();
    if (ok) { console.log(P, name); pass++; }
    else    { console.log(F, name); fail++; }
  } catch(e) {
    console.log(F, name, '—', e.message); fail++;
  }
}

async function run() {
  console.log('\n╔══ OnPurpose Auth Test Suite ══╗');
  console.log('║ Target:', BASE);
  console.log('╚════════════════════════════════╝\n');

  // Infrastructure
  await t('Server health check', async () => {
    const r = await req('GET', '/health');
    if (r.status !== 200) throw new Error('Status ' + r.status);
    return r.data.status === 'ok';
  });

  await t('Database connected', async () => {
    const r = await req('GET', '/api/health');
    return r.status === 200;
  });

  // Registration
  await t('Register new account → 201 + accessToken', async () => {
    const r = await req('POST', '/api/auth/register', {
      name: 'Auth Test User', email: EMAIL,
      password: PASS, role: 'customer'
    });
    if (r.status === 201 && r.data.accessToken) {
      token   = r.data.accessToken;
      refresh = r.data.refreshToken;
      return true;
    }
    throw new Error(r.status + ': ' + JSON.stringify(r.data));
  });

  await t('Response contains user object', async () => {
    const r = await req('POST', '/api/auth/register', {
      name: 'Second Test', email: `second_${STAMP}@testfix.com`,
      password: PASS, role: 'provider'
    });
    return r.data.user &&
           r.data.user.id &&
           r.data.user.email &&
           r.data.user.role === 'provider';
  });

  await t('Duplicate email → 409', async () => {
    const r = await req('POST', '/api/auth/register', {
      name: 'Dup', email: EMAIL, password: PASS, role: 'customer'
    });
    return r.status === 409;
  });

  await t('Short password → 400', async () => {
    const r = await req('POST', '/api/auth/register', {
      name: 'X', email: `short_${STAMP}@testfix.com`,
      password: 'abc', role: 'customer'
    });
    return r.status === 400;
  });

  await t('Missing name → 400', async () => {
    const r = await req('POST', '/api/auth/register', {
      email: `noname_${STAMP}@testfix.com`,
      password: PASS, role: 'customer'
    });
    return r.status === 400;
  });

  // Login
  await t('Login → 200 + accessToken', async () => {
    const r = await req('POST', '/api/auth/login',
      { email: EMAIL, password: PASS });
    if (r.status === 200 && r.data.data && r.data.data.accessToken) {
      token   = r.data.data.accessToken;
      refresh = r.data.data.refreshToken;
      return true;
    }
    // Also check if response is in old format
    if (r.status === 200 && r.data.accessToken) {
      token   = r.data.accessToken;
      refresh = r.data.refreshToken;
      return true;
    }
    throw new Error(r.status + ': ' + JSON.stringify(r.data));
  });

  await t('Wrong password → 401', async () => {
    const r = await req('POST', '/api/auth/login',
      { email: EMAIL, password: 'WrongPass999!' });
    return r.status === 401;
  });

  await t('Unknown email → 401', async () => {
    const r = await req('POST', '/api/auth/login',
      { email: `nobody_${STAMP}@testfix.com`, password: PASS });
    return r.status === 401;
  });

  // Auth token usage
  await t('Valid token → protected route works', async () => {
    if (!token) return false;
    const r = await req('GET', '/api/users/profile', null, token);
    return r.status === 200 && r.data.success;
  });

  await t('No token → 401', async () => {
    const r = await req('GET', '/api/users/profile');
    return r.status === 401;
  });

  await t('Garbage token → 401', async () => {
    const r = await req('GET', '/api/users/profile', null, 'not.a.jwt');
    return r.status === 401;
  });

  await t('Token refresh → 200 + new accessToken', async () => {
    if (!refresh) return false;
    const r = await req('POST', '/api/auth/refresh',
      { refreshToken: refresh });
    // Check new format
    if (r.status === 200 && r.data.data && r.data.data.accessToken) {
      return true;
    }
    // Check old format
    if (r.status === 200 && r.data.accessToken) {
      return true;
    }
    return false;
  });

  // Results
  console.log('\n╔════════════════════════════════╗');
  console.log('║ ' + pass + '/' + (pass+fail) +
    ' tests passed' + ' '.repeat(17-String(pass+fail).length) + '║');
  console.log('╚════════════════════════════════╝\n');

  if (fail === 0) {
    console.log('\x1b[32m  ✓ Auth system is working correctly.\x1b[0m');
    console.log('  📧 Check onpurposeearth@gmail.com for signup alert.\n');
    process.exit(0);
  } else {
    console.log('\x1b[31m  ✗ ' + fail + ' test(s) failed.\x1b[0m');
    console.log('  Fix the failing tests above. Show me the error output.\n');
    process.exit(1);
  }
}

run().catch(e => {
  console.error('Test crashed:', e.message);
  process.exit(1);
});
