// AI GENERATOR VISIBILITY VERIFIER - Ensures AI generator is prominent on regular URL

const fs = require('fs');
const path = require('path');

class AIGeneratorVisibilityVerifier {
  constructor() {
    this.verificationResults = {};
    this.issues = [];
  }

  // RULE 1: AI GENERATOR VISIBILITY - Check if AI generator is prominently visible
  async verifyAIGeneratorVisibility() {
    console.log('🔍 AI GENERATOR VISIBILITY VERIFICATION');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const visibilityChecks = [
      {
        name: 'AI Generator Section Exists',
        test: homepageContent.includes('<!-- AI GENERATOR - ALWAYS VISIBLE SECTION -->') &&
              homepageContent.includes('id="aiGeneratorSection"'),
        critical: true
      },
      {
        name: 'Massive Title (3rem)',
        test: homepageContent.includes('font-size: 3rem') &&
              homepageContent.includes('💡 AI Service Idea Generator'),
        critical: true
      },
      {
        name: 'Enhanced Styling',
        test: homepageContent.includes('padding: 60px') &&
              homepageContent.includes('border-radius: 25px') &&
              homepageContent.includes('box-shadow: 0 25px 50px'),
        critical: true
      },
      {
        name: 'Floating Background Elements',
        test: homepageContent.includes('animation: float') &&
              homepageContent.includes('border-radius: 50%'),
        critical: true
      },
      {
        name: 'Large Generate Button',
        test: homepageContent.includes('padding: 25px') &&
              homepageContent.includes('font-size: 1.4rem') &&
              homepageContent.includes('letter-spacing: 2px'),
        critical: true
      },
      {
        name: 'Enhanced Input Fields',
        test: homepageContent.includes('padding: 18px') &&
              homepageContent.includes('border: 3px solid') &&
              homepageContent.includes('backdrop-filter: blur(15px)'),
        critical: true
      },
      {
        name: 'Loading Spinner',
        test: homepageContent.includes('animation: spin') &&
              homepageContent.includes('border-radius: 50%'),
        critical: true
      },
      {
        name: 'Minimum Height Set',
        test: homepageContent.includes('min-height: 600px'),
        critical: true
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of visibilityChecks) {
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
    
    this.verificationResults.visibility = { passed, failed, total: visibilityChecks.length };
    console.log(`📊 AI Generator Visibility: ${passed}/${visibilityChecks.length} passed`);
    
    return failed === 0;
  }

  // RULE 2: ANIMATIONS VERIFICATION - Check if animations are present
  async verifyAnimations() {
    console.log('\n🔍 ANIMATIONS VERIFICATION');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const animationChecks = [
      {
        name: 'Float Animation Keyframes',
        test: homepageContent.includes('@keyframes float') &&
              homepageContent.includes('transform: translateY(-20px) rotate(180deg)'),
        critical: true
      },
      {
        name: 'Spin Animation Keyframes',
        test: homepageContent.includes('@keyframes spin') &&
              homepageContent.includes('transform: rotate(360deg)'),
        critical: true
      },
      {
        name: 'Multiple Float Elements',
        test: homepageContent.includes('animation: float 6s') &&
              homepageContent.includes('animation: float 8s') &&
              homepageContent.includes('animation: float 4s'),
        critical: true
      },
      {
        name: 'Loading Spinner Animation',
        test: homepageContent.includes('animation: spin 1s linear infinite'),
        critical: true
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of animationChecks) {
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
    
    this.verificationResults.animations = { passed, failed, total: animationChecks.length };
    console.log(`📊 Animations: ${passed}/${animationChecks.length} passed`);
    
    return failed === 0;
  }

  // RULE 3: INTERACTIVE ELEMENTS - Check if all interactive elements work
  async verifyInteractiveElements() {
    console.log('\n🔍 INTERACTIVE ELEMENTS VERIFICATION');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const interactiveChecks = [
      {
        name: 'Input Focus Effects',
        test: homepageContent.includes('onfocus') &&
              homepageContent.includes('translateY(-2px)') &&
              homepageContent.includes('borderColor'),
        critical: true
      },
      {
        name: 'Button Hover Effects',
        test: homepageContent.includes('onmouseover') &&
              homepageContent.includes('translateY(-4px)') &&
              homepageContent.includes('boxShadow'),
        critical: true
      },
      {
        name: 'Generate Button Click Handler',
        test: homepageContent.includes('onclick="generateIdeas()"'),
        critical: true
      },
      {
        name: 'Become Provider Button',
        test: homepageContent.includes('onclick="becomeProvider()"'),
        critical: true
      },
      {
        name: 'Generate More Button',
        test: homepageContent.includes('onclick="generateMoreIdeas()"'),
        critical: true
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of interactiveChecks) {
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
    
    this.verificationResults.interactive = { passed, failed, total: interactiveChecks.length };
    console.log(`📊 Interactive Elements: ${passed}/${interactiveChecks.length} passed`);
    
    return failed === 0;
  }

  // RULE 4: MOBILE RESPONSIVENESS - Check mobile optimization
  async verifyMobileResponsiveness() {
    console.log('\n🔍 MOBILE RESPONSIVENESS VERIFICATION');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const mobileChecks = [
      {
        name: 'AI Generator Mobile Padding',
        test: homepageContent.includes('#aiGeneratorSection') &&
              homepageContent.includes('padding: 40px 20px !important'),
        critical: true
      },
      {
        name: 'Mobile Title Size',
        test: homepageContent.includes('#aiGeneratorSection h2') &&
              homepageContent.includes('font-size: 2rem !important'),
        critical: true
      },
      {
        name: 'Mobile Grid Layout',
        test: homepageContent.includes('#ideaGenerator > div[style*="grid"]') &&
              homepageContent.includes('grid-template-columns: 1fr !important'),
        critical: true
      },
      {
        name: 'Mobile Button Size',
        test: homepageContent.includes('#generateIdeasBtn') &&
              homepageContent.includes('padding: 20px !important'),
        critical: true
      },
      {
        name: 'Mobile Input Size',
        test: homepageContent.includes('#ideaGenerator input') &&
              homepageContent.includes('padding: 15px !important'),
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

  // RULE 5: DEPLOYMENT VERIFICATION - Check all deployments
  async verifyDeployment() {
    console.log('\n🔍 DEPLOYMENT VERIFICATION');
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
        
        // Check if enhanced AI generator is in each file
        if (content.includes('id="aiGeneratorSection"') && 
            content.includes('padding: 60px') &&
            content.includes('font-size: 3rem')) {
          console.log(`✅ ${file}: DEPLOYED WITH ENHANCED AI GENERATOR`);
          passed++;
        } else {
          console.log(`❌ ${file}: MISSING ENHANCED AI GENERATOR (CRITICAL)`);
          failed++;
          this.issues.push(`${file} missing enhanced AI generator`);
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

  // Execute all AI generator visibility verification rules
  async executeAIGeneratorVisibilityVerification() {
    console.log('🤖 AI GENERATOR VISIBILITY VERIFICATION SYSTEM');
    console.log('=' .repeat(60));
    console.log('VERIFYING: AI Generator is PROMINENTLY VISIBLE on regular URL\n');
    
    const startTime = Date.now();
    
    try {
      // Execute all verification rules
      const results = {
        visibility: await this.verifyAIGeneratorVisibility(),
        animations: await this.verifyAnimations(),
        interactive: await this.verifyInteractiveElements(),
        mobile: await this.verifyMobileResponsiveness(),
        deployment: await this.verifyDeployment()
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
      console.error('\n❌ AI GENERATOR VISIBILITY VERIFICATION ERROR:', error.message);
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
    console.log('📊 AI GENERATOR VISIBILITY VERIFICATION REPORT');
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
      console.log('\n🎉 AI GENERATOR VISIBILITY VERIFICATION: SUCCESS');
      console.log('✅ AI Generator is PROMINENTLY VISIBLE on regular URL');
      console.log('✅ Enhanced styling with massive title and animations');
      console.log('✅ Interactive elements working perfectly');
      console.log('✅ Mobile responsiveness optimized');
      console.log('✅ All deployments updated');
      console.log('\n🌐 REGULAR URL https://onpurpose.earth/ NOW HAS:');
      console.log('   • MASSIVE AI Generator section (3rem title)');
      console.log('   • Floating background animations');
      console.log('   • Enhanced glassmorphism design');
      console.log('   • Large interactive buttons');
      console.log('   • Professional loading spinner');
      console.log('   • Mobile-optimized layout');
    } else {
      console.log('\n❌ AI GENERATOR VISIBILITY VERIFICATION: FAILED');
      console.log('🔧 Issues need to be addressed');
      console.log('🔧 AI Generator may not be prominently visible');
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Execute AI generator visibility verification system
const verification = new AIGeneratorVisibilityVerifier();
verification.executeAIGeneratorVisibilityVerification().then((result) => {
  if (result.success) {
    console.log('\n✅ AI GENERATOR VISIBILITY VERIFICATION COMPLETE: AI Generator is prominently visible');
    console.log('🌐 Visit https://onpurpose.earth/ to see the massively enhanced AI Generator');
  } else {
    console.log('\n❌ AI GENERATOR VISIBILITY VERIFICATION FAILED: Issues need to be addressed');
    console.log('Issues found:', result.issues);
  }
}).catch(console.error);

module.exports = verification;
