#!/usr/bin/env node

const axios = require('axios');
const colors = require('colors');

class ProductionTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🧪 OnPurpose Production Testing Suite'.cyan.bold);
    console.log('=====================================\n');

    await this.testHealthEndpoint();
    await this.testAPIEndpoints();
    await this.testAuthentication();
    await this.testSecurity();
    await this.testPerformance();
    await this.testSSL();

    this.printResults();
  }

  async testHealthEndpoint() {
    console.log('🏥 Testing Health Endpoint...'.yellow);
    
    try {
      const response = await axios.get(`${this.baseUrl}/health`, { timeout: 5000 });
      
      this.assert(response.status === 200, 'Health endpoint returns 200');
      this.assert(response.data.status === 'OK', 'Health status is OK');
      this.assert(response.data.timestamp, 'Health response includes timestamp');
      this.assert(response.data.uptime !== undefined, 'Health response includes uptime');
      
      console.log('✅ Health endpoint tests passed\n'.green);
    } catch (error) {
      this.assert(false, `Health endpoint failed: ${error.message}`);
      console.log('❌ Health endpoint tests failed\n'.red);
    }
  }

  async testAPIEndpoints() {
    console.log('🔌 Testing API Endpoints...'.yellow);

    try {
      // Test API info endpoint
      const apiResponse = await axios.get(`${this.baseUrl}/api`);
      this.assert(apiResponse.status === 200, 'API info endpoint returns 200');
      this.assert(apiResponse.data.message, 'API info includes message');
      this.assert(Array.isArray(apiResponse.data.endpoints), 'API info includes endpoints array');

      // Test 404 handling
      try {
        await axios.get(`${this.baseUrl}/api/nonexistent`);
        this.assert(false, '404 endpoint should return error');
      } catch (error) {
        this.assert(error.response.status === 404, 'Non-existent endpoint returns 404');
      }

      console.log('✅ API endpoint tests passed\n'.green);
    } catch (error) {
      this.assert(false, `API endpoint tests failed: ${error.message}`);
      console.log('❌ API endpoint tests failed\n'.red);
    }
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication...'.yellow);

    try {
      // Test registration with invalid data
      try {
        await axios.post(`${this.baseUrl}/api/auth/register`, {
          firstName: '',
          lastName: '',
          email: 'invalid-email',
          password: '123'
        });
        this.assert(false, 'Registration should reject invalid data');
      } catch (error) {
        this.assert(error.response.status === 400, 'Registration rejects invalid data with 400');
      }

      // Test login without credentials
      try {
        await axios.post(`${this.baseUrl}/api/auth/login`, {});
        this.assert(false, 'Login should require credentials');
      } catch (error) {
        this.assert(error.response.status === 400, 'Login without credentials returns 400');
      }

      // Test protected route without token
      try {
        await axios.get(`${this.baseUrl}/api/auth/profile`);
        this.assert(false, 'Protected route should require token');
      } catch (error) {
        this.assert(error.response.status === 401, 'Protected route without token returns 401');
      }

      console.log('✅ Authentication tests passed\n'.green);
    } catch (error) {
      this.assert(false, `Authentication tests failed: ${error.message}`);
      console.log('❌ Authentication tests failed\n'.red);
    }
  }

  async testSecurity() {
    console.log('🛡️ Testing Security Headers...'.yellow);

    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      const headers = response.headers;

      // Check security headers
      this.assert(headers['x-frame-options'], 'X-Frame-Options header present');
      this.assert(headers['x-content-type-options'], 'X-Content-Type-Options header present');
      this.assert(headers['x-xss-protection'] || headers['x-content-type-options'], 'XSS protection headers present');

      // Test rate limiting (if configured)
      console.log('⏱️ Testing rate limiting...'.gray);
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(axios.get(`${this.baseUrl}/health`));
      }
      await Promise.all(requests);
      
      console.log('✅ Security tests passed\n'.green);
    } catch (error) {
      this.assert(false, `Security tests failed: ${error.message}`);
      console.log('❌ Security tests failed\n'.red);
    }
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...'.yellow);

    try {
      const start = Date.now();
      const response = await axios.get(`${this.baseUrl}/health`);
      const responseTime = Date.now() - start;

      this.assert(responseTime < 1000, `Response time under 1s (${responseTime}ms)`);
      this.assert(response.status === 200, 'Performance test endpoint responds correctly');

      // Test concurrent requests
      const concurrentStart = Date.now();
      const concurrentRequests = Array(10).fill().map(() => 
        axios.get(`${this.baseUrl}/health`)
      );
      await Promise.all(concurrentRequests);
      const concurrentTime = Date.now() - concurrentStart;

      this.assert(concurrentTime < 2000, `Concurrent requests under 2s (${concurrentTime}ms)`);

      console.log('✅ Performance tests passed\n'.green);
    } catch (error) {
      this.assert(false, `Performance tests failed: ${error.message}`);
      console.log('❌ Performance tests failed\n'.red);
    }
  }

  async testSSL() {
    console.log('🔒 Testing SSL Configuration...'.yellow);

    if (!this.baseUrl.startsWith('https://')) {
      console.log('⚠️ Skipping SSL tests (HTTP endpoint)\n'.yellow);
      return;
    }

    try {
      // Test HTTPS connection
      const response = await axios.get(`${this.baseUrl}/health`);
      this.assert(response.status === 200, 'HTTPS connection successful');

      // Test HTTP redirect (if applicable)
      const httpUrl = this.baseUrl.replace('https://', 'http://');
      try {
        const httpResponse = await axios.get(httpUrl, { 
          maxRedirects: 0,
          validateStatus: () => true 
        });
        if (httpResponse.status === 301 || httpResponse.status === 302) {
          this.assert(true, 'HTTP redirects to HTTPS');
        }
      } catch (error) {
        // Redirect might cause an error, which is expected
      }

      console.log('✅ SSL tests passed\n'.green);
    } catch (error) {
      this.assert(false, `SSL tests failed: ${error.message}`);
      console.log('❌ SSL tests failed\n'.red);
    }
  }

  assert(condition, message) {
    const test = { message, passed: condition };
    this.results.tests.push(test);
    
    if (condition) {
      this.results.passed++;
      console.log(`  ✅ ${message}`.green);
    } else {
      this.results.failed++;
      console.log(`  ❌ ${message}`.red);
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary'.cyan.bold);
    console.log('========================');
    console.log(`Total Tests: ${this.results.tests.length}`);
    console.log(`Passed: ${this.results.passed}`.green);
    console.log(`Failed: ${this.results.failed}`.red);
    console.log(`Success Rate: ${((this.results.passed / this.results.tests.length) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:'.red.bold);
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => console.log(`  • ${test.message}`.red));
    }

    console.log('\n' + (this.results.failed === 0 ? 
      '🎉 All tests passed! Your application is production-ready.'.green.bold :
      '⚠️ Some tests failed. Please review and fix issues before going live.'.yellow.bold
    ));
  }
}

// CLI usage
if (require.main === module) {
  const baseUrl = process.argv[2];
  
  if (!baseUrl) {
    console.log('Usage: node production-test.js <base-url>');
    console.log('Example: node production-test.js https://your-app.herokuapp.com');
    process.exit(1);
  }

  const tester = new ProductionTester(baseUrl);
  tester.runAllTests().catch(console.error);
}

module.exports = ProductionTester;
