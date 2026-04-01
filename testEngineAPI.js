async function runEngine() {
  try {
    console.log('🚀 Testing Self-Learning Hotfix Engine API...');
    
    // Test local development endpoint
    console.log('\n📡 Testing local endpoint...');
    const localRes = await fetch('http://localhost:3000/api/run-engine');
    
    if (localRes.ok) {
      const localData = await localRes.json();
      console.log('✅ Local Engine Results:');
      console.log(`   Success: ${localData.success}`);
      console.log(`   Issues Detected: ${localData.issuesDetected || 0}`);
      console.log(`   Fixes Applied: ${localData.fixesApplied || 0}`);
      console.log(`   Learned Rules: ${localData.learnedRules || 0}`);
      console.log(`   System Health: ${localData.systemHealth || 'N/A'}`);
      console.log(`   Duration: ${localData.duration || 'N/A'}`);
    } else {
      console.log('❌ Local endpoint failed:', localRes.status);
      console.log('   Make sure local server is running: npm start');
    }
    
    // Test production endpoint
    console.log('\n🌐 Testing production endpoint...');
    try {
      const prodRes = await fetch('https://onpurpose-backend-clean-production.up.railway.app/api/run-engine');
      
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        console.log('✅ Production Engine Results:');
        console.log(`   Success: ${prodData.success}`);
        console.log(`   Issues Detected: ${prodData.issuesDetected || 0}`);
        console.log(`   Fixes Applied: ${prodData.fixesApplied || 0}`);
        console.log(`   Learned Rules: ${prodData.learnedRules || 0}`);
        console.log(`   System Health: ${prodData.systemHealth || 'N/A'}`);
        console.log(`   Duration: ${prodData.duration || 'N/A'}`);
      } else {
        console.log('❌ Production endpoint not available');
        console.log('   Status:', prodRes.status);
        console.log('   The engine endpoint needs to be deployed to production');
      }
    } catch (prodError) {
      console.log('❌ Production endpoint error:', prodError.message);
      console.log('   This is expected - the endpoint needs deployment');
    }
    
    // Test engine functionality directly
    console.log('\n🧠 Testing engine directly...');
    const SelfLearningHotfixEngine = require('./self-learning-hotfix-engine');
    const engine = new SelfLearningHotfixEngine();
    
    console.log('🔍 Running engine locally...');
    const directResult = await engine.executeFullCycle();
    
    console.log('✅ Direct Engine Results:');
    console.log(`   Success: ${directResult.success}`);
    console.log(`   Issues Detected: ${directResult.issuesDetected}`);
    console.log(`   Fixes Applied: ${directResult.fixesApplied}`);
    console.log(`   Learned Rules: ${directResult.learnedRules}`);
    console.log(`   System Health: ${directResult.systemHealth}`);
    console.log(`   Duration: ${directResult.duration}`);
    
    console.log('\n🎯 Summary:');
    console.log('   • Local API: Available when server running');
    console.log('   • Production API: Needs deployment');
    console.log('   • Direct Engine: Always available');
    console.log('   • Recommendation: Deploy to production for API access');
    
  } catch (error) {
    console.error('❌ Engine test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure local server is running: npm start');
    console.log('   2. Check if self-learning-hotfix-engine.js exists');
    console.log('   3. Verify all dependencies are installed');
  }
}

// Run the test
if (require.main === module) {
  runEngine();
}

module.exports = { runEngine };
