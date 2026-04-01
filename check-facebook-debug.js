// Check Facebook Debug Tool status for OnPurpose
const https = require('https');
const cheerio = require('cheerio');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => req.destroy());
  });
}

async function checkFacebookDebug() {
  console.log('🔍 Checking Facebook Debug Tool status for OnPurpose...\n');
  
  try {
    // Check the website directly first
    console.log('📱 Checking website OG tags...');
    const siteResponse = await fetchUrl('https://onpurpose.earth');
    
    if (siteResponse.status === 200) {
      const $ = cheerio.load(siteResponse.data);
      
      // Extract OG tags
      const ogTags = {};
      $('meta[property^="og:"]').each((i, el) => {
        const property = $(el).attr('property');
        const content = $(el).attr('content');
        ogTags[property] = content;
      });
      
      console.log('✅ Website Status: OK');
      console.log('\n📋 Current OG Tags:');
      Object.entries(ogTags).forEach(([property, content]) => {
        console.log(`   ${property}: ${content}`);
      });
      
      // Check specific critical tags
      console.log('\n🎯 Critical Tags Analysis:');
      
      if (ogTags['og:title']) {
        console.log('✅ og:title: Present');
        console.log(`   Content: "${ogTags['og:title']}"`);
      } else {
        console.log('❌ og.title: Missing');
      }
      
      if (ogTags['og:description']) {
        console.log('✅ og:description: Present');
        console.log(`   Content: "${ogTags['og:description'].substring(0, 100)}..."`);
      } else {
        console.log('❌ og:description: Missing');
      }
      
      if (ogTags['og:image']) {
        console.log('✅ og:image: Present');
        console.log(`   URL: ${ogTags['og:image']}`);
        
        // Check if image URL is accessible
        try {
          const imageResponse = await fetchUrl(ogTags['og:image']);
          if (imageResponse.status === 200) {
            console.log('✅ Image URL: Accessible');
          } else {
            console.log(`❌ Image URL: Not accessible (${imageResponse.status})`);
          }
        } catch (imgErr) {
          console.log('❌ Image URL: Failed to fetch');
        }
      } else {
        console.log('❌ og:image: Missing');
      }
      
      if (ogTags['og:url']) {
        console.log('✅ og:url: Present');
        console.log(`   URL: ${ogTags['og:url']}`);
      } else {
        console.log('❌ og:url: Missing');
      }
      
      console.log('\n🌐 Expected Facebook Debug Tool Results:');
      console.log('   • Status: 200 OK');
      console.log('   • Image: Should display without corruption errors');
      console.log('   • Title: "OnPurpose — Idea → Service → Income"');
      console.log('   • Description: Full brand message visible');
      console.log('   • No warnings about corrupted images');
      
    } else {
      console.log(`❌ Website Error: ${siteResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking Facebook Debug status:', error.message);
  }
  
  console.log('\n🔗 Manual Check Required:');
  console.log('   Visit: https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fonpurpose.earth');
  console.log('   Click "Debug" button');
  console.log('   Verify no "Corrupted Image" or "Image Unavailable" warnings');
}

checkFacebookDebug();
