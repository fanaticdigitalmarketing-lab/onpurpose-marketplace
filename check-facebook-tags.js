// Check Facebook Open Graph tags for OnPurpose website
const https = require('https');

function checkFacebookTags() {
  https.get('https://onpurpose.earth/', (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('=== FACEBOOK DEBUG TOOL READINESS ===\n');
      
      // Check page title
      const titleMatch = body.match(/<title>(.*?)<\/title>/);
      console.log('✅ PAGE TITLE:');
      console.log(titleMatch ? titleMatch[1] : '❌ Not found');
      
      // Check Open Graph tags
      console.log('\n✅ OPEN GRAPH TAGS:');
      
      const checks = [
        ['og:title', 'og:title" content="([^"]+)"'],
        ['og:description', 'og:description" content="([^"]+)"'],
        ['og:image', 'og:image" content="([^"]+)"'],
        ['og:url', 'og:url" content="([^"]+)"'],
        ['og:type', 'og:type" content="([^"]+)"'],
        ['og:site_name', 'og:site_name" content="([^"]+)"'],
        ['og:locale', 'og:locale" content="([^"]+)"']
      ];
      
      checks.forEach(([name, pattern]) => {
        const match = body.match(new RegExp(pattern));
        const value = match ? match[1] : '❌ Not found';
        console.log(`${name}: ${value}`);
      });
      
      // Check Facebook namespace
      console.log('\n✅ FACEBOOK NAMESPACE:');
      const hasFbNamespace = body.includes('prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#"');
      console.log(hasFbNamespace ? '✅ Present' : '❌ Missing');
      
      // Check meta description
      const metaDescMatch = body.match(/<meta name="description" content="([^"]+)"/);
      console.log('\n✅ META DESCRIPTION:');
      console.log(metaDescMatch ? metaDescMatch[1].substring(0, 100) + '...' : '❌ Not found');
      
      console.log('\n🎯 FACEBOOK DEBUG TOOL STATUS:');
      const hasAllRequired = titleMatch && 
                           body.includes('og:title') && 
                           body.includes('og:description') && 
                           body.includes('og:image') && 
                           body.includes('og:url') && 
                           body.includes('og:type') &&
                           hasFbNamespace;
      
      if (hasAllRequired) {
        console.log('✅ READY - All required Open Graph tags are present');
        console.log('🌐 Facebook Debug Tool should work correctly');
        console.log('🔗 Test at: https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fonpurpose.earth');
      } else {
        console.log('❌ NOT READY - Some required tags are missing');
      }
      
      console.log('\n📱 SOCIAL SHARING PREVIEW:');
      console.log('Title: ' + (titleMatch ? titleMatch[1] : 'N/A'));
      const descMatch = body.match(/og:description" content="([^"]+)"/);
      console.log('Description: ' + (descMatch ? descMatch[1].substring(0, 100) + '...' : 'N/A'));
      const imageMatch = body.match(/og:image" content="([^"]+)"/);
      console.log('Image: ' + (imageMatch ? imageMatch[1] : 'N/A'));
    });
  }).on('error', err => {
    console.log('❌ Error fetching website:', err.message);
  });
}

checkFacebookTags();
