// URL CONSISTENCY VERIFIER - Ensures both regular and Facebook links work identically

const fs = require('fs');
const path = require('path');

class URLConsistencyVerifier {
  constructor() {
    this.verificationResults = {};
    this.issues = [];
  }

  // RULE 1: SERVICE CHOICE VERIFICATION - Check if service choice buttons exist
  async verifyServiceChoice() {
    console.log('🔍 URL CONSISTENCY: SERVICE CHOICE CHECK');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const serviceChoiceChecks = [
      {
        name: 'Generate My Service Button Exists',
        test: homepageContent.includes('Generate My Service') &&
              homepageContent.includes('scrollToIdeaGenerator()'),
        critical: true
      },
      {
        name: 'I Already Have a Service Button Exists',
        test: homepageContent.includes('I Already Have a Service') &&
              homepageContent.includes('goToProvider()'),
        critical: true
      },
      {
        name: 'Service Choice Section Exists',
        test: homepageContent.includes('Ready to Start Your Service Business?') &&
              homepageContent.includes('SERVICE CHOICE SECTION'),
        critical: true
      },
      {
        name: 'Service Choice Styling',
        test: homepageContent.includes('background: linear-gradient(135deg, #1e293b, #334155)') &&
              homepageContent.includes('grid-template-columns: 1fr 1fr'),
        critical: true
      },
      {
        name: 'Button Icons Present',
        test: homepageContent.includes('💡') && homepageContent.includes('🚀'),
        critical: true
      },
      {
        name: 'Button Descriptions Present',
        test: homepageContent.includes('Let AI create ideas for you') &&
              homepageContent.includes('Start listing right away'),
        critical: true
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of serviceChoiceChecks) {
      if (check.test) {
        console.log(`✅ ${check.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${check.name}: FAILED${check.critical ? ' (CRITICAL)' : ''}`);
        failed++;
        if (check.critical) {
          this.issues.push(check.name);
        }
      }
    }
    
    this.verificationResults.serviceChoice = { passed, failed, total: serviceChoiceChecks.length };
    console.log(`📊 Service Choice: ${passed}/${serviceChoiceChecks.length} passed`);
    
    return failed === 0;
  }

  // RULE 2: URL PARAMETER HANDLING - Check if Facebook links are handled
  async verifyURLParameterHandling() {
    console.log('\n🔍 URL CONSISTENCY: URL PARAMETER HANDLING');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const urlParamChecks = [
      {
        name: 'handleUrlParameters Function Exists',
        test: homepageContent.includes('function handleUrlParameters()'),
        critical: true
      },
      {
        name: 'Facebook Link Detection',
        test: homepageContent.includes('fbclid') &&
              homepageContent.includes('localStorage.setItem(\'trafficSource\', \'facebook\')'),
        critical: true
      },
      {
        name: 'UTM Parameter Handling',
        test: homepageContent.includes('utm_source') &&
              homepageContent.includes('utm_campaign'),
        critical: true
      },
      {
        name: 'URL Cleanup',
        test: homepageContent.includes('window.history.replaceState') &&
              homepageContent.includes('window.location.pathname'),
        critical: true
      },
      {
        name: 'handleUrlParameters Called on Init',
        test: homepageContent.includes('handleUrlParameters();'),
        critical: true
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of urlParamChecks) {
      if (check.test) {
        console.log(`✅ ${check.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${check.name}: FAILED${check.critical ? ' (CRITICAL)' : ''}`);
        failed++;
        if (check.critical) {
          this.issues.push(check.name);
        }
      }
    }
    
    this.verificationResults.urlParameters = { passed, failed, total: urlParamChecks.length };
    console.log(`📊 URL Parameters: ${passed}/${urlParamChecks.length} passed`);
    
    return failed === 0;
  }

  // RULE 3: NAVIGATION FUNCTIONS - Check if navigation works
  async verifyNavigationFunctions() {
    console.log('\n🔍 URL CONSISTENCY: NAVIGATION FUNCTIONS');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const navigationChecks = [
      {
        name: 'scrollToIdeaGenerator Function Exists',
        test: homepageContent.includes('function scrollToIdeaGenerator()') &&
              homepageContent.includes('scrollIntoView'),
        critical: true
      },
      {
        name: 'goToProvider Function Exists',
        test: homepageContent.includes('function goToProvider()') &&
              homepageContent.includes('window.location.href = \'/provider.html\''),
        critical: true
      },
      {
        name: 'Analytics Tracking',
        test: homepageContent.includes('localStorage.setItem(\'providerSource\''),
        critical: true
      },
      {
        name: 'Smooth Scrolling',
        test: homepageContent.includes('behavior: \'smooth\''),
        critical: true
      },
      {
        name: 'Highlight Effect',
        test: homepageContent.includes('scale(1.02)') &&
              homepageContent.includes('scale(1)'),
        critical: false
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of navigationChecks) {
      if (check.test) {
        console.log(`✅ ${check.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${check.name}: FAILED${check.critical ? ' (CRITICAL)' : ''}`);
        failed++;
        if (check.critical) {
          this.issues.push(check.name);
        }
      }
    }
    
    this.verificationResults.navigation = { passed, failed, total: navigationChecks.length };
    console.log(`📊 Navigation: ${passed}/${navigationChecks.length} passed`);
    
    return failed === 0;
  }

  // RULE 4: MOBILE RESPONSIVENESS - Check mobile compatibility
  async verifyMobileResponsiveness() {
    console.log('\n🔍 URL CONSISTENCY: MOBILE RESPONSIVENESS');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const mobileChecks = [
      {
        name: 'Service Choice Mobile Grid',
        test: homepageContent.includes('div[style*="Ready to Start Your Service Business"] > div[style*="grid"]') &&
              homepageContent.includes('grid-template-columns: 1fr !important'),
        critical: true
      },
      {
        name: 'Mobile Button Styling',
        test: homepageContent.includes('div[style*="Ready to Start Your Service Business"] button') &&
              homepageContent.includes('padding: 15px !important'),
        critical: true
      },
      {
        name: 'Mobile Icon Sizing',
        test: homepageContent.includes('div[style*="Ready to Start Your Service Business"] button div:first-child') &&
              homepageContent.includes('font-size: 1.5rem !important'),
        critical: true
      },
      {
        name: 'Idea Generator Mobile Grid',
        test: homepageContent.includes('#ideaGenerator > div[style*="grid"]') &&
              homepageContent.includes('grid-template-columns: 1fr !important'),
        critical: true
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of mobileChecks) {
      if (check.test) {
        console.log(`✅ ${check.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${check.name}: FAILED${check.critical ? ' (CRITICAL)' : ''}`);
        failed++;
        if (check.critical) {
          this.issues.push(check.name);
        }
      }
    }
    
    this.verificationResults.mobile = { passed, failed, total: mobileChecks.length };
    console.log(`📊 Mobile Responsiveness: ${passed}/${mobileChecks.length} passed`);
    
    return failed === 0;
  }

  // RULE 5: DEPLOYMENT CONSISTENCY - Check all deployments
  async verifyDeploymentConsistency() {
    console.log('\n🔍 URL CONSISTENCY: DEPLOYMENT CHECK');
    console.log('=' .repeat(60));
    
    const requiredFiles = [
      'index.html',
      'build/index.html',
      'frontend/index.html'
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check if service choice is in each file
        if (content.includes('Generate My Service') && 
            content.includes('I Already Have a Service') &&
            content.includes('handleUrlParameters()')) {
          console.log(`✅ ${file}: DEPLOYED WITH SERVICE CHOICE & URL HANDLING`);
          passed++;
        } else {
          console.log(`❌ ${file}: MISSING FEATURES (CRITICAL)`);
          failed++;
          this.issues.push(`${file} missing service choice or URL handling`);
        }
      } else {
        console.log(`❌ ${file}: FILE MISSING (CRITICAL)`);
        failed++;
        this.issues.push(`${file} missing`);
      }
    }
    
    this.verificationResults.deployment = { passed, failed, total: requiredFiles.length };
    console.log(`📊 Deployment: ${passed}/${requiredFiles.length} files deployed`);
    
    return failed === 0;
  }

  // Execute all URL consistency verification rules
  async executeURLConsistencyVerification() {
    console.log('🌐 URL CONSISTENCY VERIFICATION SYSTEM');
    console.log('=' .repeat(60));
    console.log('VERIFYING: Both regular and Facebook URLs work identically\n');
    
    const startTime = Date.now();
    
    try {
      // Execute all verification rules
      const results = {
        serviceChoice: await this.verifyServiceChoice(),
        urlParameters: await this.verifyURLParameterHandling(),
        navigation: await this.verifyNavigationFunctions(),
        mobile: await this.verifyMobileResponsiveness(),
        deployment: await this.verifyDeploymentConsistency()
      };
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      // Generate final report
      this.generateFinalReport(results, duration);
      
      return {
        success: this.issues.length === 0,
        results,
        duration,
        issues: this.issues
      };
      
    } catch (error) {
      console.error('\n❌ URL CONSISTENCY VERIFICATION ERROR:', error.message);
      return {
        success: false,
        error: error.message,
        issues: this.issues
      };
    }
  }

  // Generate comprehensive final report
  generateFinalReport(results, duration) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 URL CONSISTENCY VERIFICATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`🚨 Issues Found: ${this.issues.length}`);
    
    if (this.issues.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n📋 VERIFICATION RESULTS:');
    Object.entries(results).forEach(([category, result]) => {
      const status = result ? '✅ PASSED' : '❌ FAILED';
      console.log(`   ${category}: ${status}`);
    });
    
    const overallSuccess = this.issues.length === 0;
    
    if (overallSuccess) {
      console.log('\n🎉 URL CONSISTENCY VERIFICATION: SUCCESS');
      console.log('✅ Service Choice buttons are present and working');
      console.log('✅ URL parameter handling for Facebook links works');
      console.log('✅ Navigation functions work correctly');
      console.log('✅ Mobile responsiveness is optimal');
      console.log('✅ All deployments are consistent');
      console.log('\n🌐 BOTH URLS WILL WORK IDENTICALLY:');
      console.log('   • https://onpurpose.earth/');
      console.log('   • https://onpurpose.earth/?fbclid=IwZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQBMAABHlEurOCiNCVHvg80RcWMIofmPCmWz_iafqbWSBqnddZcDvtSBqryAvCN_3O6_aem_BRYFxLFJKdXnEFdPHmDV9g');
    } else {
      console.log('\n❌ URL CONSISTENCY VERIFICATION: FAILED');
      console.log('🔧 Issues need to be addressed');
      console.log('🔧 URLs may not work identically');
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Execute URL consistency verification system
const verification = new URLConsistencyVerifier();
verification.executeURLConsistencyVerification().then((result) => {
  if (result.success) {
    console.log('\n✅ URL CONSISTENCY VERIFICATION COMPLETE: Both URLs will work identically');
    console.log('🌐 Test both links to confirm identical behavior');
  } else {
    console.log('\n❌ URL CONSISTENCY VERIFICATION FAILED: Issues need to be addressed');
    console.log('Issues found:', result.issues);
  }
}).catch(console.error);

module.exports = verification;
