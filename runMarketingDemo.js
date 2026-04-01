const MarketingEngine = require('./autonomousMarketingEngine');
const AIClient = require('./your-ai-client');

const ai = new AIClient(process.env.OPENAI_KEY);
const marketing = new MarketingEngine(ai);

// Example product
const product = {
  id: 'prod_1',
  name: 'AI Service Marketplace',
  audience: 'entrepreneurs',
  problem: 'finding profitable ideas',
  niche: 'online business'
};

// Run the demo
async function runDemo() {
  try {
    console.log('🚀 Starting Autonomous Marketing Engine Demo...');
    
    const results = await marketing.runFullMarketingCycle(product);
    
    console.log('\n✅ Marketing Cycle Complete!');
    console.log('\n📊 Results:');
    console.log(`🔥 Ads Generated: ${results.campaign.ads.length}`);
    console.log(`🔍 SEO Content: ${results.seo.content.length} characters`);
    console.log(`📱 Social Posts: ${results.social.posts.length}`);
    console.log(`⚡ Optimization Decisions: ${results.optimization.length}`);
    
    console.log('\n📈 Sample Ads:');
    results.campaign.ads.forEach((ad, index) => {
      console.log(`${index + 1}. ${ad}`);
    });
    
    console.log('\n🔍 SEO Preview:');
    console.log(results.seo.content.substring(0, 200) + '...');
    
    console.log('\n📱 Sample Social Posts:');
    results.social.posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post}`);
    });
    
    console.log('\n⚡ Optimization Actions:');
    results.optimization.forEach(decision => {
      console.log(`${decision.action}: ${decision.ad.campaignId}_${decision.ad.adIndex}`);
    });
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

runDemo();
