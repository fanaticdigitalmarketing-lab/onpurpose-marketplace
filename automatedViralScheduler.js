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
    console.log(`\n🔥🔥🔥 Starting Automated Viral Pipeline - ${new Date().toLocaleString()}`);
    
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
    console.log('🎉 Automated Viral Pipeline Complete!');
    console.log(`📊 Results: ${video.scenes.length}-scene video on ${video.topic}`);
    console.log(`🎥 Video saved: ${video.videoPath}`);
    console.log(`⏰ Next run: ${new Date(Date.now() + (1000 * 60 * 60 * 6)).toLocaleString()}`);
    
    return {
      success: true,
      video: video,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Automated Viral Pipeline failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// =========================
// 🔄 SCHEDULER STARTUP
// =========================
function startScheduler() {
  console.log('🚀 Starting Automated Viral Scheduler...');
  console.log('⏰ Schedule: Every 6 hours');
  console.log('🎯 Pipeline: Create viral video → Post to Instagram → Post to TikTok');
  console.log('🛑 Press Ctrl+C to stop scheduler\n');
  
  // Run immediately on start
  runPipeline();
  
  // Then run every 6 hours
  const interval = 1000 * 60 * 60 * 6; // 6 hours in milliseconds
  
  setInterval(async () => {
    await runPipeline();
  }, interval);
}

// =========================
// 📊 SCHEDULER STATUS
// =========================
function getSchedulerStatus() {
  return {
    status: 'running',
    interval: '6 hours',
    nextRun: new Date(Date.now() + (1000 * 60 * 60 * 6)).toLocaleString(),
    pipeline: [
      '🎬 Create ultimate viral video',
      '📸 Post to Instagram',
      '🎵 Post to TikTok'
    ],
    features: [
      '🔥 Trend-driven content',
      '🎬 Multi-scene videos',
      '🎙️ Professional voice',
      '🎥 Stock footage',
      '✂️ Fast cuts',
      '📝 Animated captions',
      '📱 Multi-platform posting'
    ]
  };
}

// =========================
// 🛑 GRACEFUL SHUTDOWN
// =========================
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Automated Viral Scheduler...');
  console.log('📊 All scheduled tasks stopped');
  console.log('🔒 System safely shut down');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM - shutting down scheduler...');
  process.exit(0);
});

// =========================
// 🚀 START SCHEDULER
// =========================
if (require.main === module) {
  startScheduler();
}

module.exports = {
  runPipeline,
  startScheduler,
  getSchedulerStatus
};
