const SocialBot = require('./socialPostingBot');
const AIClient = require('./your-ai-client');
const SocialBotSafetyRules = require('./socialBotSafetyRules');

const ai = new AIClient(process.env.OPENAI_KEY);
const bot = new SocialBot(ai);

// Apply safety measures
const safety = new SocialBotSafetyRules();
const safeBot = safety.applySafetyMeasures(bot);

const product = {
  id: '1',
  name: 'AI Startup Engine',
  audience: 'entrepreneurs'
};

// Safe execution function
async function runSafeSocialBot() {
  try {
    console.log('🛡️ Starting SAFE Social Bot Execution...');
    
    // Get safety report
    const safetyReport = safety.getSafetyReport(safeBot.accountStats);
    console.log('\n📊 Safety Report:');
    console.log(`📅 Date: ${safetyReport.date}`);
    console.log(`📈 Posts Today: ${safetyReport.postsToday}`);
    console.log(`⚠️ Warnings: ${safetyReport.warnings.length || 'None'}`);
    
    if (safetyReport.warnings.length > 0) {
      console.log('\n⚠️ Safety Warnings:');
      safetyReport.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    // Generate content with safety validation
    console.log('\n🧠 Generating safe viral content...');
    const post = await safeBot.generateContent(product);
    
    // Validate content
    const contentValidation = safety.validateContent(post.content, 'instagram');
    if (!contentValidation.safe) {
      console.error('❌ Content validation failed:', contentValidation.issues);
      return;
    }
    
    console.log(`✅ Safe content generated: ${post.id}`);
    console.log(`📝 Content preview: ${post.content.substring(0, 100)}...`);
    
    // Get safe posting times
    console.log('\n📅 Calculating safe posting times...');
    const instagramSafeTime = safety.getNextSafeTime('instagram', safeBot.accountStats);
    const tiktokSafeTime = safety.getNextSafeTime('tiktok', safeBot.accountStats);
    
    console.log(`📸 Instagram safe time: ${instagramSafeTime.toLocaleString()}`);
    console.log(`🎵 TikTok safe time: ${tiktokSafeTime.toLocaleString()}`);
    
    // Schedule posts at safe times
    console.log('\n📅 Scheduling posts at safe times...');
    safeBot.enqueue(post, 'instagram', instagramSafeTime);
    safeBot.enqueue(post, 'tiktok', tiktokSafeTime);
    
    // Show queue with safety info
    console.log('\n📊 Safe Queue Status:');
    safeBot.queue.forEach((item, index) => {
      const safetyCheck = safety.isSafeToPost(item.platform, safeBot.accountStats);
      console.log(`${index + 1}. ${item.platform.toUpperCase()} - ${item.status} - ${new Date(item.scheduleTime).toLocaleTimeString()} - ${safetyCheck.safe ? '✅' : '❌'}`);
    });
    
    // Start safe worker
    console.log('\n🔁 Starting SAFE social bot worker...');
    console.log('🛡️ Safety features enabled:');
    console.log('   ✅ Daily posting limits enforced');
    console.log('   ✅ Minimum delays between posts');
    console.log('   ✅ Content validation');
    console.log('   ✅ Duplicate content detection');
    console.log('   ✅ Real browser mode (not headless)');
    console.log('   ✅ Random delays and user agents');
    console.log('\n⚠️  Bot will process queue safely every 60 seconds');
    console.log('🛑 Press Ctrl+C to stop');
    
    safeBot.startWorker();
    
    // Keep the process running with safety monitoring
    console.log('\n✅ SAFE Social Bot is now running...');
    console.log('🛡️ All posting activities are safety-compliant');
    console.log('📊 Monitor safety reports in real-time');
    
    // Periodic safety reports
    setInterval(() => {
      const report = safety.getSafetyReport(safeBot.accountStats);
      console.log(`\n🛡️ Safety Update - Posts Today: ${report.postsToday} | Warnings: ${report.warnings.length || 0}`);
    }, 300000); // Every 5 minutes
    
  } catch (error) {
    console.error('❌ Safe social bot execution failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down SAFE social bot...');
  console.log('🛡️ All safety measures preserved');
  process.exit(0);
});

// Run the safe bot
runSafeSocialBot();
