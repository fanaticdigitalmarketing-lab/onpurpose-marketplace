const UltimateViralEngine = require('./ultimateViralEngine');
const AIClient = require('./your-ai-client');

const ai = new AIClient(process.env.OPENAI_KEY);
const ultimateEngine = new UltimateViralEngine(ai);

// Demo function
async function runUltimateViralDemo() {
  try {
    console.log('🔥🔥🔥 Starting ULTIMATE Viral Engine Demo...');
    
    // Check for required environment variables
    console.log('\n🔧 Checking API keys...');
    const requiredKeys = ['ELEVENLABS_KEY', 'PEXELS_KEY', 'VOICE_ID'];
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    
    if (missingKeys.length > 0) {
      console.log('⚠️  Missing API keys:');
      missingKeys.forEach(key => console.log(`   - ${key}`));
      console.log('\n📝 Set environment variables for full functionality');
    } else {
      console.log('✅ All API keys found');
    }
    
    // Create ultimate viral video
    console.log('\n🔥 Creating ULTIMATE viral video...');
    console.log('🚀 This includes: Trend scraping + Multi-clips + Fast cuts + Word-by-word captions');
    
    const ultimateVideo = await ultimateEngine.createUltimateVideo();
    
    console.log('\n✅ ULTIMATE viral video creation complete!');
    console.log('\n📊 Results:');
    console.log(`🆔 Video ID: ${ultimateVideo.id}`);
    console.log(`🔥 Trend Topic: ${ultimateVideo.topic}`);
    console.log(`🎬 Scenes: ${ultimateVideo.scenes.length}`);
    console.log(`🎥 Final Video: ${ultimateVideo.videoPath}`);
    
    // Show scenes
    console.log('\n🎬 Video Scenes:');
    ultimateVideo.scenes.forEach((scene, index) => {
      console.log(`${index + 1}. ${scene}`);
    });
    
    // Check if final video exists
    const fs = require('fs');
    if (fs.existsSync(ultimateVideo.videoPath)) {
      const videoStats = fs.statSync(ultimateVideo.videoPath);
      console.log(`\n📁 Ultimate video: ${ultimateVideo.videoPath} (${videoStats.size} bytes)`);
    }
    
    console.log('\n🔥 ULTIMATE Viral Pipeline:');
    console.log('1. 🔥 Trend scraping from viral topics');
    console.log('2. 🧠 Scene-based script generation');
    console.log('3. 🎙️ Professional voice synthesis');
    console.log('4. 🎥 Multiple stock footage clips');
    console.log('5. ✂️ Fast-cut video editing');
    console.log('6. 📝 Word-by-word animated captions');
    console.log('7. 🔗 Final audio/video synchronization');
    console.log('8. ✅ Ultimate viral video ready');
    
    console.log('\n🚀 Production Features:');
    console.log('📈 Trend-driven content selection');
    console.log('⚡ Fast-paced scene cuts');
    console.log('🗣️ Professional voice quality');
    console.log('🎬 Multiple video clips per scene');
    console.log('📝 Animated word-by-word captions');
    console.log('🔥 Maximum viral optimization');
    
    console.log('\n🎯 Ready for social media domination!');
    console.log('📱 Perfect for TikTok, Instagram Reels, YouTube Shorts');
    
    // Show technical details
    console.log('\n🔧 Technical Stack:');
    console.log('🤖 AI: Scene-based script generation');
    console.log('🎙️ Voice: ElevenLabs API');
    console.log('🎥 Video: Pexels stock footage');
    console.log('✂️ Editing: FFmpeg fast cuts');
    console.log('📝 Captions: Word-by-word animation');
    console.log('🔗 Sync: Professional audio/video merge');
    
    console.log('\n💡 Usage Tips:');
    console.log('📈 Trending topics increase virality');
    console.log('⚡ Fast cuts keep attention');
    console.log('🗣️ Quality voice builds trust');
    console.log('📝 Captions improve accessibility');
    console.log('🎬 Multiple clips prevent boredom');
    
  } catch (error) {
    console.error('❌ Ultimate Viral Engine Demo failed:', error.message);
    
    if (error.message.includes('JSON')) {
      console.log('\n💡 AI response parsing failed - check AI client');
    }
    
    if (error.message.includes('ELEVENLABS')) {
      console.log('\n💡 Set ELEVENLABS_KEY environment variable');
    }
    
    if (error.message.includes('PEXELS')) {
      console.log('\n💡 Set PEXELS_KEY environment variable');
    }
    
    if (error.message.includes('ffmpeg')) {
      console.log('\n💡 Install FFmpeg: https://ffmpeg.org/download.html');
    }
  }
}

// Run the ultimate demo
runUltimateViralDemo();
