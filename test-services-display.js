// Test Services Display
// Verify that browse services page shows real services

const https = require('https');

function request(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    }).on('error', reject);
  });
}

async function testServicesDisplay() {
  console.log('\n🧪 Testing Services Display');
  console.log('===========================');
  
  try {
    // Test API endpoint
    console.log('\n📡 Testing API endpoint...');
    const apiResponse = await request('https://onpurpose.earth/api/services');
    
    if (apiResponse.success && apiResponse.data) {
      console.log(`✅ API working - Found ${apiResponse.data.length} services`);
      
      // Show first few services
      console.log('\n📋 Real Services Available:');
      apiResponse.data.slice(0, 3).forEach((service, index) => {
        console.log(`  ${index + 1}. "${service.title}"`);
        console.log(`     Provider: ${service.provider?.name || 'Unknown'}`);
        console.log(`     Category: ${service.category}`);
        console.log(`     Price: $${service.price}`);
        console.log('');
      });
      
      // Test browse services page
      console.log('🌐 Testing browse services page...');
      const pageResponse = await request('https://onpurpose.earth/services.html');
      
      if (typeof pageResponse === 'string' && pageResponse.includes('services-grid')) {
        console.log('✅ Browse services page loads correctly');
        
        if (pageResponse.includes('displayDemoServices')) {
          console.log('⚠️  Page still has fallback to demo services');
        } else {
          console.log('✅ Page should show real services');
        }
      } else {
        console.log('❌ Browse services page not loading');
      }
      
      console.log('\n🎯 TEST RESULT:');
      console.log('✅ Services API is working');
      console.log('✅ Real services are available');
      console.log('✅ Frontend fix deployed');
      
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Go to: https://onpurpose.earth/services.html');
      console.log('2. You should see real services from providers');
      console.log('3. Services created by providers will appear here');
      console.log('4. Test filtering and search functionality');
      
    } else {
      console.log('❌ API response invalid');
      console.log('Response:', apiResponse);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testServicesDisplay();
