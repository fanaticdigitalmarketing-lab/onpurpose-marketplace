const ViralVideoEngine = require('./viralVideoEngine');
const AIClient = require('./your-ai-client');

const ai = new AIClient(process.env.OPENAI_KEY);
const viralEngine = new ViralVideoEngine(ai);

// Demo function
async function runViralVideoDemo() {
  try {
    console.log('🔥 Starting Viral Video Engine Demo...');
    
    const topic = 'How to make money with AI';
    
    console.log(`\n🧠 Creating viral video for: "${topic}"`);
    
    // Check for required environment variables
    if (!process.env.ELEVENLABS_KEY) {
      console.log('⚠️  ELEVENLABS_KEY not found - using mock voice');
    }
    
    if (!process.env.PEXELS_KEY) {
      console.log('⚠️  PEXELS_KEY not found - using mock video');
    }
    
    if (!process.env.VOICE_ID) {
      console.log('⚠️  VOICE_ID not found - using default voice');
    }
    
    // Create viral video
    console.log('\n🎬 Starting viral video pipeline...');
    const viralVideo = await viralEngine.createViralVideo(topic);
    
    console.log('\n✅ Viral video creation complete!');
    console.log('\n📊 Results:');
    console.log(`🆔 Video ID: ${viralVideo.id}`);
    console.log(`🎬 Script: ${viralVideo.script.length} characters`);
    console.log(`🎥 Final Video: ${viralVideo.videoPath}`);
    
    // Check if final video exists
    const fs = require('fs');
    if (fs.existsSync(viralVideo.videoPath)) {
      const videoStats = fs.statSync(viralVideo.videoPath);
      console.log(`📁 Video file: ${viralVideo.videoPath} (${videoStats.size} bytes)`);
    }
    
    console.log('\n🔥 Viral Video Pipeline:');
    console.log('1. 🧠 Generate hook-optimized script');
    console.log('2. 🎙️ Create realistic voice (ElevenLabs)');
    console.log('3. 🎥 Fetch real stock footage (Pexels)');
    console.log('4. ✂️ Sync audio to video');
    console.log('5. 📝 Add viral captions (BIG + CENTER)');
    console.log('6. ✅ Final viral video ready');
    
    console.log('\n🎬 Script Preview:');
    console.log(viralVideo.script.substring(0, 200) + '...');
    
    console.log('\n🚀 Ready for viral social media posting!');
    console.log('📱 Use with Enhanced Social Bot for automated posting');
    
    // Show environment setup
    console.log('\n🔧 Environment Setup:');
    console.log('📥 Install required APIs:');
    console.log('   - ElevenLabs: https://elevenlabs.io/');
    console.log('   - Pexels: https://www.pexels.com/api/');
    console.log('   - FFmpeg: https://ffmpeg.org/download.html');
    
    console.log('\n📝 Environment Variables:');
    console.log('   ELEVENLABS_KEY=your_elevenlabs_api_key');
    console.log('   PEXELS_KEY=your_pexels_api_key');
    console.log('   VOICE_ID=your_elevenlabs_voice_id');
    
  } catch (error) {
    console.error('❌ Viral Video Engine Demo failed:', error.message);
    
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

// Run the demo
runViralVideoDemo();
