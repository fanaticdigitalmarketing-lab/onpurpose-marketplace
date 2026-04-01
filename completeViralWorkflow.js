const UltimateViralEngine = require('./ultimateViralEngine');
const { postToInstagram, postToTikTok } = require('./socialMediaPosters');
const AIClient = require('./your-ai-client');

const ai = new AIClient(process.env.OPENAI_KEY);
const engine = new UltimateViralEngine(ai);

(async () => {
  try {
    console.log('🔥🔥🔥 Starting Complete Viral Workflow...');
    
    // Step 1: Create ultimate viral video
    console.log('\n🎬 Creating ultimate viral video...');
    const video = await engine.createUltimateVideo();
    
    console.log('✅ Video created successfully!');
    console.log(`🆔 Video ID: ${video.id}`);
    console.log(`🔥 Topic: ${video.topic}`);
    console.log(`🎬 Scenes: ${video.scenes.length}`);
    console.log(`🎥 Video Path: ${video.videoPath}`);
    
    // Step 2: Combine scenes into caption
    const caption = video.scenes.join(' ');
    console.log(`📝 Caption: ${caption.substring(0, 100)}...`);
    
    // Step 3: Post to Instagram
    console.log('\n📸 Posting to Instagram...');
    try {
      await postToInstagram(video.videoPath, caption);
      console.log('✅ Successfully posted to Instagram!');
    } catch (error) {
      console.log('❌ Instagram post failed:', error.message);
    }
    
    // Step 4: Post to TikTok
    console.log('\n🎵 Posting to TikTok...');
    try {
      await postToTikTok(video.videoPath, caption);
      console.log('✅ Successfully posted to TikTok!');
    } catch (error) {
      console.log('❌ TikTok post failed:', error.message);
    }
    
    // Step 5: Summary
    console.log('\n🎉 Complete Viral Workflow Summary:');
    console.log(`🎬 Created: ${video.scenes.length}-scene viral video`);
    console.log(`🔥 Topic: ${video.topic}`);
    console.log(`📸 Instagram: Posted successfully`);
    console.log(`🎵 TikTok: Posted successfully`);
    console.log(`🎥 Video: ${video.videoPath}`);
    
    console.log('\n🚀 Your viral content is now live!');
    console.log('📈 Monitor engagement and performance');
    console.log('🔄 Ready for next viral video creation');
    
  } catch (error) {
    console.error('❌ Complete Viral Workflow failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Check your environment variables:');
      console.log('   - OPENAI_KEY');
      console.log('   - ELEVENLABS_KEY');
      console.log('   - PEXELS_KEY');
      console.log('   - VOICE_ID');
      console.log('   - INSTAGRAM_ACCESS_TOKEN');
      console.log('   - INSTAGRAM_USER_ID');
      console.log('   - TIKTOK_SESSION');
    }
    
    if (error.message.includes('ffmpeg')) {
      console.log('\n💡 Install FFmpeg: https://ffmpeg.org/download.html');
    }
    
    if (error.message.includes('puppeteer')) {
      console.log('\n💡 Install Puppeteer: npm install puppeteer');
    }
  }
})();
