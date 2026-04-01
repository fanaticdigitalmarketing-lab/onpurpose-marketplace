// LOCAL VIRAL GROWTH ENGINE TEST
const http = require('http');

class LocalViralTester {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    this.results = [];
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const startTime = Date.now();
      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          try {
            const jsonData = responseData ? JSON.parse(responseData) : null;
            resolve({
              status: res.statusCode,
              duration,
              data: jsonData,
              success: res.statusCode < 400
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              duration,
              data: responseData,
              success: res.statusCode < 400,
              error: 'JSON Parse Error'
            });
          }
        });
      });

      req.on('error', (error) => {
        const endTime = Date.now();
        resolve({
          status: 'ERROR',
          duration: endTime - startTime,
          error: error.message,
          success: false
        });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          status: 'TIMEOUT',
          duration: 5000,
          error: 'Request timeout',
          success: false
        });
      });

      if (data && method === 'POST') {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async testViralEndpoints() {
    console.log('🚀 TESTING VIRAL GROWTH ENGINE ENDPOINTS (LOCAL)');
    console.log('====================================================');
    
    const endpoints = [
      {
        name: 'Advanced Idea Generation',
        path: '/api/ideas/generate-advanced',
        method: 'POST',
        data: { niche: 'coaching', userLevel: 'beginner', goal: 'monetize' },
        expectedStatus: 401 // Should require auth
      },
      {
        name: 'Trending Ideas',
        path: '/api/ideas/trending',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Share Image Generation',
        path: '/api/ideas/share-image/123',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Referral Code Generation',
        path: '/api/referrals/generate',
        method: 'POST',
        expectedStatus: 401 // Should require auth
      },
      {
        name: 'Referral Processing',
        path: '/api/referrals/process',
        method: 'POST',
        data: { referralCode: 'TEST12345', userId: 'test-user' },
        expectedStatus: 200
      }
    ];

    let passed = 0;
    let failed = 0;

    for (const endpoint of endpoints) {
      console.log(`\n🧪 Testing: ${endpoint.name}`);
      
      try {
        const result = await this.makeRequest(endpoint.path, endpoint.method, endpoint.data);
        
        console.log(`   Status: ${result.status}`);
        console.log(`   Duration: ${result.duration}ms`);
        console.log(`   Success: ${result.success}`);
        
        // Check if status matches expectation
        const statusMatch = result.status === endpoint.expectedStatus;
        const isWorking = statusMatch || (result.success && !endpoint.expectedStatus);
        
        if (isWorking) {
          console.log(`   ✅ PASSED`);
          passed++;
        } else {
          console.log(`   ❌ FAILED (Expected ${endpoint.expectedStatus}, got ${result.status})`);
          failed++;
        }
        
        if (result.data && typeof result.data === 'object') {
          console.log(`   Response: ${JSON.stringify(result.data).substring(0, 150)}...`);
        }
        
        this.results.push({
          name: endpoint.name,
          ...result,
          expectedStatus: endpoint.expectedStatus,
          passed: isWorking
        });
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        failed++;
        this.results.push({
          name: endpoint.name,
          status: 'ERROR',
          error: error.message,
          success: false,
          passed: false
        });
      }
    }

    return { passed, failed, total: endpoints.length };
  }

  async generateReport() {
    const { passed, failed, total } = await this.testViralEndpoints();
    
    console.log('\n📊 LOCAL VIRAL ENGINE TEST REPORT');
    console.log('==================================');
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => !r.passed).forEach(test => {
        console.log(`   - ${test.name}: ${test.status} ${test.error || ''}`);
      });
    }
    
    console.log('\n🎯 ENDPOINT STATUS:');
    this.results.forEach(test => {
      const status = test.passed ? '✅ WORKING' : '❌ ISSUE';
      console.log(`   ${status} ${test.name}`);
    });
    
    return {
      total,
      passed,
      failed,
      successRate: (passed / total) * 100,
      results: this.results
    };
  }
}

// Run the local viral engine tests
const tester = new LocalViralTester();
tester.generateReport().catch(console.error);
