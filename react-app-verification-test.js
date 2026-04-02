// 🧪 REACT APP VERIFICATION TEST
// Check if the React app is actually being served

const https = require('https');

console.log('🔍 REACT APP VERIFICATION TEST');
console.log('============================');

const testUrls = [
  'https://onpurpose.earth/',
  'https://69ce49b90fab142e27d38532--onpurpose.netlify.app/'
];

async function testReactApp(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Check for React app indicators
        const hasReactRoot = data.includes('<div id="root"></div>');
        const hasReactScript = data.includes('/static/js/main.');
        const hasReactCSS = data.includes('/static/css/main.');
        const hasHashRouter = data.includes('HashRouter');
        const hasReactManifest = data.includes('/manifest.json');
        
        // Check for static HTML indicators
        const hasStaticContent = data.includes('Book People.Not Places.') && 
                                data.includes('Three steps to your session') &&
                                data.includes('AI Service Idea Generator');
        
        console.log(`\n📊 Testing: ${url}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`React Root Element: ${hasReactRoot ? '✅ Found' : '❌ Missing'}`);
        console.log(`React Script: ${hasReactScript ? '✅ Found' : '❌ Missing'}`);
        console.log(`React CSS: ${hasReactCSS ? '✅ Found' : '❌ Missing'}`);
        console.log(`HashRouter: ${hasHashRouter ? '✅ Found' : '❌ Missing'}`);
        console.log(`React Manifest: ${hasReactManifest ? '✅ Found' : '❌ Missing'}`);
        console.log(`Static HTML Content: ${hasStaticContent ? '❌ Found (Problem)' : '✅ None'}`);
        
        // Check content length (React apps are usually longer)
        console.log(`Content Length: ${data.length} characters`);
        
        // Determine what's being served
        let contentType;
        if (hasStaticContent && !hasReactRoot) {
          contentType = 'Static HTML (Problem)';
        } else if (hasReactRoot && hasReactScript) {
          contentType = 'React App (Correct)';
        } else {
          contentType = 'Unknown/Mixed';
        }
        
        console.log(`Content Type: ${contentType}`);
        
        resolve({
          url,
          status: res.statusCode,
          hasReactRoot,
          hasReactScript,
          hasReactCSS,
          hasHashRouter,
          hasReactManifest,
          hasStaticContent,
          contentLength: data.length,
          contentType,
          isCorrect: hasReactRoot && hasReactScript && !hasStaticContent
        });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Error testing ${url}:`, err.message);
      reject(err);
    });
  });
}

async function runAllTests() {
  console.log('🔍 Testing if React app is being served correctly...\n');
  
  const results = [];
  for (const url of testUrls) {
    try {
      const result = await testReactApp(url);
      results.push(result);
    } catch (error) {
      console.log(`❌ Failed to test ${url}:`, error.message);
    }
  }
  
  console.log('\n🎯 SUMMARY:');
  console.log('============');
  
  results.forEach(result => {
    console.log(`\n📊 ${result.url}`);
    console.log(`Status: ${result.isCorrect ? '✅ Correct' : '❌ Problem'}`);
    console.log(`Type: ${result.contentType}`);
  });
  
  const allCorrect = results.every(r => r.isCorrect);
  
  if (allCorrect) {
    console.log('\n🎉 SUCCESS: React app is being served correctly on all URLs!');
  } else {
    console.log('\n⚠️  PROBLEM: Static HTML is being served instead of React app');
    console.log('\n🔧 SOLUTION NEEDED:');
    console.log('1. Check for conflicting HTML files in root directory');
    console.log('2. Ensure Netlify is serving from frontend/build directory');
    console.log('3. Clear Netlify cache completely');
    console.log('4. Check netlify.toml configuration');
  }
  
  return results;
}

runAllTests();
