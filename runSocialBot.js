const SocialBot = require('./socialPostingBot');
const AIClient = require('./your-ai-client');

const ai = new AIClient(process.env.OPENAI_KEY);
const bot = new SocialBot(ai);

const product = {
  id: '1',
  name: 'AI Startup Engine',
  audience: 'entrepreneurs'
};

// Main execution function
async function runSocialBot() {
  try {
    console.log('🤖 Starting Social Bot Execution...');
    
    // Generate content
    console.log('\n🧠 Generating viral content...');
    const post = await bot.generateContent(product);
    console.log(`✅ Content generated: ${post.id}`);
    console.log(`📝 Content preview: ${post.content.substring(0, 100)}...`);
    
    // Schedule posts
    console.log('\n📅 Scheduling posts...');
    const instagramTime = new Date(Date.now() + 60000); // 1 minute from now
    const tiktokTime = new Date(Date.now() + 120000); // 2 minutes from now
    
    bot.enqueue(post, 'instagram', instagramTime);
    bot.enqueue(post, 'tiktok', tiktokTime);
    
    console.log(`📸 Instagram scheduled for: ${instagramTime.toLocaleTimeString()}`);
    console.log(`🎵 TikTok scheduled for: ${tiktokTime.toLocaleTimeString()}`);
    
    // Show queue status
    console.log('\n📊 Queue Status:');
    bot.queue.forEach((item, index) => {
      console.log(`${index + 1}. ${item.platform.toUpperCase()} - ${item.status} - ${new Date(item.scheduleTime).toLocaleTimeString()}`);
    });
    
    // Start worker
    console.log('\n🔁 Starting social bot worker...');
    console.log('⚠️  Bot will process queue every 60 seconds');
    console.log('🛑 Press Ctrl+C to stop');
    
    bot.startWorker();
    
    // Keep the process running
    console.log('\n✅ Social bot is now running...');
    console.log('📊 Monitor queue and logs in /data/ directory');
    
  } catch (error) {
    console.error('❌ Social bot execution failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down social bot...');
  process.exit(0);
});

// Run the bot
runSocialBot();
