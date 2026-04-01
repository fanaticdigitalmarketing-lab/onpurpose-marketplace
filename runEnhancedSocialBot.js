const EnhancedSocialBot = require('./enhancedSocialBot');
const AIClient = require('./your-ai-client');

const ai = new AIClient(process.env.OPENAI_KEY);
const bot = new EnhancedSocialBot(ai);

const product = {
  id: '1',
  name: 'AI Startup Engine',
  audience: 'entrepreneurs'
};

// Enhanced demo function
async function runEnhancedSocialBot() {
  try {
    console.log('🎬 Starting Enhanced Social Bot with Video Support...');
    
    // Step 1: Generate video content
    console.log('\n🎥 Generating video marketing content...');
    const results = await bot.runVideoMarketingCycle(product);
    
    console.log('\n✅ Video Marketing Cycle Complete!');
    console.log('\n📊 Results:');
    console.log(`🆔 Video Post ID: ${results.videoPost.id}`);
    console.log(`🎬 Script: ${results.videoPost.script.length} characters`);
    console.log(`🎥 Video Path: ${results.videoPost.videoPath}`);
    console.log(`📝 Content: ${results.videoPost.content.substring(0, 100)}...`);
    
    console.log('\n📅 Schedule:');
    console.log(`📸 Instagram: ${results.schedule.instagram.toLocaleTimeString()}`);
    console.log(`🎵 TikTok: ${results.schedule.tiktok.toLocaleTimeString()}`);
    
    // Show queue status
    console.log('\n📊 Enhanced Queue Status:');
    bot.queue.forEach((item, index) => {
      const hasVideo = item.videoPath ? '🎥' : '📝';
      console.log(`${index + 1}. ${item.platform.toUpperCase()} - ${item.status} - ${hasVideo} - ${new Date(item.scheduleTime).toLocaleTimeString()}`);
    });
    
    // Check if video file exists
    const fs = require('fs');
    if (fs.existsSync(results.videoPost.videoPath)) {
      const videoStats = fs.statSync(results.videoPost.videoPath);
      console.log(`\n🎥 Video file created: ${results.videoPost.videoPath} (${videoStats.size} bytes)`);
    }
    
    // Start enhanced worker
    console.log('\n🔁 Starting Enhanced Social Bot Worker...');
    console.log('🎬 Video posting capabilities enabled');
    console.log('📱 Instagram and TikTok video support');
    console.log('⚠️  Set environment variables for actual posting');
    console.log('🛑 Press Ctrl+C to stop');
    
    bot.startWorker();
    
    console.log('\n✅ Enhanced Social Bot is now running...');
    console.log('🎥 Video content will be posted at scheduled times');
    console.log('📊 Monitor queue and logs in /data/ directory');
    
  } catch (error) {
    console.error('❌ Enhanced Social Bot failed:', error.message);
    
    if (error.message.includes('ffmpeg')) {
      console.log('\n💡 Note: FFmpeg required for video generation');
      console.log('📥 Install FFmpeg: https://ffmpeg.org/download.html');
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Enhanced Social Bot...');
  process.exit(0);
});

// Run the enhanced bot
runEnhancedSocialBot();
