const SocialBot = require('./socialPostingBot');
const AIClient = require('./your-ai-client');
const AIVideoEngine = require('./aiVideoEngine');

class EnhancedSocialBot extends SocialBot {
  constructor(aiClient) {
    super(aiClient);
    this.videoEngine = new AIVideoEngine(aiClient);
  }

  // =========================
  // 🎥 GENERATE VIDEO CONTENT
  // =========================
  async generateVideoContent(product) {
    console.log('🎥 Generating video content...');
    
    // Create video
    const videoResult = await this.videoEngine.createVideo(product.name);
    
    // Generate social media post for video
    const prompt = `
    Create a viral social media post for this video:
    
    Product: ${product.name}
    Audience: ${product.audience}
    Video Script: ${videoResult.script}
    
    Include:
    - Hook for video
    - Caption
    - Hashtags
    - Call to action
    `;

    const content = await this.ai.generate(prompt);

    return {
      id: `video_post_${Date.now()}`,
      content: content,
      videoPath: videoResult.video,
      script: videoResult.script,
      productId: product.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  }

  // =========================
  // 🤖 ENHANCED INSTAGRAM POST (WITH VIDEO)
  // =========================
  async postToInstagram(post) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
      await page.goto('https://www.instagram.com/accounts/login/');

      // LOGIN
      await page.fill('input[name="username"]', process.env.IG_USER);
      await page.fill('input[name="password"]', process.env.IG_PASS);
      await page.click('button[type="submit"]');

      await page.waitForTimeout(5000);

      // Navigate to create post
      await page.goto('https://www.instagram.com/create/style/');

      // Upload video file
      await page.setInputFiles('input[type="file"]', post.videoPath);

      // Wait for upload to process
      await page.waitForTimeout(10000);

      // Add caption
      await page.fill('textarea', post.content);

      // Post
      await page.click('button:has-text("Share")');

      await page.waitForTimeout(5000);

      return { success: true };

    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      await browser.close();
    }
  }

  // =========================
  // 🎵 ENHANCED TIKTOK POST (WITH VIDEO)
  // =========================
  async postToTikTok(post) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
      await page.goto('https://www.tiktok.com/login');

      // Login
      await page.fill('input[name="username"]', process.env.TT_USER);
      await page.fill('input[name="password"]', process.env.TT_PASS);
      await page.click('button[type="submit"]');

      await page.waitForTimeout(8000);

      await page.goto('https://www.tiktok.com/upload');

      // Upload video file
      await page.setInputFiles('input[type="file"]', post.videoPath);

      // Wait for upload to process
      await page.waitForTimeout(15000);

      // Add caption
      await page.fill('textarea', post.content);

      // Post
      await page.click('button:has-text("Post")');

      await page.waitForTimeout(5000);

      return { success: true };

    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      await browser.close();
    }
  }

  // =========================
  // 🔄 ENHANCED PROCESS QUEUE (WITH VIDEO SUPPORT)
  // =========================
  async processQueue() {
    const now = Date.now();

    for (let post of this.queue) {
      if (post.status !== 'pending') continue;

      if (new Date(post.scheduleTime).getTime() > now) continue;

      let result;

      if (post.platform === 'instagram') {
        result = await this.postToInstagram(post);
      } else if (post.platform === 'tiktok') {
        result = await this.postToTikTok(post);
      }

      if (result.success) {
        post.status = 'posted';
        console.log(`✅ Successfully posted ${post.platform} video: ${post.id}`);
      } else {
        post.retries++;
        post.status = post.retries > 3 ? 'failed' : 'pending';
        console.log(`❌ Failed to post ${post.platform} video: ${post.id} - ${result.error}`);
      }

      this.logs.push({
        postId: post.id,
        platform: post.platform,
        success: result.success,
        error: result.error || null,
        timestamp: new Date().toISOString(),
        hasVideo: !!post.videoPath
      });
    }

    this.save(this.queueFile, this.queue);
    this.save(this.logFile, this.logs);
  }

  // =========================
  // 🎬 FULL VIDEO MARKETING CYCLE
  // =========================
  async runVideoMarketingCycle(product) {
    console.log('🎬 Running Video Marketing Cycle...');

    // Step 1: Generate video content
    const videoPost = await this.generateVideoContent(product);
    console.log(`✅ Video content generated: ${videoPost.id}`);

    // Step 2: Schedule video posts
    const now = new Date();
    const instagramTime = new Date(now.getTime() + 60000); // 1 minute
    const tiktokTime = new Date(now.getTime() + 120000); // 2 minutes

    this.enqueue(videoPost, 'instagram', instagramTime);
    this.enqueue(videoPost, 'tiktok', tiktokTime);

    console.log(`📸 Instagram video scheduled: ${instagramTime.toLocaleTimeString()}`);
    console.log(`🎵 TikTok video scheduled: ${tiktokTime.toLocaleTimeString()}`);

    return {
      videoPost,
      schedule: {
        instagram: instagramTime,
        tiktok: tiktokTime
      }
    };
  }
}

module.exports = EnhancedSocialBot;
