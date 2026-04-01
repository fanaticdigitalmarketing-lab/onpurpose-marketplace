// Debug and fix specific issues found in validation
const fs = require('fs');

console.log('🔍 DEBUGGING SPECIFIC ISSUES');

// Check frontend files for issues
const frontendFiles = [
  'frontend/index.html',
  'frontend/dashboard.html',
  'frontend/services.html',
  'frontend/provider.html',
  'frontend/service-detail.html',
  'frontend/idea-generator.html'
];

console.log('\n📄 FRONTEND ISSUES ANALYSIS:');
frontendFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for broken JavaScript
    const brokenJS = content.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]*undefined[^}]*\}/g);
    if (brokenJS) {
      console.log(`❌ ${file}: Broken JavaScript functions`);
      brokenJS.forEach(match => console.log(`   - ${match.substring(0, 100)}...`));
    }

    // Check for unmatched div tags
    const openDivs = (content.match(/<div[^>]*>/g) || []).length;
    const closeDivs = (content.match(/<\/div>/g) || []).length;
    if (openDivs !== closeDivs) {
      console.log(`❌ ${file}: Unmatched div tags (Open: ${openDivs}, Close: ${closeDivs})`);
    }

    // Check for CSS syntax errors
    const cssErrors = content.match(/[^{]+\{[^}]*[^;}]\s*}/g);
    if (cssErrors) {
      console.log(`❌ ${file}: CSS syntax errors`);
      cssErrors.forEach(match => console.log(`   - ${match.substring(0, 100)}...`));
    }

    if (!brokenJS && openDivs === closeDivs && !cssErrors) {
      console.log(`✅ ${file}: No obvious issues found`);
    }

  } catch (err) {
    console.log(`❌ ${file}: File read error - ${err.message}`);
  }
});

// Check API issues
console.log('\n🔌 API ISSUES ANALYSIS:');
const https = require('https');

async function testAPIEndpoint(path, method = 'GET', expected = 200) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'onpurpose.earth',
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
      resolve({ status: res.statusCode, expected, path });
    });

    req.on('error', () => resolve({ status: 'ERROR', expected, path }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ status: 'TIMEOUT', expected, path });
    });
    req.end();
  });
}

async function debugAPI() {
  const tests = [
    { path: '/health', method: 'GET', expected: 200 },
    { path: '/api/health', method: 'GET', expected: 200 },
    { path: '/api/services', method: 'GET', expected: 200 },
    { path: '/api/auth/register', method: 'POST', expected: 400 },
    { path: '/api/auth/login', method: 'POST', expected: 400 },
    { path: '/nonexistent', method: 'GET', expected: 404 }
  ];

  for (const test of tests) {
    const result = await testAPIEndpoint(test.path, test.method, test.expected);
    const icon = result.status === result.expected ? '✅' : '❌';
    console.log(`${icon} ${test.method} ${test.path}: ${result.status} (expected ${result.expected})`);
  }
}

debugAPI().catch(console.error);
