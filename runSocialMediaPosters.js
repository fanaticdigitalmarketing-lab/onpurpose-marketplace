const { postToInstagram, postToTikTok } = require('./socialMediaPosters');

// Demo function
async function runSocialMediaPosters() {
  try {
    console.log('📸🎵 Starting Social Media Posters Demo...');
    
    // Check for required environment variables
    console.log('\n🔧 Checking environment variables...');
    
    const requiredVars = {
      'INSTAGRAM_ACCESS_TOKEN': process.env.INSTAGRAM_ACCESS_TOKEN,
      'INSTAGRAM_USER_ID': process.env.INSTAGRAM_USER_ID,
      'TIKTOK_SESSION': process.env.TIKTOK_SESSION
    };
    
    const missingVars = Object.entries(requiredVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingVars.length > 0) {
      console.log('⚠️  Missing environment variables:');
      missingVars.forEach(varName => console.log(`   - ${varName}`));
      console.log('\n📝 Set environment variables in .env file');
    } else {
      console.log('✅ All required environment variables found');
    }
    
    // Demo video path and caption
    const videoPath = './videos/demo-video.mp4';
    const caption = '🔥 Check out this amazing AI-powered video! #AI #Tech #Innovation';
    
    console.log('\n📸 Instagram API Posting:');
    console.log('🔹 Uses Facebook Graph API');
    console.log('🔹 Requires Instagram Business Account');
    console.log('🔹 Video URL must be publicly accessible');
    console.log('🔹 Two-step process: create container → publish');
    
    if (process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID) {
      console.log('\n📸 Posting to Instagram...');
      try {
        await postToInstagram(videoPath, caption);
        console.log('✅ Instagram post successful');
      } catch (error) {
        console.log('❌ Instagram post failed:', error.message);
      }
    } else {
      console.log('\n⚠️  Skipping Instagram - missing credentials');
    }
    
    console.log('\n🎵 TikTok Browser Automation:');
    console.log('🔹 Uses Puppeteer for browser automation');
    console.log('🔹 Requires manual login or session cookies');
    console.log('🔹 Uploads video file directly');
    console.log('🔹 Types caption and clicks post button');
    
    if (process.env.TIKTOK_SESSION) {
      console.log('\n🎵 Posting to TikTok...');
      try {
        await postToTikTok(videoPath, caption);
        console.log('✅ TikTok post successful');
      } catch (error) {
        console.log('❌ TikTok post failed:', error.message);
      }
    } else {
      console.log('\n⚠️  Skipping TikTok - missing session cookies');
      console.log('💡 You must be logged into TikTok in the browser');
    }
    
    console.log('\n🔧 Setup Instructions:');
    console.log('\n📸 Instagram Setup:');
    console.log('1. Create Facebook Developer Account');
    console.log('2. Create Instagram Business Account');
    console.log('3. Get Instagram User ID');
    console.log('4. Generate Access Token');
    console.log('5. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID');
    
    console.log('\n🎵 TikTok Setup:');
    console.log('1. Install Puppeteer: npm install puppeteer');
    console.log('2. Login to TikTok in browser');
    console.log('3. Export session cookies');
    console.log('4. Set TIKTOK_SESSION environment variable');
    
    console.log('\n📊 API Usage:');
    console.log('📸 Instagram: REST API calls');
    console.log('🎵 TikTok: Browser automation');
    console.log('🎥 Video: Must be accessible via URL for Instagram');
    console.log('📝 Caption: Supports hashtags and emojis');
    
    console.log('\n🚀 Integration Ready:');
    console.log('🤖 Use with Ultimate Viral Engine');
    console.log('📱 Post generated videos automatically');
    console.log('⏰ Schedule posts with Social Bot');
    console.log('📈 Track engagement and performance');
    
  } catch (error) {
    console.error('❌ Social Media Posters Demo failed:', error.message);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Social Media Posters Demo...');
  process.exit(0);
});

// Run the demo
runSocialMediaPosters();
