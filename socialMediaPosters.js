const axios = require('axios');

// =========================
// 📸 INSTAGRAM POST
// =========================
async function postToInstagram(videoPath, caption) {
  const container = await axios.post(
    `https://graph.facebook.com/v19.0/${process.env.INSTAGRAM_USER_ID}/media`,
    {
      video_url: videoPath,
      caption,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN
    }
  );

  const creationId = container.data.id;

  await axios.post(
    `https://graph.facebook.com/v19.0/${process.env.INSTAGRAM_USER_ID}/media_publish`,
    {
      creation_id: creationId,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN
    }
  );

  console.log("✅ Posted to Instagram");
}

// =========================
// 🎵 TIKTOK POST (BROWSER AUTOMATION)
// =========================
const puppeteer = require('puppeteer');

async function postToTikTok(videoPath, caption) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.tiktok.com/upload');

  // You must already be logged in OR use saved session cookies

  await page.waitForSelector('input[type="file"]');
  const input = await page.$('input[type="file"]');

  await input.uploadFile(videoPath);

  await page.waitForTimeout(5000);

  await page.type('[contenteditable="true"]', caption);

  await page.click('button:has-text("Post")');

  console.log("✅ Posted to TikTok");
}

module.exports = {
  postToInstagram,
  postToTikTok
};
