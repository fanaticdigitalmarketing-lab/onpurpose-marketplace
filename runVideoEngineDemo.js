const AIVideoEngine = require('./aiVideoEngine');
const AIClient = require('./your-ai-client');

const ai = new AIClient(process.env.OPENAI_KEY);
const videoEngine = new AIVideoEngine(ai);

// Demo function
async function runVideoEngineDemo() {
  try {
    console.log('🎥 Starting AI Video Engine Demo...');
    
    const topic = 'AI Startup Engine for Entrepreneurs';
    
    console.log(`\n🧠 Generating viral script for: "${topic}"`);
    
    // Step 1: Generate script
    const script = await videoEngine.generateScript(topic);
    console.log('✅ Script generated successfully');
    console.log(`📝 Script preview: ${script.substring(0, 150)}...`);
    
    // Step 2: Create full video pipeline
    console.log('\n🎬 Creating video pipeline...');
    const videoResult = await videoEngine.createVideo(topic);
    
    console.log('\n✅ Video creation complete!');
    console.log('\n📊 Results:');
    console.log(`🆔 Video ID: ${videoResult.id}`);
    console.log(`🎬 Script: ${videoResult.script.length} characters`);
    console.log(`🔊 Audio: ${videoResult.audio}`);
    console.log(`🎥 Final Video: ${videoResult.video}`);
    
    // Check if files were created
    const fs = require('fs');
    console.log('\n📁 Generated Files:');
    
    if (fs.existsSync(videoResult.audio)) {
      const audioStats = fs.statSync(videoResult.audio);
      console.log(`🔊 Audio file: ${videoResult.audio} (${audioStats.size} bytes)`);
    }
    
    if (fs.existsSync(videoResult.video)) {
      const videoStats = fs.statSync(videoResult.video);
      console.log(`🎥 Video file: ${videoResult.video} (${videoStats.size} bytes)`);
    }
    
    console.log('\n🎬 Video Engine Pipeline:');
    console.log('1. 🧠 Generate viral script (AI-powered)');
    console.log('2. 🔊 Convert script to speech (TTS)');
    console.log('3. 🎥 Generate video clip (FFmpeg)');
    console.log('4. 📝 Add captions to video');
    console.log('5. ✅ Final captioned video ready');
    
    console.log('\n🚀 Ready for social media posting!');
    console.log('📱 Use with Social Bot for automated posting');
    
  } catch (error) {
    console.error('❌ Video Engine Demo failed:', error.message);
    
    if (error.message.includes('ffmpeg')) {
      console.log('\n💡 Note: FFmpeg required for video generation');
      console.log('📥 Install FFmpeg: https://ffmpeg.org/download.html');
    }
  }
}

// Run the demo
runVideoEngineDemo();
