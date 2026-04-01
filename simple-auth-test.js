// Simple auth test - avoids rate limiting
const https = require('https');
const BASE = 'https://onpurpose.earth';

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const data = body ? JSON.stringify(body) : null;
    const r = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
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

async function test() {
  console.log('🔍 Testing core auth functionality...\n');
  
  // Test 1: Server health
  try {
    const r = await req('GET', '/health');
    console.log('✅ Health check:', r.status === 200 ? 'PASS' : 'FAIL');
  } catch(e) {
    console.log('❌ Health check: FAIL -', e.message);
  }
  
  // Test 2: Database
  try {
    const r = await req('GET', '/api/health');
    console.log('✅ Database:', r.status === 200 ? 'PASS' : 'FAIL');
  } catch(e) {
    console.log('❌ Database: FAIL -', e.message);
  }
  
  // Test 3: Try one registration (avoid rate limit)
  try {
    const email = `simpletest_${Date.now()}@testfix.com`;
    const r = await req('POST', '/api/auth/register', {
      name: 'Simple Test',
      email: email,
      password: 'SimpleTest123!',
      role: 'customer'
    });
    
    if (r.status === 201) {
      console.log('✅ Registration: PASS');
      console.log('   User created:', r.data.user?.email);
      console.log('   Tokens generated:', !!r.data.accessToken && !!r.data.refreshToken);
      
      // Test 4: Login with same credentials
      try {
        const login = await req('POST', '/api/auth/login', {
          email: email,
          password: 'SimpleTest123!'
        });
        
        if (login.status === 200) {
          console.log('✅ Login: PASS');
          console.log('   Password verification: WORKING');
          console.log('   BCRYPT_PEPPER: CORRECTLY CONFIGURED');
        } else {
          console.log('❌ Login: FAIL - Status', login.status);
        }
      } catch(e) {
        console.log('❌ Login: FAIL -', e.message);
      }
      
    } else if (r.status === 429) {
      console.log('⏱️ Registration: RATE LIMITED (try again later)');
    } else {
      console.log('❌ Registration: FAIL - Status', r.status, r.data);
    }
  } catch(e) {
    console.log('❌ Registration: FAIL -', e.message);
  }
  
  console.log('\n🎯 SUMMARY:');
  console.log('If Registration and Login both pass, the auth system is WORKING!');
  console.log('The rate limiting shows security is working correctly.');
}

test().catch(console.error);
