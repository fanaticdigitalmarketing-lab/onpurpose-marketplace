// DATABASE LOAD TESTER - PRODUCTION LEVEL
// Simulates 100, 1000, and 10000 users to ensure database performance

const https = require('https');

class DatabaseLoadTester {
  constructor() {
    this.baseURL = 'https://onpurpose.earth';
    this.testResults = [];
    this.performanceTargets = {
      responseTime: 500, // 500ms max
      errorRate: 0.01, // 1% max error rate
      throughput: 100, // 100 requests per second
      concurrentUsers: 1000 // 1000 concurrent users
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
          'User-Agent': 'DatabaseLoadTester/1.0'
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

  // RULE 9: SIMULATE 100 USERS
  async test100Users() {
    console.log('🔍 TESTING DATABASE WITH 100 USERS...');
    
    const userCount = 100;
    const requestsPerUser = 10;
    const totalRequests = userCount * requestsPerUser;
    
    console.log(`📊 Simulating ${userCount} users with ${requestsPerUser} requests each (${totalRequests} total)`);
    
    const testScenarios = [
      { path: '/api/services', weight: 40 }, // 40% service requests
      { path: '/api/ideas/trending', weight: 30 }, // 30% trending requests
      { path: '/api/services/my-services', weight: 20 }, // 20% my services requests
      { path: '/health', weight: 10 } // 10% health checks
    ];
    
    const results = [];
    const startTime = Date.now();
    
    // Generate requests for all users
    for (let user = 0; user < userCount; user++) {
      const userRequests = [];
      
      for (let req = 0; req < requestsPerUser; req++) {
        // Select scenario based on weight
        const scenario = this.selectWeightedScenario(testScenarios);
        userRequests.push(this.makeRequest(scenario.path));
      }
      
      // Execute user requests concurrently
      const userResults = await Promise.all(userRequests);
      results.push(...userResults);
      
      // Small delay between users to simulate real usage
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    return this.analyzeLoadTestResults('100 Users', results, totalDuration);
  }

  // RULE 9: SIMULATE 1000 USERS
  async test1000Users() {
    console.log('\n🔍 TESTING DATABASE WITH 1000 USERS...');
    
    const userCount = 1000;
    const requestsPerUser = 5;
    const totalRequests = userCount * requestsPerUser;
    
    console.log(`📊 Simulating ${userCount} users with ${requestsPerUser} requests each (${totalRequests} total)`);
    
    const testScenarios = [
      { path: '/api/services', weight: 50 }, // 50% service requests
      { path: '/api/ideas/trending', weight: 25 }, // 25% trending requests
      { path: '/api/services/my-services', weight: 15 }, // 15% my services requests
      { path: '/health', weight: 10 } // 10% health checks
    ];
    
    const results = [];
    const startTime = Date.now();
    
    // Process users in batches to avoid overwhelming the system
    const batchSize = 50;
    for (let batch = 0; batch < userCount; batch += batchSize) {
      const batchEnd = Math.min(batch + batchSize, userCount);
      const batchPromises = [];
      
      for (let user = batch; user < batchEnd; user++) {
        const userRequests = [];
        
        for (let req = 0; req < requestsPerUser; req++) {
          const scenario = this.selectWeightedScenario(testScenarios);
          userRequests.push(this.makeRequest(scenario.path));
        }
        
        batchPromises.push(Promise.all(userRequests));
      }
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    return this.analyzeLoadTestResults('1000 Users', results, totalDuration);
  }

  // RULE 9: SIMULATE 10000 USERS
  async test10000Users() {
    console.log('\n🔍 TESTING DATABASE WITH 10000 USERS...');
    
    const userCount = 10000;
    const requestsPerUser = 2;
    const totalRequests = userCount * requestsPerUser;
    
    console.log(`📊 Simulating ${userCount} users with ${requestsPerUser} requests each (${totalRequests} total)`);
    
    const testScenarios = [
      { path: '/api/services', weight: 60 }, // 60% service requests
      { path: '/api/ideas/trending', weight: 30 }, // 30% trending requests
      { path: '/health', weight: 10 } // 10% health checks
    ];
    
    const results = [];
    const startTime = Date.now();
    
    // Process in very large batches for 10k users
    const batchSize = 200;
    for (let batch = 0; batch < userCount; batch += batchSize) {
      const batchEnd = Math.min(batch + batchSize, userCount);
      const batchPromises = [];
      
      for (let user = batch; user < batchEnd; user++) {
        const userRequests = [];
        
        for (let req = 0; req < requestsPerUser; req++) {
          const scenario = this.selectWeightedScenario(testScenarios);
          userRequests.push(this.makeRequest(scenario.path));
        }
        
        batchPromises.push(Promise.all(userRequests));
      }
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());
      
      // Longer delay between large batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    return this.analyzeLoadTestResults('10000 Users', results, totalDuration);
  }

  // Select scenario based on weight
  selectWeightedScenario(scenarios) {
    const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const scenario of scenarios) {
      random -= scenario.weight;
      if (random <= 0) {
        return scenario;
      }
    }
    
    return scenarios[0];
  }

  // Analyze load test results
  analyzeLoadTestResults(testName, results, totalDuration) {
    const successfulRequests = results.filter(r => r.success);
    const failedRequests = results.filter(r => !r.success);
    const cachedRequests = results.filter(r => r.cached);
    
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const minDuration = Math.min(...results.map(r => r.duration));
    const maxDuration = Math.max(...results.map(r => r.duration));
    const successRate = successfulRequests.length / results.length;
    const cacheHitRate = cachedRequests.length / results.length;
    const throughput = (successfulRequests.length / totalDuration) * 1000; // requests per second
    
    // Check if performance targets are met
    const targetsMet = {
      responseTime: avgDuration <= this.performanceTargets.responseTime,
      errorRate: (1 - successRate) <= this.performanceTargets.errorRate,
      throughput: throughput >= this.performanceTargets.throughput
    };
    
    const overallPassed = Object.values(targetsMet).every(met => met);
    
    const result = {
      testName,
      totalRequests: results.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      cachedRequests: cachedRequests.length,
      totalDuration,
      avgDuration,
      minDuration,
      maxDuration,
      successRate,
      cacheHitRate,
      throughput,
      targetsMet,
      overallPassed
    };
    
    this.testResults.push(result);
    
    console.log(`\n📊 ${testName} Results:`);
    console.log(`   Total Requests: ${result.totalRequests}`);
    console.log(`   Successful: ${result.successfulRequests} (${(result.successRate * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${result.failedRequests}`);
    console.log(`   Cached: ${result.cachedRequests} (${(result.cacheHitRate * 100).toFixed(1)}%)`);
    console.log(`   Avg Duration: ${result.avgDuration.toFixed(0)}ms`);
    console.log(`   Min/Max Duration: ${result.minDuration}ms / ${result.maxDuration}ms`);
    console.log(`   Throughput: ${result.throughput.toFixed(0)} requests/second`);
    console.log(`   Total Duration: ${(result.totalDuration / 1000).toFixed(1)}s`);
    
    console.log(`\n🎯 Performance Targets:`);
    console.log(`   Response Time (<${this.performanceTargets.responseTime}ms): ${targetsMet.responseTime ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Error Rate (<${(this.performanceTargets.errorRate * 100)}%): ${targetsMet.errorRate ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Throughput (>${this.performanceTargets.throughput} req/s): ${targetsMet.throughput ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Overall: ${overallPassed ? '✅ PASS' : '❌ FAIL'}`);
    
    return result;
  }

  // Generate comprehensive load test report
  generateLoadTestReport() {
    console.log('\n📊 DATABASE LOAD TEST REPORT');
    console.log('===========================');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.overallPassed).length;
    const overallSuccessRate = (passedTests / totalTests) * 100;
    
    // Calculate aggregate metrics
    const totalRequests = this.testResults.reduce((sum, t) => sum + t.totalRequests, 0);
    const totalSuccessful = this.testResults.reduce((sum, t) => sum + t.successfulRequests, 0);
    const totalFailed = this.testResults.reduce((sum, t) => sum + t.failedRequests, 0);
    const totalCached = this.testResults.reduce((sum, t) => sum + t.cachedRequests, 0);
    const avgThroughput = this.testResults.reduce((sum, t) => sum + t.throughput, 0) / totalTests;
    const avgResponseTime = this.testResults.reduce((sum, t) => sum + t.avgDuration, 0) / totalTests;
    
    console.log(`\n🎯 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed Tests: ${passedTests}`);
    console.log(`   Success Rate: ${overallSuccessRate.toFixed(1)}%`);
    
    console.log(`\n📈 AGGREGATE METRICS:`);
    console.log(`   Total Requests: ${totalRequests}`);
    console.log(`   Successful: ${totalSuccessful} (${((totalSuccessful / totalRequests) * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${totalFailed} (${((totalFailed / totalRequests) * 100).toFixed(1)}%)`);
    console.log(`   Cached: ${totalCached} (${((totalCached / totalRequests) * 100).toFixed(1)}%)`);
    console.log(`   Avg Throughput: ${avgThroughput.toFixed(0)} requests/second`);
    console.log(`   Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
    
    // Performance assessment
    let overallGrade;
    if (overallSuccessRate >= 90) {
      overallGrade = 'A+ (EXCELLENT)';
    } else if (overallSuccessRate >= 75) {
      overallGrade = 'B (GOOD)';
    } else if (overallSuccessRate >= 60) {
      overallGrade = 'C (NEEDS OPTIMIZATION)';
    } else {
      overallGrade = 'D (POOR)';
    }
    
    console.log(`\n🏆 DATABASE PERFORMANCE GRADE: ${overallGrade}`);
    
    // Detailed test results
    console.log('\n📋 DETAILED RESULTS:');
    this.testResults.forEach((test, index) => {
      const status = test.overallPassed ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${test.testName}: ${test.avgDuration.toFixed(0)}ms avg, ${test.throughput.toFixed(0)} req/s`);
    });
    
    // Recommendations
    console.log('\n🔧 OPTIMIZATION RECOMMENDATIONS:');
    
    const failedTests = this.testResults.filter(t => !t.overallPassed);
    if (failedTests.length === 0) {
      console.log('   ✅ Database is performing excellently under all load levels');
    } else {
      failedTests.forEach(test => {
        console.log(`   🔧 ${test.testName}:`);
        if (!test.targetsMet.responseTime) {
          console.log(`      - Optimize slow queries (avg: ${test.avgDuration.toFixed(0)}ms)`);
        }
        if (!test.targetsMet.errorRate) {
          console.log(`      - Reduce error rate (${((1 - test.successRate) * 100).toFixed(1)}%)`);
        }
        if (!test.targetsMet.throughput) {
          console.log(`      - Increase throughput (${test.throughput.toFixed(0)} req/s)`);
        }
      });
    }
    
    return {
      totalTests,
      passedTests,
      overallSuccessRate,
      overallGrade,
      aggregateMetrics: {
        totalRequests,
        totalSuccessful,
        totalFailed,
        totalCached,
        avgThroughput,
        avgResponseTime
      },
      testResults: this.testResults
    };
  }

  // Run complete load test suite
  async runCompleteLoadTestSuite() {
    console.log('🚀 DATABASE LOAD TEST SUITE');
    console.log('===========================');
    console.log('Testing database performance under high traffic...\n');
    
    try {
      await this.test100Users();
      await this.test1000Users();
      await this.test10000Users();
      
      return this.generateLoadTestReport();
    } catch (error) {
      console.error('❌ Load test suite failed:', error);
      return {
        error: error.message,
        status: 'FAILED'
      };
    }
  }
}

// Run the complete database load test suite
const loadTester = new DatabaseLoadTester();
loadTester.runCompleteLoadTestSuite().catch(console.error);
