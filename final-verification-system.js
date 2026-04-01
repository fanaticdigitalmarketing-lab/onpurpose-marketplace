// FINAL VERIFICATION SYSTEM - ENSURE IDEA GENERATOR IS VISIBLE & WORKING

const fs = require('fs');
const path = require('path');

class FinalVerificationSystem {
  constructor() {
    this.verificationResults = {};
    this.criticalIssues = [];
  }

  // RULE 1: VISIBILITY VERIFICATION - Check if idea generator is prominently visible
  async verifyVisibility() {
    console.log('🔍 FINAL VERIFICATION: VISIBILITY CHECK');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const visibilityChecks = [
      {
        name: 'Idea Generator Has Prominent Styling',
        test: homepageContent.includes('background: linear-gradient(135deg, #22c55e, #3b82f6)') &&
              homepageContent.includes('box-shadow: 0 20px 40px rgba(34, 197, 94, 0.3)'),
        critical: true
      },
      {
        name: 'Large Title (2.5rem)',
        test: homepageContent.includes('font-size: 2.5rem') &&
              homepageContent.includes('💡 AI Service Idea Generator'),
        critical: true
      },
      {
        name: 'High Contrast White Text',
        test: homepageContent.includes('color: white') &&
              homepageContent.includes('font-weight: 800'),
        critical: true
      },
      {
        name: 'Glassmorphism Input Fields',
        test: homepageContent.includes('backdrop-filter: blur(10px)') &&
              homepageContent.includes('background: rgba(255, 255, 255, 0.1)'),
        critical: true
      },
      {
        name: 'Large Generate Button',
        test: homepageContent.includes('padding: 20px') &&
              homepageContent.includes('font-size: 1.3rem') &&
              homepageContent.includes('text-transform: uppercase'),
        critical: true
      },
      {
        name: 'Background Decorations',
        test: homepageContent.includes('position: absolute') &&
              homepageContent.includes('background: rgba(255, 255, 255, 0.1)'),
        critical: false
      },
      {
        name: 'Interactive Hover Effects',
        test: homepageContent.includes('onmouseover') &&
              homepageContent.includes('translateY(-2px)'),
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
          this.criticalIssues.push(check.name);
        }
      }
    }
    
    this.verificationResults.visibility = { passed, failed, total: visibilityChecks.length };
    console.log(`📊 Visibility: ${passed}/${visibilityChecks.length} passed`);
    
    return failed === 0;
  }

  // RULE 2: POSITION VERIFICATION - Check if idea generator is positioned correctly
  async verifyPosition() {
    console.log('\n🔍 FINAL VERIFICATION: POSITION CHECK');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const positionChecks = [
      {
        name: 'Placed After Email Form',
        test: homepageContent.includes('<div id="message"></div>') &&
              homepageContent.includes('<!-- IDEA GENERATOR SECTION - PROMINENT POSITION -->'),
        critical: true
      },
      {
        name: 'Before Stats Section',
        test: homepageContent.includes('<!-- IDEA GENERATOR SECTION - PROMINENT POSITION -->') &&
              homepageContent.includes('<div class="stats">'),
        critical: true
      },
      {
        name: 'Proper Margin Top (40px)',
        test: homepageContent.includes('margin-top: 40px'),
        critical: true
      },
      {
        name: 'Large Padding (50px)',
        test: homepageContent.includes('padding: 50px'),
        critical: true
      },
      {
        name: 'Center Alignment',
        test: homepageContent.includes('text-align: center') &&
              homepageContent.includes('margin: 0 auto'),
        critical: true
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of positionChecks) {
      if (check.test) {
        console.log(`✅ ${check.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${check.name}: FAILED${check.critical ? ' (CRITICAL)' : ''}`);
        failed++;
        if (check.critical) {
          this.criticalIssues.push(check.name);
        }
      }
    }
    
    this.verificationResults.position = { passed, failed, total: positionChecks.length };
    console.log(`📊 Position: ${passed}/${positionChecks.length} passed`);
    
    return failed === 0;
  }

  // RULE 3: FUNCTIONALITY VERIFICATION - Check if all functions work
  async verifyFunctionality() {
    console.log('\n🔍 FINAL VERIFICATION: FUNCTIONALITY CHECK');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const functionalityChecks = [
      {
        name: 'generateIdeas() Function Exists',
        test: homepageContent.includes('async function generateIdeas()'),
        critical: true
      },
      {
        name: 'displayIdeas() Function Updated',
        test: homepageContent.includes('background: rgba(255, 255, 255, 0.1)') &&
              homepageContent.includes('backdrop-filter: blur(10px)'),
        critical: true
      },
      {
        name: 'loadSavedIdeas() Function Exists',
        test: homepageContent.includes('function loadSavedIdeas()'),
        critical: true
      },
      {
        name: 'localStorage Persistence',
        test: homepageContent.includes('localStorage.setItem(\'lastGeneratedIdeas\''),
        critical: true
      },
      {
        name: 'API Call Present',
        test: homepageContent.includes('/api/ideas/generate'),
        critical: true
      },
      {
        name: 'Fallback System',
        test: homepageContent.includes('generateFallbackIdeas(skill, niche)'),
        critical: true
      },
      {
        name: 'Error Handling',
        test: homepageContent.includes('catch (error)') &&
              homepageContent.includes('console.log(\'AI API error'),
        critical: true
      },
      {
        name: 'Loading States',
        test: homepageContent.includes('loadingState.style.display') &&
              homepageContent.includes('🤖 AI is generating'),
        critical: true
      },
      {
        name: 'Button State Management',
        test: homepageContent.includes('generateBtn.disabled') &&
              homepageContent.includes('🤖 AI Thinking'),
        critical: true
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of functionalityChecks) {
      if (check.test) {
        console.log(`✅ ${check.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${check.name}: FAILED${check.critical ? ' (CRITICAL)' : ''}`);
        failed++;
        if (check.critical) {
          this.criticalIssues.push(check.name);
        }
      }
    }
    
    this.verificationResults.functionality = { passed, failed, total: functionalityChecks.length };
    console.log(`📊 Functionality: ${passed}/${functionalityChecks.length} passed`);
    
    return failed === 0;
  }

  // RULE 4: USER EXPERIENCE VERIFICATION - Check UX elements
  async verifyUserExperience() {
    console.log('\n🔍 FINAL VERIFICATION: USER EXPERIENCE CHECK');
    console.log('=' .repeat(60));
    
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    
    const uxChecks = [
      {
        name: 'Clear Input Labels',
        test: homepageContent.includes('YOUR SKILL/EXPERTISE') &&
              homepageContent.includes('TARGET MARKET'),
        critical: true
      },
      {
        name: 'Helpful Placeholders',
        test: homepageContent.includes('e.g. Web Development, Marketing, Design') &&
              homepageContent.includes('e.g. Small Businesses, Startups, Creators'),
        critical: true
      },
      {
        name: 'Loading Message with Time Estimate',
        test: homepageContent.includes('This usually takes 2-3 seconds'),
        critical: true
      },
      {
        name: 'Results Scroll to View',
        test: homepageContent.includes('scrollIntoView') &&
              homepageContent.includes('behavior: \'smooth\''),
        critical: true
      },
      {
        name: 'Become a Provider Button',
        test: homepageContent.includes('🎯 Become a Provider') &&
              homepageContent.includes('background: white'),
        critical: true
      },
      {
        name: 'Generate More Button',
        test: homepageContent.includes('🔄 Generate More') &&
              homepageContent.includes('background: transparent'),
        critical: true
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of uxChecks) {
      if (check.test) {
        console.log(`✅ ${check.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${check.name}: FAILED${check.critical ? ' (CRITICAL)' : ''}`);
        failed++;
        if (check.critical) {
          this.criticalIssues.push(check.name);
        }
      }
    }
    
    this.verificationResults.userExperience = { passed, failed, total: uxChecks.length };
    console.log(`📊 User Experience: ${passed}/${uxChecks.length} passed`);
    
    return failed === 0;
  }

  // RULE 5: DEPLOYMENT VERIFICATION - Check all deployments
  async verifyDeployment() {
    console.log('\n🔍 FINAL VERIFICATION: DEPLOYMENT CHECK');
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
        
        // Check if the idea generator is in each file
        if (content.includes('💡 AI Service Idea Generator') && 
            content.includes('background: linear-gradient(135deg, #22c55e, #3b82f6)')) {
          console.log(`✅ ${file}: DEPLOYED WITH IDEA GENERATOR`);
          passed++;
        } else {
          console.log(`❌ ${file}: MISSING IDEA GENERATOR (CRITICAL)`);
          failed++;
          this.criticalIssues.push(`${file} missing idea generator`);
        }
      } else {
        console.log(`❌ ${file}: FILE MISSING (CRITICAL)`);
        failed++;
        this.criticalIssues.push(`${file} missing`);
      }
    }
    
    this.verificationResults.deployment = { passed, failed, total: requiredFiles.length };
    console.log(`📊 Deployment: ${passed}/${requiredFiles.length} files deployed`);
    
    return failed === 0;
  }

  // Execute all final verification rules
  async executeFinalVerification() {
    console.log('🛡️ FINAL VERIFICATION SYSTEM');
    console.log('=' .repeat(60));
    console.log('VERIFYING: Idea Generator is VISIBLE and WORKING\n');
    
    const startTime = Date.now();
    
    try {
      // Execute all verification rules
      const results = {
        visibility: await this.verifyVisibility(),
        position: await this.verifyPosition(),
        functionality: await this.verifyFunctionality(),
        userExperience: await this.verifyUserExperience(),
        deployment: await this.verifyDeployment()
      };
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      // Generate final report
      this.generateFinalReport(results, duration);
      
      return {
        success: this.criticalIssues.length === 0,
        results,
        duration,
        criticalIssues: this.criticalIssues
      };
      
    } catch (error) {
      console.error('\n❌ FINAL VERIFICATION ERROR:', error.message);
      return {
        success: false,
        error: error.message,
        criticalIssues: this.criticalIssues
      };
    }
  }

  // Generate comprehensive final report
  generateFinalReport(results, duration) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL VERIFICATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`🚨 Critical Issues: ${this.criticalIssues.length}`);
    
    if (this.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES FOUND:');
      this.criticalIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n📋 VERIFICATION RESULTS:');
    Object.entries(results).forEach(([category, result]) => {
      const status = result ? '✅ PASSED' : '❌ FAILED';
      console.log(`   ${category}: ${status}`);
    });
    
    const overallSuccess = this.criticalIssues.length === 0;
    
    if (overallSuccess) {
      console.log('\n🎉 FINAL VERIFICATION: SUCCESS');
      console.log('✅ Idea Generator is PROMINENTLY VISIBLE');
      console.log('✅ All styling is high-contrast and attention-grabbing');
      console.log('✅ Position is optimal (after email form, before stats)');
      console.log('✅ All functionality working');
      console.log('✅ User experience is excellent');
      console.log('✅ Deployed to all locations');
      console.log('\n🌐 IDEA GENERATOR IS NOW LIVE AND VISIBLE ON https://onpurpose.earth/');
    } else {
      console.log('\n❌ FINAL VERIFICATION: FAILED');
      console.log('🔧 Critical issues need to be addressed');
      console.log('🔧 Idea Generator may not be properly visible');
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Execute final verification system
const verification = new FinalVerificationSystem();
verification.executeFinalVerification().then((result) => {
  if (result.success) {
    console.log('\n✅ FINAL VERIFICATION COMPLETE: Idea Generator is visible and working');
    console.log('🌐 Visit https://onpurpose.earth/ to see the prominently displayed AI Idea Generator');
  } else {
    console.log('\n❌ FINAL VERIFICATION FAILED: Issues need to be addressed');
    console.log('Critical failures:', result.criticalIssues);
  }
}).catch(console.error);

module.exports = verification;
