// Comprehensive Test Suite for Viral Growth Engine
const https = require('https');

class ComprehensiveTester {
  constructor() {
    this.testResults = {
      authentication: [],
      ideaGeneration: [],
      viralSharing: [],
      trendingAPI: [],
      referralSystem: [],
      frontendUX: [],
      performance: []
    };
    this.authToken = null;
  }

  async makeRequest(path, method = 'GET', data = null, useAuth = false) {
    return new Promise((resolve) => {
      const options = {
        hostname: 'onpurpose.earth',
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ComprehensiveTester/1.0'
        }
      };

      if (useAuth && this.authToken) {
        options.headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const startTime = Date.now();
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
              headers: res.headers
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

  async testAuthentication() {
    console.log('🔐 Testing Authentication System...');
    
    // Test registration
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    };

    const registerResult = await this.makeRequest('/api/auth/register', 'POST', testUser);
    this.testResults.authentication.push({
      test: 'Registration',
      ...registerResult,
      expectedStatus: 201
    });

    // Test login
    const loginResult = await this.makeRequest('/api/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });

    if (loginResult.success && loginResult.data && loginResult.data.token) {
      this.authToken = loginResult.data.token;
    }

    this.testResults.authentication.push({
      test: 'Login',
      ...loginResult,
      expectedStatus: 200,
      hasToken: !!(loginResult.data && loginResult.data.token)
    });

    // Test protected endpoint without auth
    const protectedResult = await this.makeRequest('/api/ideas/trending');
    this.testResults.authentication.push({
      test: 'Protected Endpoint (No Auth)',
      ...protectedResult,
      expectedStatus: 200 // Trending should work without auth
    });
  }

  async testAdvancedIdeaGeneration() {
    console.log('🧠 Testing Advanced Idea Generation...');
    
    if (!this.authToken) {
      console.log('⚠️ Skipping idea generation tests - no auth token');
      return;
    }

    const testCases = [
      { niche: 'coaching', userLevel: 'beginner', goal: 'monetize', expectedIdeas: 3 },
      { niche: 'fitness', userLevel: 'intermediate', goal: 'monetize', expectedIdeas: 4 },
      { niche: 'marketing', userLevel: 'advanced', goal: 'monetize', expectedIdeas: 5 },
      { niche: 'web design', userLevel: 'beginner', goal: 'monetize', expectedIdeas: 3 },
      { niche: 'consulting', userLevel: 'intermediate', goal: 'monetize', expectedIdeas: 4 }
    ];

    for (const testCase of testCases) {
      const result = await this.makeRequest('/api/ideas/generate-advanced', 'POST', testCase, true);
      
      const ideaCount = result.data && result.data.data ? result.data.data.ideas.length : 0;
      const hasShareable = result.data && result.data.data && result.data.data.shareable;
      const hasViralScores = result.data && result.data.data && 
        result.data.data.ideas && 
        result.data.data.ideas.every(idea => typeof idea.viralScore === 'number');

      this.testResults.ideaGeneration.push({
        ...testCase,
        ...result,
        ideaCount,
        expectedIdeas: testCase.expectedIdeas,
        hasShareable,
        hasViralScores,
        qualityCheck: ideaCount >= 3 && ideaCount <= 5 && hasViralScores
      });
    }
  }

  async testViralSharing() {
    console.log('🚀 Testing Viral Sharing System...');
    
    if (!this.authToken) {
      console.log('⚠️ Skipping viral sharing tests - no auth token');
      return;
    }

    // Test share tracking
    const shareResult = await this.makeRequest('/api/ideas/share', 'POST', {
      ideaId: 'test-idea-123',
      shareType: 'copy',
      platform: 'web'
    }, true);

    this.testResults.viralSharing.push({
      test: 'Share Tracking',
      ...shareResult,
      expectedStatus: 200
    });

    // Test share image generation
    const imageResult = await this.makeRequest('/api/ideas/share-image/test-idea-123');
    this.testResults.viralSharing.push({
      test: 'Share Image Generation',
      ...imageResult,
      expectedStatus: 200,
      isImage: imageResult.headers && imageResult.headers['content-type'] && 
        imageResult.headers['content-type'].includes('image')
    });
  }

  async testTrendingAPI() {
    console.log('📈 Testing Trending Ideas API...');
    
    for (let i = 0; i < 3; i++) {
      const result = await this.makeRequest('/api/ideas/trending');
      
      const hasTopNiches = result.data && result.data.data && result.data.data.topNiches;
      const hasTrendingPatterns = result.data && result.data.data && result.data.data.trendingPatterns;
      const hasViralLeaders = result.data && result.data.data && result.data.data.viralScoreLeaders;

      this.testResults.trendingAPI.push({
        test: `Trending API Test ${i + 1}`,
        ...result,
        expectedStatus: 200,
        hasTopNiches,
        hasTrendingPatterns,
        hasViralLeaders,
        dataComplete: hasTopNiches && hasTrendingPatterns && hasViralLeaders
      });
    }
  }

  async testReferralSystem() {
    console.log('🔗 Testing Referral System...');
    
    if (!this.authToken) {
      console.log('⚠️ Skipping referral tests - no auth token');
      return;
    }

    // Test referral code generation
    const generateResult = await this.makeRequest('/api/referrals/generate', 'POST', {}, true);
    this.testResults.referralSystem.push({
      test: 'Referral Code Generation',
      ...generateResult,
      expectedStatus: 200,
      hasReferralCode: generateResult.data && generateResult.data.data && generateResult.data.data.referralCode,
      hasReferralLink: generateResult.data && generateResult.data.data && generateResult.data.data.referralLink
    });

    // Test referral processing
    const processResult = await this.makeRequest('/api/referrals/process', 'POST', {
      referralCode: 'TEST12345',
      userId: 'test-user'
    });
    this.testResults.referralSystem.push({
      test: 'Referral Processing',
      ...processResult,
      expectedStatus: 200
    });
  }

  async testFrontendUX() {
    console.log('🎨 Testing Frontend UX Elements...');
    
    // Test idea generator page loads
    const ideaGenPage = await this.makeRequest('/idea-generator.html');
    this.testResults.frontendUX.push({
      test: 'Idea Generator Page',
      ...ideaGenPage,
      expectedStatus: 200,
      containsRequiredElements: ideaGenPage.data && 
        ideaGenPage.data.includes('idea-generator-form') &&
        ideaGenPage.data.includes('generate-btn')
    });

    // Test main page loads
    const mainPage = await this.makeRequest('/index.html');
    this.testResults.frontendUX.push({
      test: 'Main Page',
      ...mainPage,
      expectedStatus: 200,
      containsRequiredElements: mainPage.data && 
        mainPage.data.includes('OnPurpose')
    });
  }

  calculateTestSuiteStats(results) {
    if (results.length === 0) return { pass: 0, fail: 0, total: 0, passRate: 0 };
    
    const passed = results.filter(r => r.success).length;
    const failed = results.length - passed;
    
    return {
      pass: passed,
      fail: failed,
      total: results.length,
      passRate: (passed / results.length) * 100
    };
  }

  async runComprehensiveTest() {
    console.log('🔍 ONPURPOSE VIRAL GROWTH ENGINE - COMPREHENSIVE TEST');
    console.log('====================================================');
    
    const startTime = Date.now();
    
    await this.testAuthentication();
    await this.testAdvancedIdeaGeneration();
    await this.testViralSharing();
    await this.testTrendingAPI();
    await this.testReferralSystem();
    await this.testFrontendUX();
    
    const totalDuration = Date.now() - startTime;
    
    console.log('\n📊 COMPREHENSIVE TEST RESULTS:');
    console.log('==============================');
    
    // Authentication Results
    const authStats = this.calculateTestSuiteStats(this.testResults.authentication);
    console.log('\n🔐 Authentication:');
    console.log(`   Tests: ${authStats.pass}/${authStats.total} passed`);
    console.log(`   Success Rate: ${authStats.passRate.toFixed(1)}%`);
    
    // Idea Generation Results
    const ideaGenStats = this.calculateTestSuiteStats(this.testResults.ideaGeneration);
    const qualityIdeas = this.testResults.ideaGeneration.filter(r => r.qualityCheck).length;
    console.log('\n🧠 Advanced Idea Generation:');
    console.log(`   Tests: ${ideaGenStats.pass}/${ideaGenStats.total} passed`);
    console.log(`   Success Rate: ${ideaGenStats.passRate.toFixed(1)}%`);
    console.log(`   Quality Ideas: ${qualityIdeas}/${ideaGenStats.total}`);
    
    // Viral Sharing Results
    const viralStats = this.calculateTestSuiteStats(this.testResults.viralSharing);
    console.log('\n🚀 Viral Sharing:');
    console.log(`   Tests: ${viralStats.pass}/${viralStats.total} passed`);
    console.log(`   Success Rate: ${viralStats.passRate.toFixed(1)}%`);
    
    // Trending API Results
    const trendingStats = this.calculateTestSuiteStats(this.testResults.trendingAPI);
    const completeData = this.testResults.trendingAPI.filter(r => r.dataComplete).length;
    console.log('\n📈 Trending API:');
    console.log(`   Tests: ${trendingStats.pass}/${trendingStats.total} passed`);
    console.log(`   Success Rate: ${trendingStats.passRate.toFixed(1)}%`);
    console.log(`   Complete Data: ${completeData}/${trendingStats.total}`);
    
    // Referral System Results
    const referralStats = this.calculateTestSuiteStats(this.testResults.referralSystem);
    console.log('\n🔗 Referral System:');
    console.log(`   Tests: ${referralStats.pass}/${referralStats.total} passed`);
    console.log(`   Success Rate: ${referralStats.passRate.toFixed(1)}%`);
    
    // Frontend UX Results
    const uxStats = this.calculateTestSuiteStats(this.testResults.frontendUX);
    console.log('\n🎨 Frontend UX:');
    console.log(`   Tests: ${uxStats.pass}/${uxStats.total} passed`);
    console.log(`   Success Rate: ${uxStats.passRate.toFixed(1)}%`);
    
    // Overall Results
    const allResults = Object.values(this.testResults).flat();
    const overallStats = this.calculateTestSuiteStats(allResults);
    
    console.log('\n🎯 OVERALL TEST RESULTS:');
    console.log(`   Total Tests: ${overallStats.total}`);
    console.log(`   Passed: ${overallStats.pass}`);
    console.log(`   Failed: ${overallStats.fail}`);
    console.log(`   Success Rate: ${overallStats.passRate.toFixed(1)}%`);
    console.log(`   Duration: ${totalDuration}ms`);
    
    // Final Assessment
    const grade = this.calculateSystemGrade(overallStats.passRate);
    console.log(`   System Grade: ${grade}`);
    
    // Detailed Issues
    const failedTests = allResults.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('\n⚠️ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`   - ${test.test || test.niche || 'Unknown'}: ${test.status} ${test.error || ''}`);
      });
    }
    
    return {
      totalTests: overallStats.total,
      passed: overallStats.pass,
      failed: overallStats.fail,
      successRate: overallStats.passRate,
      grade,
      duration: totalDuration,
      details: this.testResults
    };
  }

  calculateSystemGrade(passRate) {
    if (passRate >= 95) return 'A+ (Excellent)';
    if (passRate >= 90) return 'A (Very Good)';
    if (passRate >= 85) return 'B+ (Good)';
    if (passRate >= 80) return 'B (Satisfactory)';
    if (passRate >= 70) return 'C (Needs Work)';
    return 'D (Critical Issues)';
  }
}

// Run the comprehensive test
const tester = new ComprehensiveTester();
tester.runComprehensiveTest().catch(console.error);
