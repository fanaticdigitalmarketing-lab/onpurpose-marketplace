const http = require('http');

// Quick test to check main page content
async function checkMainPage() {
  console.log('🔍 CHECKING MAIN PAGE CONTENT\n');
  
  async function makeRequest(path) {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET'
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      
      req.on('error', reject);
      req.end();
    });
  }
  
  try {
    const response = await makeRequest('/');
    console.log('Status:', response.status);
    console.log('Content length:', response.body.length);
    
    // Check for key elements
    const checks = {
      'OnPurpose Title': response.body.includes('OnPurpose — Book People, Not Places'),
      'Design System': response.body.includes('--navy:#1a2744'),
      'iOS Optimizations': response.body.includes('-webkit-tap-highlight-color: transparent'),
      'Modal System': response.body.includes('modal-overlay'),
      'Toast System': response.body.includes('toast'),
      'Auth Functions': response.body.includes('openSignIn()'),
      'Service Grid': response.body.includes('services-grid'),
      'Button Styles': response.body.includes('btn-primary'),
      'Card Styles': response.body.includes('service-card'),
      'Responsive Design': response.body.includes('@media(max-width:768px)')
    };
    
    console.log('\n📋 CONTENT CHECKS:');
    Object.entries(checks).forEach(([key, value]) => {
      console.log(`${value ? '✓' : '✗'} ${key}`);
    });
    
    // Show first 500 characters
    console.log('\n📄 FIRST 500 CHARACTERS:');
    console.log(response.body.substring(0, 500));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkMainPage();
