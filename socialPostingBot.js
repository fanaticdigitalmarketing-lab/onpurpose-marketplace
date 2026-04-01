const fs = require('fs');
const { chromium } = require('playwright');

class SocialPostingBot {
  constructor(aiClient) {
    this.ai = aiClient;

    this.queueFile = './data/post-queue.json';
    this.logFile = './data/post-log.json';

    this.queue = this.load(this.queueFile);
    this.logs = this.load(this.logFile);
  }

  load(file) {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file));
  }

  save(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }

  // =========================
  // 🧠 GENERATE VIRAL CONTENT
  // =========================
  async generateContent(product) {
    const prompt = `
    Create a viral TikTok/Instagram post:

    Product: ${product.name}
    Audience: ${product.audience}

    Include:
    - Hook (first 3 seconds)
    - Caption
    - Hashtags
    `;

    const response = await this.ai.generate(prompt);

    return {
      id: `post_${Date.now()}`,
      content: response,
      productId: product.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  }

  // =========================
  // 📅 ADD TO QUEUE
  // =========================
  enqueue(post, platform, scheduleTime) {
    this.queue.push({
      ...post,
      platform,
      scheduleTime,
      retries: 0
    });

    this.save(this.queueFile, this.queue);
  }

  // =========================
  // 🤖 INSTAGRAM POST (AUTOMATION)
  // =========================
  async postToInstagram(post) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
      await page.goto('https://www.instagram.com/accounts/login/');

      // LOGIN (store cookies in real system)
      await page.fill('input[name="username"]', process.env.IG_USER);
      await page.fill('input[name="password"]', process.env.IG_PASS);
      await page.click('button[type="submit"]');

      await page.waitForTimeout(5000);

      // Navigate to create post
      await page.goto('https://www.instagram.com/create/style/');

      // Upload file (you would generate/download video first)
      // await page.setInputFiles('input[type="file"]', 'video.mp4');

      // Caption
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
  // 🎵 TIKTOK POST (AUTOMATION)
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

      // Upload video
      // await page.setInputFiles('input[type="file"]', 'video.mp4');

      await page.fill('textarea', post.content);

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
  // 🔄 PROCESS QUEUE
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
      } else {
        post.retries++;
        post.status = post.retries > 3 ? 'failed' : 'pending';
      }

      this.logs.push({
        postId: post.id,
        platform: post.platform,
        success: result.success,
        error: result.error || null,
        timestamp: new Date().toISOString()
      });
    }

    this.save(this.queueFile, this.queue);
    this.save(this.logFile, this.logs);
  }

  // =========================
  // 🔁 AUTO LOOP
  // =========================
  startWorker(interval = 60000) {
    console.log('🤖 Social bot started...');
    setInterval(() => {
      this.processQueue();
    }, interval);
  }
}

module.exports = SocialPostingBot;
