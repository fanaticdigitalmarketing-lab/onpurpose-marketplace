// SOCIAL MEDIA TEST REPORT - Test both Twitter and Facebook sharing

const fs = require('fs');
const path = require('path');

class SocialMediaTestReport {
  constructor() {
    this.testResults = {};
    this.currentMetaTags = this.extractCurrentMetaTags();
  }

  // Extract current meta tags from index.html
  extractCurrentMetaTags() {
    const homepageContent = fs.readFileSync('index.html', 'utf8');
    const metaTags = {};
    
    // Extract Open Graph tags
    const ogMatches = homepageContent.match(/<meta property="og:([^"]+)" content="([^"]+)"/g);
    if (ogMatches) {
      ogMatches.forEach(match => {
        const [, property, content] = match.match(/property="og:([^"]+)" content="([^"]+)"/);
        metaTags[`og:${property}`] = content;
      });
    }
    
    // Extract Twitter Card tags
    const twitterMatches = homepageContent.match(/<meta name="twitter:([^"]+)" content="([^"]+)"/g);
    if (twitterMatches) {
      twitterMatches.forEach(match => {
        const [, name, content] = match.match(/name="twitter:([^"]+)" content="([^"]+)"/);
        metaTags[`twitter:${name}`] = content;
      });
    }
    
    // Extract other meta tags
    const titleMatch = homepageContent.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) metaTags.title = titleMatch[1];
    
    const descMatch = homepageContent.match(/<meta name="description" content="([^"]+)"/);
    if (descMatch) metaTags.description = descMatch[1];
    
    return metaTags;
  }

  // Test Twitter Card requirements
  testTwitterCardRequirements() {
    console.log('🐦 TWITTER CARD REQUIREMENTS TEST');
    console.log('=' .repeat(50));
    
    const twitterRequirements = [
      {
        tag: 'twitter:card',
        expected: 'summary_large_image',
        current: this.currentMetaTags['twitter:card'],
        status: this.currentMetaTags['twitter:card'] === 'summary_large_image' ? '✅' : '❌'
      },
      {
        tag: 'twitter:title',
        expected: 'OnPurpose — Turn Your Skills Into Services',
        current: this.currentMetaTags['twitter:title'],
        status: this.currentMetaTags['twitter:title'] === 'OnPurpose — Turn Your Skills Into Services' ? '✅' : '❌'
      },
      {
        tag: 'twitter:description',
        expected: 'Discover what you can offer, then launch it instantly.',
        current: this.currentMetaTags['twitter:description'],
        status: this.currentMetaTags['twitter:description'] === 'Discover what you can offer, then launch it instantly.' ? '✅' : '❌'
      },
      {
        tag: 'twitter:image',
        expected: 'https://onpurpose.earth/og-image.png',
        current: this.currentMetaTags['twitter:image'],
        status: this.currentMetaTags['twitter:image'] && this.currentMetaTags['twitter:image'].includes('onpurpose.earth/og-image.png') ? '✅' : '❌'
      },
      {
        tag: 'twitter:url',
        expected: 'https://onpurpose.earth',
        current: this.currentMetaTags['twitter:url'],
        status: this.currentMetaTags['twitter:url'] === 'https://onpurpose.earth' ? '✅' : '❌'
      },
      {
        tag: 'twitter:site',
        expected: '@onpurpose',
        current: this.currentMetaTags['twitter:site'],
        status: this.currentMetaTags['twitter:site'] === '@onpurpose' ? '✅' : '❌'
      }
    ];
    
    console.log('Twitter Card Meta Tags:');
    twitterRequirements.forEach(req => {
      console.log(`${req.status} ${req.tag}: ${req.current}`);
    });
    
    const passed = twitterRequirements.filter(req => req.status === '✅').length;
    const total = twitterRequirements.length;
    
    console.log(`\n📊 Twitter Card: ${passed}/${total} requirements met`);
    
    return { passed, total, requirements: twitterRequirements };
  }

  // Test Facebook Open Graph requirements
  testFacebookRequirements() {
    console.log('\n📘 FACEBOOK OPEN GRAPH REQUIREMENTS TEST');
    console.log('=' .repeat(50));
    
    const facebookRequirements = [
      {
        tag: 'og:title',
        expected: 'OnPurpose — Turn Your Skills Into Services',
        current: this.currentMetaTags['og:title'],
        status: this.currentMetaTags['og:title'] === 'OnPurpose — Turn Your Skills Into Services' ? '✅' : '❌'
      },
      {
        tag: 'og:description',
        expected: 'Discover what you can offer, then launch it instantly.',
        current: this.currentMetaTags['og:description'],
        status: this.currentMetaTags['og:description'] === 'Discover what you can offer, then launch it instantly.' ? '✅' : '❌'
      },
      {
        tag: 'og:image',
        expected: 'https://onpurpose.earth/og-image.png',
        current: this.currentMetaTags['og:image'],
        status: this.currentMetaTags['og:image'] && this.currentMetaTags['og:image'].includes('onpurpose.earth/og-image.png') ? '✅' : '❌'
      },
      {
        tag: 'og:image:width',
        expected: '1200',
        current: this.currentMetaTags['og:image:width'],
        status: this.currentMetaTags['og:image:width'] === '1200' ? '✅' : '❌'
      },
      {
        tag: 'og:image:height',
        expected: '630',
        current: this.currentMetaTags['og:image:height'],
        status: this.currentMetaTags['og:image:height'] === '630' ? '✅' : '❌'
      },
      {
        tag: 'og:image:type',
        expected: 'image/png',
        current: this.currentMetaTags['og:image:type'],
        status: this.currentMetaTags['og:image:type'] === 'image/png' ? '✅' : '❌'
      },
      {
        tag: 'og:url',
        expected: 'https://onpurpose.earth',
        current: this.currentMetaTags['og:url'],
        status: this.currentMetaTags['og:url'] === 'https://onpurpose.earth' ? '✅' : '❌'
      },
      {
        tag: 'og:type',
        expected: 'website',
        current: this.currentMetaTags['og:type'],
        status: this.currentMetaTags['og:type'] === 'website' ? '✅' : '❌'
      },
      {
        tag: 'og:site_name',
        expected: 'OnPurpose',
        current: this.currentMetaTags['og:site_name'],
        status: this.currentMetaTags['og:site_name'] === 'OnPurpose' ? '✅' : '❌'
      }
    ];
    
    console.log('Facebook Open Graph Meta Tags:');
    facebookRequirements.forEach(req => {
      console.log(`${req.status} ${req.tag}: ${req.current}`);
    });
    
    const passed = facebookRequirements.filter(req => req.status === '✅').length;
    const total = facebookRequirements.length;
    
    console.log(`\n📊 Facebook Open Graph: ${passed}/${total} requirements met`);
    
    return { passed, total, requirements: facebookRequirements };
  }

  // Test image requirements
  testImageRequirements() {
    console.log('\n🖼️ IMAGE REQUIREMENTS TEST');
    console.log('=' .repeat(50));
    
    const imageUrl = this.currentMetaTags['og:image'] || this.currentMetaTags['twitter:image'];
    
    const imageChecks = [
      {
        check: 'HTTPS Protocol',
        status: imageUrl && imageUrl.startsWith('https://') ? '✅' : '❌',
        details: imageUrl ? (imageUrl.startsWith('https://') ? 'Secure' : 'Not secure') : 'Missing'
      },
      {
        check: 'Reliable Service',
        status: imageUrl && (imageUrl.includes('unsplash.com') || imageUrl.includes('via.placeholder.com') || imageUrl.includes('onpurpose.earth')) ? '✅' : '❌',
        details: imageUrl ? (imageUrl.includes('unsplash.com') ? 'Unsplash - Reliable' : imageUrl.includes('via.placeholder.com') ? 'Placeholder - Reliable' : imageUrl.includes('onpurpose.earth') ? 'Local Image - Reliable' : 'Unknown service') : 'Missing'
      },
      {
        check: 'Dimensions Specified',
        status: this.currentMetaTags['og:image:width'] && this.currentMetaTags['og:image:height'] ? '✅' : '❌',
        details: `${this.currentMetaTags['og:image:width'] || 'Missing'}x${this.currentMetaTags['og:image:height'] || 'Missing'}`
      },
      {
        check: 'Minimum Size (200x200)',
        status: this.currentMetaTags['og:image:width'] >= 200 && this.currentMetaTags['og:image:height'] >= 200 ? '✅' : '❌',
        details: `Current: ${this.currentMetaTags['og:image:width'] || 'Missing'}x${this.currentMetaTags['og:image:height'] || 'Missing'}`
      },
      {
        check: 'Optimal Size (1200x630)',
        status: this.currentMetaTags['og:image:width'] === '1200' && this.currentMetaTags['og:image:height'] === '630' ? '✅' : '❌',
        details: `Current: ${this.currentMetaTags['og:image:width'] || 'Missing'}x${this.currentMetaTags['og:image:height'] || 'Missing'}`
      },
      {
        check: 'Image Format',
        status: (this.currentMetaTags['og:image:type'] === 'image/jpeg' || this.currentMetaTags['og:image:type'] === 'image/png') ? '✅' : '❌',
        details: this.currentMetaTags['og:image:type'] || 'Not specified'
      }
    ];
    
    console.log('Image Requirements:');
    imageChecks.forEach(check => {
      console.log(`${check.status} ${check.check}: ${check.details}`);
    });
    
    const passed = imageChecks.filter(check => check.status === '✅').length;
    const total = imageChecks.length;
    
    console.log(`\n📊 Image Requirements: ${passed}/${total} checks passed`);
    
    return { passed, total, checks: imageChecks };
  }

  // Generate comprehensive test report
  generateTestReport() {
    console.log('🔍 SOCIAL MEDIA TEST REPORT');
    console.log('=' .repeat(60));
    console.log('Testing current implementation for Twitter Cards and Facebook Open Graph\n');
    
    // Display current meta tags
    console.log('📋 CURRENT META TAGS:');
    console.log('-'.repeat(30));
    Object.entries(this.currentMetaTags).forEach(([tag, value]) => {
      console.log(`${tag}: ${value}`);
    });
    
    // Run all tests
    const twitterResults = this.testTwitterCardRequirements();
    const facebookResults = this.testFacebookRequirements();
    const imageResults = this.testImageRequirements();
    
    // Calculate overall score
    const totalTests = twitterResults.total + facebookResults.total + imageResults.total;
    const totalPassed = twitterResults.passed + facebookResults.passed + imageResults.passed;
    const score = Math.round((totalPassed / totalTests) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 OVERALL TEST RESULTS');
    console.log('=' .repeat(60));
    
    console.log(`🐦 Twitter Card: ${twitterResults.passed}/${twitterResults.total} (${Math.round((twitterResults.passed/twitterResults.total)*100)}%)`);
    console.log(`📘 Facebook Open Graph: ${facebookResults.passed}/${facebookResults.total} (${Math.round((facebookResults.passed/facebookResults.total)*100)}%)`);
    console.log(`🖼️ Image Requirements: ${imageResults.passed}/${imageResults.total} (${Math.round((imageResults.passed/imageResults.total)*100)}%)`);
    console.log(`🎯 Overall Score: ${totalPassed}/${totalTests} (${score}%)`);
    
    // Determine status
    const status = score >= 90 ? '🎉 EXCELLENT' : score >= 80 ? '✅ GOOD' : score >= 70 ? '⚠️ NEEDS IMPROVEMENT' : '❌ CRITICAL ISSUES';
    
    console.log(`\n🎯 STATUS: ${status}`);
    
    // Provide testing instructions
    console.log('\n🔗 TESTING INSTRUCTIONS:');
    console.log('-------------------');
    console.log('🐦 Twitter Card Validator:');
    console.log('   1. Go to: https://cards-dev.x.com/validator');
    console.log('   2. Enter: https://onpurpose.earth');
    console.log('   3. Click "Validate"');
    console.log('   4. Check for any warnings or errors');
    
    console.log('\n📘 Facebook Debugger:');
    console.log('   1. Go to: https://developers.facebook.com/tools/debug/');
    console.log('   2. Enter: https://onpurpose.earth');
    console.log('   3. Click "Debug"');
    console.log('   4. Check for "Image Too Small" or other warnings');
    console.log('   5. Click "Scrape Again" if needed to refresh cache');
    
    // Expected results
    console.log('\n✅ EXPECTED RESULTS:');
    console.log('-------------------');
    console.log('🐦 Twitter Card:');
    console.log('   • Card type: summary_large_image');
    console.log('   • Title: "OnPurpose — Turn Your Skills Into Services"');
    console.log('   • Description: Discover what you can offer, then launch it instantly.');
    console.log('   • Image: 1200x630 local og-image.png');
    console.log('   • No warnings or errors');
    
    console.log('\n📘 Facebook:');
    console.log('   • Title: "OnPurpose — Turn Your Skills Into Services"');
    console.log('   • Description: Discover what you can offer, then launch it instantly.');
    console.log('   • Image: 1200x630 local og-image.png, no warnings');
    console.log('   • All Open Graph tags recognized');
    console.log('   • Rich preview with proper formatting');
    
    // Troubleshooting
    if (score < 100) {
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('-------------------');
      
      if (twitterResults.passed < twitterResults.total) {
        console.log('🐦 Twitter Card Issues:');
        twitterResults.requirements.filter(req => req.status === '❌').forEach(req => {
          console.log(`   • ${req.tag}: ${req.current}`);
        });
      }
      
      if (facebookResults.passed < facebookResults.total) {
        console.log('📘 Facebook Issues:');
        facebookResults.requirements.filter(req => req.status === '❌').forEach(req => {
          console.log(`   • ${req.tag}: ${req.current}`);
        });
      }
      
      if (imageResults.passed < imageResults.total) {
        console.log('🖼️ Image Issues:');
        imageResults.checks.filter(check => check.status === '❌').forEach(check => {
          console.log(`   • ${check.check}: ${check.details}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
    return {
      score,
      totalPassed,
      totalTests,
      twitterResults,
      facebookResults,
      imageResults,
      status
    };
  }
}

// Execute the social media test report
const smTest = new SocialMediaTestReport();
const results = smTest.generateTestReport();

console.log('\n💾 Test report saved to memory for reference');
console.log('🌐 Ready to test with the provided URLs');
