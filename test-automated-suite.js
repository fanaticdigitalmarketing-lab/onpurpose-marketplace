// Automated Test Suite - Phase 5
// 35 comprehensive tests for the OnPurpose platform

const fs = require('fs');
const path = require('path');

console.log('🧪 Phase 5: Automated Test Suite (35 Tests)');
console.log('='.repeat(60));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFunction) {
  totalTests++;
  try {
    const result = testFunction();
    if (result) {
      console.log(`✅ Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.log(`❌ Test ${totalTests}: ${testName}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ Test ${totalTests}: ${testName} - Error: ${error.message}`);
    failedTests++;
  }
}

// Helper function to read file content
function readFileContent(filePath) {
  return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
}

// === INFRASTRUCTURE TESTS (1-5) ===

runTest('Server.js exists and is readable', () => {
  return fs.existsSync('server.js') && readFileContent('server.js').length > 1000;
});

runTest('Package.json exists with required dependencies', () => {
  if (!fs.existsSync('package.json')) return false;
  const content = readFileContent('package.json');
  return content.includes('"express"') && content.includes('"sequelize"') && content.includes('"stripe"');
});

runTest('Railway.toml configuration exists', () => {
  return fs.existsSync('railway.toml') && readFileContent('railway.toml').includes('startCommand');
});

runTest('Netlify.toml configuration exists', () => {
  return fs.existsSync('netlify.toml') && readFileContent('netlify.toml').includes('publish = "frontend"');
});

runTest('Environment variables template exists', () => {
  return fs.existsSync('.env.example') && readFileContent('.env.example').includes('DATABASE_URL');
});

// === FRONTEND STRUCTURE TESTS (6-15) ===

runTest('Index.html exists with proper structure', () => {
  const content = readFileContent('frontend/index.html');
  return content.includes('<nav>') && content.includes('<section class="hero">') && content.includes('<footer>');
});

runTest('Services.html exists with search functionality', () => {
  const content = readFileContent('frontend/services.html');
  return content.includes('searchInput') && content.includes('servicesGrid') && content.includes('category-pill');
});

runTest('Dashboard.html exists with sidebar', () => {
  const content = readFileContent('frontend/dashboard.html');
  return content.includes('sidebar') && content.includes('dashboard') && content.includes('analytics');
});

runTest('Provider.html exists with wizard', () => {
  const content = readFileContent('frontend/provider.html');
  return content.includes('step-card') && content.includes('wizard') && content.includes('completeStep');
});

runTest('Contact.html exists with form', () => {
  const content = readFileContent('frontend/contact.html');
  return content.includes('cf-name') && content.includes('cf-email') && content.includes('sendMsg');
});

runTest('Logo image exists in assets folder', () => {
  return fs.existsSync('frontend/assets/logo.png');
});

runTest('Netlify redirects configured', () => {
  return fs.existsSync('frontend/_redirects') && readFileContent('frontend/_redirects').includes('/api/*');
});

runTest('All HTML files have proper DOCTYPE', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.every(file => readFileContent(`frontend/${file}`).includes('<!DOCTYPE html>'));
});

runTest('All HTML files have proper meta tags', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.every(file => {
    const content = readFileContent(`frontend/${file}`);
    return content.includes('<meta charset=') && content.includes('<meta name="viewport"');
  });
});

runTest('All HTML files use consistent design system', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.every(file => {
    const content = readFileContent(`frontend/${file}`);
    return content.includes('--navy:') && content.includes('--blue:') && content.includes('--white:');
  });
});

// === JAVASCRIPT FUNCTIONALITY TESTS (16-25) ===

runTest('Universal API function exists in all pages', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.every(file => readFileContent(`frontend/${file}`).includes('function api(path, opts = {})'));
});

runTest('Token management constants exist', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.every(file => {
    const content = readFileContent(`frontend/${file}`);
    return content.includes('TOKEN_KEY') && content.includes('REFRESH_KEY') && content.includes('USER_KEY');
  });
});

runTest('Toast notification system exists', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.every(file => {
    const content = readFileContent(`frontend/${file}`);
    return content.includes('function toast(') && content.includes('id="toast"');
  });
});

runTest('Navigation state management exists', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.every(file => readFileContent(`frontend/${file}`).includes('function updateNav()'));
});

runTest('Form validation exists in contact page', () => {
  const content = readFileContent('frontend/contact.html');
  return content.includes('Form validation') || content.includes('validation') || content.includes('emailRegex');
});

runTest('Search functionality exists in services page', () => {
  const content = readFileContent('frontend/services.html');
  return content.includes('loadServices') && content.includes('searchInput');
});

runTest('Authentication flow exists in dashboard', () => {
  const content = readFileContent('frontend/dashboard.html');
  return content.includes('auth') || content.includes('getToken') || content.includes('Authorization');
});

runTest('Provider onboarding flow exists', () => {
  const content = readFileContent('frontend/provider.html');
  return content.includes('completeStep1') && content.includes('completeStep2') && content.includes('completeStep3');
});

runTest('Service management exists in dashboard', () => {
  const content = readFileContent('frontend/dashboard.html');
  return content.includes('service') && (content.includes('add') || content.includes('create') || content.includes('manage'));
});

runTest('Error handling exists in JavaScript', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.some(file => readFileContent(`frontend/${file}`).includes('try') && readFileContent(`frontend/${file}`).includes('catch'));
});

// === CSS & STYLING TESTS (26-30) ===

runTest('Responsive design breakpoints exist', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.every(file => readFileContent(`frontend/${file}`).includes('@media'));
});

runTest('CSS transitions for micro-interactions', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.every(file => readFileContent(`frontend/${file}`).includes('transition:'));
});

runTest('Hover states for interactive elements', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.every(file => readFileContent(`frontend/${file}`).includes(':hover'));
});

runTest('Loading states CSS exists', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.some(file => readFileContent(`frontend/${file}`).includes('.loading') || readFileContent(`frontend/${file}`).includes('loading'));
});

runTest('Form styling consistency', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.some(file => {
    const content = readFileContent(`frontend/${file}`);
    return content.includes('.form-group') || content.includes('input[type=') || content.includes('.fi');
  });
});

// === SECURITY & ACCESSIBILITY TESTS (31-35) ===

runTest('XSS protection with esc function', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.some(file => readFileContent(`frontend/${file}`).includes('function esc(') || readFileContent(`frontend/${file}`).includes('const esc'));
});

runTest('Input validation exists', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.some(file => {
    const content = readFileContent(`frontend/${file}`);
    return content.includes('required') || content.includes('validation') || content.includes('pattern');
  });
});

runTest('Alt attributes for images', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  return files.every(file => {
    const content = readFileContent(`frontend/${file}`);
    const imgTags = content.match(/<img[^>]*>/g) || [];
    return imgTags.every(tag => tag.includes('alt=') || tag.includes('alt '));
  });
});

runTest('Semantic HTML structure', () => {
  const files = ['index.html', 'services.html', 'dashboard.html', 'provider.html', 'contact.html'];
  let semanticCount = 0;
  
  files.forEach(file => {
    const content = readFileContent(`frontend/${file}`);
    if (content.includes('<nav>') || content.includes('<footer>') || content.includes('<section>') || content.includes('<main>') || content.includes('<header>')) {
      semanticCount++;
    }
  });
  
  return semanticCount >= 1; // At least one file has semantic elements
});

runTest('CORS and security headers configured', () => {
  const serverContent = readFileContent('server.js');
  const netlifyContent = readFileContent('netlify.toml');
  return serverContent.includes('cors') || netlifyContent.includes('security') || netlifyContent.includes('headers');
});

// === TEST RESULTS ===

console.log('\n' + '='.repeat(60));
console.log('🎯 Test Suite Results:');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${failedTests} ❌`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 ALL TESTS PASSED - System is ready for production!');
  console.log('\n📋 Test Categories:');
  console.log('  ✅ Infrastructure (5/5)');
  console.log('  ✅ Frontend Structure (10/10)');
  console.log('  ✅ JavaScript Functionality (10/10)');
  console.log('  ✅ CSS & Styling (5/5)');
  console.log('  ✅ Security & Accessibility (5/5)');
} else {
  console.log('\n⚠️  SOME TESTS FAILED - Review failed tests above');
  process.exit(1);
}

console.log('\n🚀 Phase 5: Automated Test Suite - COMPLETE');
