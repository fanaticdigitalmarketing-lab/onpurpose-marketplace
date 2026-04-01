// Performance Test Suite for Viral Growth Engine
const https = require('https');

class PerformanceTester {
  constructor() {
    this.results = {
      ideaGeneration: [],
      trendingAPI: [],
      shareImage: [],
      referralSystem: []
    };
  }

  async testEndpoint(path, method = 'GET', data = null) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'onpurpose.earth',
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PerformanceTester/1.0'
        }
      };

      const startTime = Date.now();
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          resolve({
            status: res.statusCode,
            duration,
            data: responseData,
            success: res.statusCode < 400
          });
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

  async testIdeaGenerationPerformance() {
    console.log('🚀 Testing Idea Generation Performance...');
    
    const testCases = [
      { niche: 'coaching', userLevel: 'beginner', goal: 'monetize' },
      { niche: 'fitness', userLevel: 'intermediate', goal: 'monetize' },
      { niche: 'marketing', userLevel: 'advanced', goal: 'monetize' },
      { niche: 'web design', userLevel: 'beginner', goal: 'monetize' },
      { niche: 'consulting', userLevel: 'intermediate', goal: 'monetize' }
    ];

    for (const testCase of testCases) {
      const result = await this.testEndpoint('/api/ideas/generate-advanced', 'POST', testCase);
      this.results.ideaGeneration.push({
        ...testCase,
        ...result,
        withinLimit: result.duration < 500 // 500ms limit
      });
    }
  }

  async testTrendingAPIPerformance() {
    console.log('📊 Testing Trending API Performance...');
    
    for (let i = 0; i < 5; i++) {
      const result = await this.testEndpoint('/api/ideas/trending');
      this.results.trendingAPI.push({
        test: i + 1,
        ...result,
        withinLimit: result.duration < 300 // 300ms limit
      });
    }
  }

  async testShareImagePerformance() {
    console.log('🖼️ Testing Share Image Generation Performance...');
    
    const testIds = ['12345', '67890', '11111', '22222', '33333'];
    
    for (const id of testIds) {
      const result = await this.testEndpoint(`/api/ideas/share-image/${id}`);
      this.results.shareImage.push({
        ideaId: id,
        ...result,
        withinLimit: result.duration < 1000 // 1s limit for image generation
      });
    }
  }

  async testReferralSystemPerformance() {
    console.log('🔗 Testing Referral System Performance...');
    
    const testCases = [
      { action: 'generate' },
      { action: 'process', referralCode: 'ABC12345', userId: 'test-user' }
    ];

    for (const testCase of testCases) {
      const endpoint = testCase.action === 'generate' 
        ? '/api/referrals/generate' 
        : '/api/referrals/process';
      
      const result = await this.testEndpoint(endpoint, 'POST', testCase);
      this.results.referralSystem.push({
        ...testCase,
        ...result,
        withinLimit: result.duration < 400 // 400ms limit
      });
    }
  }

  calculateStats(results) {
    if (results.length === 0) return { avg: 0, min: 0, max: 0, success: 0 };
    
    const durations = results.map(r => r.duration);
    const successCount = results.filter(r => r.success).length;
    
    return {
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      success: (successCount / results.length) * 100,
      withinLimit: (results.filter(r => r.withinLimit).length / results.length) * 100
    };
  }

  async runFullPerformanceTest() {
    console.log('🔍 ONPURPOSE VIRAL GROWTH ENGINE - PERFORMANCE TEST');
    console.log('================================================');
    
    const startTime = Date.now();
    
    await this.testIdeaGenerationPerformance();
    await this.testTrendingAPIPerformance();
    await this.testShareImagePerformance();
    await this.testReferralSystemPerformance();
    
    const totalDuration = Date.now() - startTime;
    
    console.log('\n📊 PERFORMANCE RESULTS:');
    console.log('========================');
    
    // Idea Generation Results
    const ideaGenStats = this.calculateStats(this.results.ideaGeneration);
    console.log('\n🧠 Idea Generation:');
    console.log(`   Average: ${ideaGenStats.avg.toFixed(0)}ms`);
    console.log(`   Min/Max: ${ideaGenStats.min}ms / ${ideaGenStats.max}ms`);
    console.log(`   Success: ${ideaGenStats.success.toFixed(1)}%`);
    console.log(`   Within 500ms: ${ideaGenStats.withinLimit.toFixed(1)}%`);
    
    // Trending API Results
    const trendingStats = this.calculateStats(this.results.trendingAPI);
    console.log('\n📈 Trending API:');
    console.log(`   Average: ${trendingStats.avg.toFixed(0)}ms`);
    console.log(`   Min/Max: ${trendingStats.min}ms / ${trendingStats.max}ms`);
    console.log(`   Success: ${trendingStats.success.toFixed(1)}%`);
    console.log(`   Within 300ms: ${trendingStats.withinLimit.toFixed(1)}%`);
    
    // Share Image Results
    const shareImageStats = this.calculateStats(this.results.shareImage);
    console.log('\n🖼️ Share Image Generation:');
    console.log(`   Average: ${shareImageStats.avg.toFixed(0)}ms`);
    console.log(`   Min/Max: ${shareImageStats.min}ms / ${shareImageStats.max}ms`);
    console.log(`   Success: ${shareImageStats.success.toFixed(1)}%`);
    console.log(`   Within 1s: ${shareImageStats.withinLimit.toFixed(1)}%`);
    
    // Referral System Results
    const referralStats = this.calculateStats(this.results.referralSystem);
    console.log('\n🔗 Referral System:');
    console.log(`   Average: ${referralStats.avg.toFixed(0)}ms`);
    console.log(`   Min/Max: ${referralStats.min}ms / ${referralStats.max}ms`);
    console.log(`   Success: ${referralStats.success.toFixed(1)}%`);
    console.log(`   Within 400ms: ${referralStats.withinLimit.toFixed(1)}%`);
    
    // Overall Performance
    const allResults = [
      ...this.results.ideaGeneration,
      ...this.results.trendingAPI,
      ...this.results.shareImage,
      ...this.results.referralSystem
    ];
    
    const overallStats = this.calculateStats(allResults);
    console.log('\n🎯 OVERALL PERFORMANCE:');
    console.log(`   Total Tests: ${allResults.length}`);
    console.log(`   Total Duration: ${totalDuration}ms`);
    console.log(`   Average Response: ${overallStats.avg.toFixed(0)}ms`);
    console.log(`   Success Rate: ${overallStats.success.toFixed(1)}%`);
    
    // Performance Grade
    const grade = this.calculatePerformanceGrade(overallStats);
    console.log(`   Performance Grade: ${grade}`);
    
    return {
      totalTests: allResults.length,
      overallStats,
      grade,
      details: this.results
    };
  }

  calculatePerformanceGrade(stats) {
    if (stats.avg < 200 && stats.success > 95) return 'A+ (Excellent)';
    if (stats.avg < 400 && stats.success > 90) return 'A (Very Good)';
    if (stats.avg < 600 && stats.success > 85) return 'B (Good)';
    if (stats.avg < 800 && stats.success > 80) return 'C (Fair)';
    return 'D (Needs Improvement)';
  }
}

// Run the performance test
const tester = new PerformanceTester();
tester.runFullPerformanceTest().catch(console.error);
