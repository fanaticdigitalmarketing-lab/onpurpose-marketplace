const cron = require('node-cron');
const UltimateViralEngine = require('./ultimateViralEngine');
const { postToInstagram, postToTikTok } = require('./socialMediaPosters');
const AIClient = require('./your-ai-client');

const ai = new AIClient(process.env.OPENAI_KEY);
const engine = new UltimateViralEngine(ai);

// =========================
// 🚀 RUN COMPLETE PIPELINE
// =========================
async function runPipeline() {
  try {
    console.log(`\n🔥🔥🔥 CRON Viral Pipeline - ${new Date().toLocaleString()}`);
    
    // Step 1: Create ultimate viral video
    console.log('🎬 Creating ultimate viral video...');
    const video = await engine.createUltimateVideo();
    
    console.log('✅ Video created successfully!');
    console.log(`🆔 Video ID: ${video.id}`);
    console.log(`🔥 Topic: ${video.topic}`);
    console.log(`🎬 Scenes: ${video.scenes.length}`);
    
    // Step 2: Combine scenes into caption
    const caption = video.scenes.join(' ');
    console.log(`📝 Caption: ${caption.substring(0, 100)}...`);
    
    // Step 3: Post to Instagram
    console.log('📸 Posting to Instagram...');
    try {
      await postToInstagram(video.videoPath, caption);
      console.log('✅ Successfully posted to Instagram!');
    } catch (error) {
      console.log('❌ Instagram post failed:', error.message);
    }
    
    // Step 4: Post to TikTok
    console.log('🎵 Posting to TikTok...');
    try {
      await postToTikTok(video.videoPath, caption);
      console.log('✅ Successfully posted to TikTok!');
    } catch (error) {
      console.log('❌ TikTok post failed:', error.message);
    }
    
    // Step 5: Log completion
    console.log('🎉 CRON Viral Pipeline Complete!');
    console.log(`📊 Results: ${video.scenes.length}-scene video on ${video.topic}`);
    console.log(`🎥 Video saved: ${video.videoPath}`);
    
    return {
      success: true,
      video: video,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ CRON Viral Pipeline failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// =========================
// ⏰ CRON SCHEDULER SETUP
// =========================
function setupCronScheduler() {
  console.log('⏰ Setting up CRON Viral Scheduler...');
  console.log('📅 Schedule: "0 */6 * * *" (Every 6 hours at minute 0)');
  console.log('🎯 Pipeline: Create viral video → Post to Instagram → Post to TikTok');
  console.log('🛑 Press Ctrl+C to stop scheduler\n');
  
  // Schedule to run every 6 hours at minute 0
  // Cron format: minute hour day month day_of_week
  // "0 */6 * * *" = At minute 0, every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    await runPipeline();
  });
  
  console.log('✅ CRON scheduler active!');
  console.log('📅 Next runs will be at: 12:00 AM, 6:00 AM, 12:00 PM, 6:00 PM (daily)');
  console.log('🔄 Scheduler will continue running indefinitely');
  
  // Run immediately on start for testing
  console.log('\n🚀 Running initial pipeline for testing...');
  runPipeline();
}

// =========================
// 📊 CRON STATUS
// =========================
function getCronStatus() {
  const now = new Date();
  const nextRuns = [];
  
  // Calculate next few run times
  for (let i = 0; i < 4; i++) {
    const nextRun = new Date(now);
    const hoursUntilNext = 6 - (now.getHours() % 6);
    nextRun.setHours(now.getHours() + hoursUntilNext);
    nextRun.setMinutes(0);
    nextRun.setSeconds(0);
    nextRuns.push(nextRun.toLocaleString());
  }
  
  return {
    schedule: '0 */6 * * *',
    description: 'Every 6 hours at minute 0',
    nextRuns: nextRuns,
    pipeline: [
      '🎬 Create ultimate viral video',
      '📸 Post to Instagram', 
      '🎵 Post to TikTok'
    ],
    features: [
      '⏰ Precise timing with cron',
      '🔄 Automatic execution',
      '📊 Detailed logging',
      '🛡️ Error handling',
      '🎯 Trend-driven content',
      '📱 Multi-platform posting'
    ]
  };
}

// =========================
// 🛑 GRACEFUL SHUTDOWN
// =========================
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down CRON Viral Scheduler...');
  console.log('📊 All scheduled tasks stopped');
  console.log('🔒 System safely shut down');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM - shutting down scheduler...');
  process.exit(0);
});

// =========================
// 🚀 START CRON SCHEDULER
// =========================
if (require.main === module) {
  setupCronScheduler();
}

module.exports = {
  runPipeline,
  setupCronScheduler,
  getCronStatus
};
