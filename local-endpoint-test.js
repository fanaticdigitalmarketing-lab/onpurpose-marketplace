// LOCAL ENDPOINT TEST - Verify all viral growth engine endpoints
const http = require('http');

class LocalEndpointTester {
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

  async testCriticalEndpoints() {
    console.log('🔍 TESTING LOCAL ENDPOINTS...');
    
    const endpoints = [
      {
        name: 'Advanced Idea Generation',
        path: '/api/ideas/generate-advanced',
        method: 'POST',
        data: { niche: 'coaching', userLevel: 'beginner', goal: 'monetize' }
      },
      {
        name: 'Trending Ideas',
        path: '/api/ideas/trending',
        method: 'GET'
      },
      {
        name: 'Share Image Generation',
        path: '/api/ideas/share-image/123',
        method: 'GET'
      },
      {
        name: 'Share Tracking',
        path: '/api/ideas/share',
        method: 'POST',
        data: { ideaId: '123', shareType: 'copy', platform: 'web' }
      },
      {
        name: 'Referral Code Generation',
        path: '/api/referrals/generate',
        method: 'POST'
      },
      {
        name: 'Referral Processing',
        path: '/api/referrals/process',
        method: 'POST',
        data: { referralCode: 'TEST12345', userId: 'test-user' }
      }
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🧪 Testing: ${endpoint.name}`);
      
      try {
        const result = await this.makeRequest(endpoint.path, endpoint.method, endpoint.data);
        
        console.log(`   Status: ${result.status}`);
        console.log(`   Duration: ${result.duration}ms`);
        console.log(`   Success: ${result.success}`);
        
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        
        if (result.data && typeof result.data === 'object') {
          console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
        
        this.results.push({
          name: endpoint.name,
          path: endpoint.path,
          ...result
        });
        
      } catch (error) {
        console.log(`   ❌ Test failed: ${error.message}`);
        this.results.push({
          name: endpoint.name,
          path: endpoint.path,
          status: 'ERROR',
          error: error.message,
          success: false
        });
      }
    }
  }

  async generateReport() {
    console.log('\n📊 LOCAL ENDPOINT TEST REPORT');
    console.log('==============================');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => !r.success).forEach(test => {
        console.log(`   - ${test.name}: ${test.status} ${test.error || ''}`);
      });
    }
    
    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: (passedTests / totalTests) * 100,
      results: this.results
    };
  }

  async runTests() {
    await this.testCriticalEndpoints();
    return this.generateReport();
  }
}

// Run the local endpoint tests
const tester = new LocalEndpointTester();
tester.runTests().catch(console.error);
