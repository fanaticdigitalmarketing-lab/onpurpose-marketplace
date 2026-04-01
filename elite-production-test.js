
// ELITE SYSTEM TEST SUITE - PRODUCTION READY
const https = require('https');

class EliteSystemTester {
  constructor() {
    this.baseURL = 'https://onpurpose.earth';
    this.testResults = [];
  }

  async testEndpoint(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'onpurpose.earth',
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'EliteSystemTester/1.0',
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          // HTML pages are successful if status is 200, even if not JSON
          const isHTML = res.headers['content-type'] && res.headers['content-type'].includes('text/html');
          const isSuccess = res.statusCode < 400;
          
          let data = null;
          if (!isHTML) {
            try {
              data = responseData ? JSON.parse(responseData) : null;
            } catch (error) {
              // Non-HTML but failed to parse JSON - still check status
              data = responseData;
            }
          } else {
            data = responseData; // HTML content
          }
          
          resolve({
            status: res.statusCode,
            success: isSuccess,
            data: data,
            isHTML: isHTML
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          status: 'ERROR',
          success: false,
          error: error.message
        });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        resolve({
          status: 'TIMEOUT',
          success: false,
          error: 'Request timeout'
        });
      });

      if (data && method === 'POST') {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async runProductionTests() {
    console.log('🔍 ELITE PRODUCTION TEST SUITE');
    console.log('==============================');
    
    const tests = [
      { name: 'Frontend Load', path: '/index.html' },
      { name: 'Idea Generator', path: '/idea-generator.html' },
      { name: 'Trending API', path: '/api/ideas/trending' },
      { name: 'Services API', path: '/api/services' }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      console.log(`🧪 Testing: ${test.name}`);
      
      try {
        const result = await this.testEndpoint(test.path);
        
        if (result.success && result.status < 400) {
          console.log(`   ✅ PASSED (${result.status})`);
          passed++;
        } else {
          console.log(`   ❌ FAILED (${result.status})`);
          failed++;
        }
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed`);
    console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    return { passed, failed, successRate: (passed / (passed + failed)) * 100 };
  }
}

// Run production tests
const tester = new EliteSystemTester();
tester.runProductionTests().catch(console.error);
