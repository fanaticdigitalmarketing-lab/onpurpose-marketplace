require('dotenv').config();
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Helper to make HTTP requests
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();
  return { status: response.status, data };
}

// Test functions
const tests = [
  {
    name: 'GET /health → 200',
    test: async () => {
      const { status, data } = await request('/health');
      return status === 200;
    }
  },
  {
    name: 'GET /api/health → 200 database connected',
    test: async () => {
      const { status, data } = await request('/api/health');
      return status === 200 && data.database;
    }
  },
  {
    name: 'POST /api/auth/register → 201 + accessToken + user object',
    test: async () => {
      const timestamp = Date.now();
      const { status, data } = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: `test_${timestamp}@test.com`,
          password: 'TestPass123!',
          role: 'customer'
        })
      });
      return status === 201 && data.success && data.accessToken && data.user;
    }
  },
  {
    name: 'POST /api/auth/register same email → 409',
    test: async () => {
      const email = 'duplicate@test.com';
      // First registration
      await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: email,
          password: 'TestPass123!',
          role: 'customer'
        })
      });
      // Second registration with same email
      const { status } = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User 2',
          email: email,
          password: 'TestPass123!',
          role: 'customer'
        })
      });
      return status === 409;
    }
  },
  {
    name: 'POST /api/auth/register short password → 400',
    test: async () => {
      const { status } = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'short@test.com',
          password: '123',
          role: 'customer'
        })
      });
      return status === 400;
    }
  },
  {
    name: 'POST /api/auth/register missing name → 400',
    test: async () => {
      const { status } = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'noname@test.com',
          password: 'TestPass123!',
          role: 'customer'
        })
      });
      return status === 400;
    }
  },
  {
    name: 'POST /api/auth/login correct → 200 + accessToken',
    test: async () => {
      const timestamp = Date.now();
      const email = `login_${timestamp}@test.com`;
      // Register first
      await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: email,
          password: 'TestPass123!',
          role: 'customer'
        })
      });
      // Then login
      const { status, data } = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          password: 'TestPass123!'
        })
      });
      return status === 200 && data.success && data.accessToken;
    }
  },
  {
    name: 'POST /api/auth/login wrong password → 401',
    test: async () => {
      const { status } = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'wrongpassword'
        })
      });
      return status === 401;
    }
  },
  {
    name: 'POST /api/auth/login unknown email → 401',
    test: async () => {
      const { status } = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'unknown@test.com',
          password: 'TestPass123!'
        })
      });
      return status === 401;
    }
  },
  {
    name: 'GET /api/users/profile with token → 200',
    test: async () => {
      const timestamp = Date.now();
      const email = `profile_${timestamp}@test.com`;
      // Register and get token
      const regResponse = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: email,
          password: 'TestPass123!',
          role: 'customer'
        })
      });
      // Use token to get profile
      const { status } = await request('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${regResponse.data.accessToken}`
        }
      });
      return status === 200;
    }
  },
  {
    name: 'GET /api/users/profile no token → 401',
    test: async () => {
      const { status } = await request('/api/users/profile');
      return status === 401;
    }
  },
  {
    name: 'POST /api/auth/refresh → 200 + new accessToken',
    test: async () => {
      const timestamp = Date.now();
      const email = `refresh_${timestamp}@test.com`;
      // Register
      const regResponse = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: email,
          password: 'TestPass123!',
          role: 'customer'
        })
      });
      // Refresh token
      const { status, data } = await request('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${regResponse.data.accessToken}`
        }
      });
      return status === 200 && data.success && data.accessToken;
    }
  }
];

// Run tests
async function runTests() {
  console.log('Running auth test suite...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.test();
      if (result) {
        console.log(`✓ ${test.name}`);
        passed++;
      } else {
        console.log(`✗ ${test.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ${test.name} - Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n${passed}/${tests.length} tests passed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
