const SocialPostingBot = require('./socialPostingBot');
const AIClient = require('./your-ai-client');

const ai = new AIClient(process.env.OPENAI_KEY);
const bot = new SocialPostingBot(ai);

// Example product
const product = {
  id: 'prod_1',
  name: 'AI Service Marketplace',
  audience: 'entrepreneurs',
  problem: 'finding profitable ideas'
};

// Demo function
async function runSocialBotDemo() {
  try {
    console.log('🤖 Starting Social Posting Bot Demo...');
    
    // Step 1: Generate viral content
    console.log('\n🧠 Generating viral content...');
    const content = await bot.generateContent(product);
    console.log(`✅ Content generated: ${content.id}`);
    console.log(`📝 Preview: ${content.content.substring(0, 100)}...`);
    
    // Step 2: Add to queue for both platforms
    console.log('\n📅 Adding posts to queue...');
    
    const now = new Date();
    const instagramTime = new Date(now.getTime() + 60000); // 1 minute from now
    const tiktokTime = new Date(now.getTime() + 120000); // 2 minutes from now
    
    bot.enqueue(content, 'instagram', instagramTime.toISOString());
    bot.enqueue(content, 'tiktok', tiktokTime.toISOString());
    
    console.log(`📸 Instagram post scheduled for: ${instagramTime.toLocaleTimeString()}`);
    console.log(`🎵 TikTok post scheduled for: ${tiktokTime.toLocaleTimeString()}`);
    
    // Step 3: Show queue status
    console.log('\n📊 Queue Status:');
    console.log(`📋 Total posts in queue: ${bot.queue.length}`);
    bot.queue.forEach((post, index) => {
      console.log(`${index + 1}. ${post.platform.toUpperCase()} - ${post.status} - ${new Date(post.scheduleTime).toLocaleTimeString()}`);
    });
    
    // Step 4: Process queue (demo mode - no actual posting)
    console.log('\n🔄 Processing queue (demo mode)...');
    
    // In demo mode, we'll just show what would happen
    console.log('📸 Would post to Instagram (demo mode - no actual posting)');
    console.log('🎵 Would post to TikTok (demo mode - no actual posting)');
    console.log('⚠️  Set IG_USER, IG_PASS, TT_USER, TT_PASS environment variables for actual posting');
    
    // Step 5: Show logs
    console.log('\n📋 Recent Activity:');
    if (bot.logs.length > 0) {
      bot.logs.slice(-5).forEach((log, index) => {
        console.log(`${index + 1}. ${log.platform} - ${log.success ? '✅' : '❌'} - ${log.timestamp}`);
      });
    } else {
      console.log('📝 No activity logs yet');
    }
    
    // Step 6: Start worker in demo mode
    console.log('\n🔁 Starting worker (demo mode - no actual posting)...');
    console.log('⚠️  Worker will process queue every 60 seconds');
    console.log('🛑 Press Ctrl+C to stop the demo');
    
    // Start the worker but in demo mode
    bot.startWorker(60000);
    
    // Keep the demo running
    console.log('\n✅ Social bot demo is running...');
    console.log('📊 Check the queue and logs in /data/ directory');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down social bot demo...');
  process.exit(0);
});

// Run the demo
runSocialBotDemo();
