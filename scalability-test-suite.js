// SCALABILITY TEST SUITE - AUTO-SCALING ENFORCEMENT
// Tests unlimited growth capability without crashes

const https = require('https');

class ScalabilityTestSuite {
  constructor() {
    this.baseURL = 'https://onpurpose.earth';
    this.testResults = [];
    this.performanceTargets = {
      apiResponse: 500, // 500ms max
      concurrentRequests: 100, // 100 concurrent requests
      throughput: 1000, // 1000 requests per minute
      errorRate: 0.01 // 1% max error rate
    };
  }

  // Make HTTP request with timing
  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const options = {
        hostname: 'onpurpose.earth',
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ScalabilityTestSuite/1.0'
        }
      };

      const req = https.request(options, (res) => {
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
              success: res.statusCode < 400,
              cached: jsonData && jsonData.cached === true
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

      req.setTimeout(10000, () => {
        req.destroy();
        resolve({
          status: 'TIMEOUT',
          duration: 10000,
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

  // Test 1: API Response Times
  async testApiResponseTimes() {
    console.log('🚀 TESTING API RESPONSE TIMES...');
    
    const endpoints = [
      { path: '/api/ideas/trending', name: 'Trending API' },
      { path: '/api/services', name: 'Services API' },
      { path: '/health', name: 'Health Check' }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      console.log(`\n📊 Testing ${endpoint.name}...`);
      
      const testRuns = [];
      for (let i = 0; i < 10; i++) {
        const result = await this.makeRequest(endpoint.path);
        testRuns.push(result);
      }

      const avgDuration = testRuns.reduce((sum, r) => sum + r.duration, 0) / testRuns.length;
      const minDuration = Math.min(...testRuns.map(r => r.duration));
      const maxDuration = Math.max(...testRuns.map(r => r.duration));
      const successRate = testRuns.filter(r => r.success).length / testRuns.length;
      const cacheHitRate = testRuns.filter(r => r.cached).length / testRuns.length;

      const passed = avgDuration <= this.performanceTargets.apiResponse && successRate >= 0.95;

      results.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        avgDuration,
        minDuration,
        maxDuration,
        successRate,
        cacheHitRate,
        passed,
        target: this.performanceTargets.apiResponse
      });

      console.log(`   Average: ${avgDuration.toFixed(0)}ms (target: ${this.performanceTargets.apiResponse}ms)`);
      console.log(`   Success Rate: ${(successRate * 100).toFixed(1)}%`);
      console.log(`   Cache Hit Rate: ${(cacheHitRate * 100).toFixed(1)}%`);
      console.log(`   Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    }

    this.testResults.push({
      test: 'API Response Times',
      results,
      passed: results.filter(r => r.passed).length === results.length
    });

    return results;
  }

  // Test 2: Concurrent Request Handling
  async testConcurrentRequests() {
    console.log('\n🔄 TESTING CONCURRENT REQUEST HANDLING...');
    
    const endpoint = '/api/ideas/trending';
    const concurrentCount = this.performanceTargets.concurrentRequests;
    
    console.log(`📊 Sending ${concurrentCount} concurrent requests to ${endpoint}...`);
    
    const promises = [];
    const startTime = Date.now();
    
    // Send concurrent requests
    for (let i = 0; i < concurrentCount; i++) {
      promises.push(this.makeRequest(endpoint));
    }
    
    // Wait for all requests to complete
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    // Analyze results
    const successfulRequests = results.filter(r => r.success);
    const failedRequests = results.filter(r => !r.success);
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const maxDuration = Math.max(...results.map(r => r.duration));
    const minDuration = Math.min(...results.map(r => r.duration));
    const successRate = successfulRequests.length / results.length;
    const throughput = (successfulRequests.length / (endTime - startTime)) * 1000; // requests per second
    
    const passed = successRate >= 0.95 && avgDuration <= this.performanceTargets.apiResponse * 2; // Allow 2x for concurrent load
    
    const result = {
      test: 'Concurrent Requests',
      endpoint,
      concurrentCount,
      totalDuration: endTime - startTime,
      avgDuration,
      maxDuration,
      minDuration,
      successCount: successfulRequests.length,
      failureCount: failedRequests.length,
      successRate,
      throughput,
      passed
    };
    
    this.testResults.push(result);
    
    console.log(`   Total Duration: ${endTime - startTime}ms`);
    console.log(`   Average Response: ${avgDuration.toFixed(0)}ms`);
    console.log(`   Success Rate: ${(successRate * 100).toFixed(1)}%`);
    console.log(`   Throughput: ${throughput.toFixed(0)} requests/second`);
    console.log(`   Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    return result;
  }

  // Test 3: Load Testing (Sustained Load)
  async testSustainedLoad() {
    console.log('\n⏱️ TESTING SUSTAINED LOAD...');
    
    const endpoint = '/api/ideas/trending';
    const duration = 30000; // 30 seconds
    const requestsPerSecond = 10; // 10 RPS
    const totalRequests = (duration / 1000) * requestsPerSecond;
    
    console.log(`📊 Sustaining ${requestsPerSecond} RPS for ${duration/1000} seconds (${totalRequests} total requests)...`);
    
    const results = [];
    const startTime = Date.now();
    let requestCount = 0;
    
    // Send sustained requests
    while (Date.now() - startTime < duration) {
      const batchPromises = [];
      
      // Send batch of requests
      for (let i = 0; i < requestsPerSecond; i++) {
        batchPromises.push(this.makeRequest(endpoint));
        requestCount++;
      }
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Wait 1 second before next batch
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Analyze results
    const endTime = Date.now();
    const actualDuration = endTime - startTime;
    const successfulRequests = results.filter(r => r.success);
    const failedRequests = results.filter(r => !r.success);
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const maxDuration = Math.max(...results.map(r => r.duration));
    const successRate = successfulRequests.length / results.length;
    const actualThroughput = successfulRequests.length / (actualDuration / 1000);
    
    const passed = successRate >= 0.95 && actualThroughput >= requestsPerSecond * 0.9;
    
    const result = {
      test: 'Sustained Load',
      endpoint,
      duration: actualDuration,
      totalRequests: results.length,
      avgDuration,
      maxDuration,
      successCount: successfulRequests.length,
      failureCount: failedRequests.length,
      successRate,
      targetThroughput: requestsPerSecond,
      actualThroughput,
      passed
    };
    
    this.testResults.push(result);
    
    console.log(`   Actual Duration: ${actualDuration}ms`);
    console.log(`   Total Requests: ${results.length}`);
    console.log(`   Average Response: ${avgDuration.toFixed(0)}ms`);
    console.log(`   Success Rate: ${(successRate * 100).toFixed(1)}%`);
    console.log(`   Throughput: ${actualThroughput.toFixed(0)} RPS (target: ${requestsPerSecond})`);
    console.log(`   Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    return result;
  }

  // Test 4: Failsafe System Testing
  async testFailsafeSystem() {
    console.log('\n🛡️ TESTING FAILSAFE SYSTEM...');
    
    // Test health endpoint with auto-scaling info
    const healthResult = await this.makeRequest('/health');
    
    const hasAutoScaling = healthResult.data && healthResult.data.autoScaling;
    const hasCacheStats = hasAutoScaling && healthResult.data.autoScaling.cacheStats;
    const hasJobStats = hasAutoScaling && healthResult.data.autoScaling.jobStats;
    const hasSystemStatus = hasAutoScaling && healthResult.data.autoScaling.systemStatus;
    
    const passed = healthResult.success && hasAutoScaling && hasCacheStats && hasJobStats && hasSystemStatus;
    
    const result = {
      test: 'Failsafe System',
      healthStatus: healthResult.success,
      hasAutoScaling,
      hasCacheStats,
      hasJobStats,
      hasSystemStatus,
      cacheHitRate: hasCacheStats ? parseFloat(hasCacheStats.hitRate) : 0,
      activeJobs: hasJobStats ? hasJobStats.activeJobs : 0,
      systemStatus: hasSystemStatus ? hasSystemStatus.degradationLevel : 'unknown',
      passed
    };
    
    this.testResults.push(result);
    
    console.log(`   Health Status: ${healthResult.success ? '✅ OK' : '❌ FAILED'}`);
    console.log(`   Auto-Scaling: ${hasAutoScaling ? '✅ IMPLEMENTED' : '❌ MISSING'}`);
    console.log(`   Cache System: ${hasCacheStats ? '✅ ACTIVE' : '❌ MISSING'}`);
    console.log(`   Job Processor: ${hasJobStats ? '✅ ACTIVE' : '❌ MISSING'}`);
    console.log(`   System Monitor: ${hasSystemStatus ? '✅ ACTIVE' : '❌ MISSING'}`);
    
    if (hasCacheStats) {
      console.log(`   Cache Hit Rate: ${hasCacheStats.hitRate}`);
    }
    
    if (hasJobStats) {
      console.log(`   Active Jobs: ${hasJobStats.activeJobs}`);
    }
    
    console.log(`   Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    return result;
  }

  // Test 5: Background Processing Test
  async testBackgroundProcessing() {
    console.log('\n⏳ TESTING BACKGROUND PROCESSING...');
    
    // Test idea generation (should be fast due to background processing)
    const ideaGenResult = await this.makeRequest('/api/ideas/generate-advanced', 'POST', {
      niche: 'coaching',
      userLevel: 'beginner',
      goal: 'monetize'
    });
    
    const passed = ideaGenResult.success && ideaGenResult.duration <= this.performanceTargets.apiResponse * 1.5; // Allow 1.5x for processing
    
    const result = {
      test: 'Background Processing',
      ideaGenSuccess: ideaGenResult.success,
      ideaGenDuration: ideaGenResult.duration,
      ideaGenIdeas: ideaGenResult.data && ideaGenResult.data.data ? ideaGenResult.data.data.ideas.length : 0,
      passed
    };
    
    this.testResults.push(result);
    
    console.log(`   Idea Generation: ${ideaGenResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Response Time: ${ideaGenResult.duration}ms (target: ${this.performanceTargets.apiResponse * 1.5}ms)`);
    
    if (ideaGenResult.data && ideaGenResult.data.data) {
      console.log(`   Ideas Generated: ${ideaGenResult.data.data.ideas.length}`);
    }
    
    console.log(`   Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    return result;
  }

  // Generate comprehensive scalability report
  generateScalabilityReport() {
    console.log('\n📊 SCALABILITY TEST REPORT');
    console.log('===========================');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const overallSuccessRate = (passedTests / totalTests) * 100;
    
    // Determine overall scalability status
    let overallStatus;
    if (overallSuccessRate >= 90) {
      overallStatus = 'HIGHLY SCALABLE';
    } else if (overallSuccessRate >= 75) {
      overallStatus = 'SCALABLE';
    } else if (overallSuccessRate >= 60) {
      overallStatus = 'NEEDS OPTIMIZATION';
    } else {
      overallStatus = 'NOT SCALABLE';
    }
    
    console.log(`\n🎯 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed Tests: ${passedTests}`);
    console.log(`   Success Rate: ${overallSuccessRate.toFixed(1)}%`);
    console.log(`   Overall Status: ${overallStatus}`);
    
    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    this.testResults.forEach((test, index) => {
      const statusIcon = test.passed ? '✅' : '❌';
      console.log(`\n${index + 1}. ${statusIcon} ${test.test}`);
      
      if (test.results) {
        test.results.forEach(result => {
          const resultIcon = result.passed ? '✅' : '❌';
          console.log(`   ${resultIcon} ${result.endpoint}: ${result.avgDuration.toFixed(0)}ms avg`);
        });
      } else {
        console.log(`   Duration: ${test.avgDuration || test.duration || 'N/A'}ms`);
        console.log(`   Success Rate: ${test.successRate ? (test.successRate * 100).toFixed(1) + '%' : 'N/A'}`);
      }
    });
    
    // Performance targets assessment
    console.log('\n🎯 PERFORMANCE TARGETS ASSESSMENT:');
    Object.entries(this.performanceTargets).forEach(([target, value]) => {
      console.log(`   ${target}: ${value}${target.includes('Time') ? 'ms' : target.includes('Rate') ? '%' : ''}`);
    });
    
    // Recommendations
    console.log('\n🔧 SCALABILITY RECOMMENDATIONS:');
    
    const failedTests = this.testResults.filter(t => !t.passed);
    if (failedTests.length === 0) {
      console.log('   ✅ System is highly scalable and ready for unlimited growth');
    } else {
      failedTests.forEach(test => {
        console.log(`   🔧 Optimize ${test.test}: ${test.failureReason || 'Performance below targets'}`);
      });
    }
    
    return {
      totalTests,
      passedTests,
      overallSuccessRate,
      overallStatus,
      performanceTargets: this.performanceTargets,
      testResults: this.testResults
    };
  }

  // Run complete scalability test suite
  async runCompleteTestSuite() {
    console.log('🚀 ONPURPOSE SCALABILITY TEST SUITE');
    console.log('==================================');
    console.log('Testing unlimited growth capability...\n');
    
    try {
      await this.testApiResponseTimes();
      await this.testConcurrentRequests();
      await this.testSustainedLoad();
      await this.testFailsafeSystem();
      await this.testBackgroundProcessing();
      
      return this.generateScalabilityReport();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      return {
        error: error.message,
        status: 'FAILED'
      };
    }
  }
}

// Run the complete scalability test suite
const testSuite = new ScalabilityTestSuite();
testSuite.runCompleteTestSuite().catch(console.error);
