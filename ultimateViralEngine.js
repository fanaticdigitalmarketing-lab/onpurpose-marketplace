const fs = require('fs');
const axios = require('axios');
const { execSync } = require('child_process');

class UltimateViralEngine {
  constructor(aiClient) {
    this.ai = aiClient;
    this.outputDir = './videos';

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir);
    }
  }

  // =========================
  // 🔥 TREND SCRAPER
  // =========================
  async getTrendingTopic() {
    const topics = [
      "make money online",
      "AI side hustles",
      "passive income",
      "self improvement",
      "fitness motivation"
    ];

    return topics[Math.floor(Math.random() * topics.length)];
  }

  // =========================
  // 🧠 SCRIPT WITH SCENES
  // =========================
  async generateScript(topic) {
    const prompt = `
    Create a viral TikTok script split into scenes.

    Topic: ${topic}

    Rules:
    - 5–7 scenes
    - Each scene = 1 short sentence
    - First scene = strong hook
    - Last scene = CTA

    Format JSON:
    {
      "scenes": ["line1", "line2", ...]
    }
    `;

    const result = await this.ai.generate(prompt);
    return JSON.parse(result);
  }

  // =========================
  // 🎙️ VOICE GENERATION
  // =========================
  async generateVoice(fullText, filename) {
    const filePath = `${this.outputDir}/${filename}.mp3`;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}`,
      { text: fullText },
      {
        headers: { 'xi-api-key': process.env.ELEVENLABS_KEY },
        responseType: 'arraybuffer'
      }
    );

    fs.writeFileSync(filePath, response.data);
    return filePath;
  }

  // =========================
  // 🎥 FETCH MULTIPLE CLIPS
  // =========================
  async fetchClip(query, index, id) {
    const res = await axios.get(`https://api.pexels.com/videos/search`, {
      headers: { Authorization: process.env.PEXELS_KEY },
      params: { query, per_page: 1 }
    });

    const url = res.data.videos[0].video_files[0].link;
    const filePath = `${this.outputDir}/${id}_${index}.mp4`;

    const video = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, video.data);

    return filePath;
  }

  // =========================
  // ✂️ CREATE FAST CUT VIDEO
  // =========================
  async createSceneCuts(clips, filename) {
    const listFile = `${this.outputDir}/list.txt`;

    fs.writeFileSync(
      listFile,
      clips.map(c => `file '${c}'`).join('\n')
    );

    const output = `${this.outputDir}/${filename}-cuts.mp4`;

    execSync(`
      ffmpeg -f concat -safe 0 -i ${listFile} -c copy ${output}
    `);

    return output;
  }

  // =========================
  // 📝 WORD-BY-WORD CAPTIONS
  // =========================
  async addWordCaptions(videoPath, text, filename) {
    const words = text.split(' ');
    const output = `${this.outputDir}/${filename}-final.mp4`;

    // Create animated captions (simple version)
    const captionFilter = words.map((word, i) => {
      const start = i * 0.5;
      const end = start + 0.5;

      return `drawtext=text='${word}':enable='between(t,${start},${end})':x=(w-text_w)/2:y=h-300:fontsize=70:fontcolor=white:borderw=3`;
    }).join(',');

    execSync(`
      ffmpeg -i ${videoPath} -vf "${captionFilter}" -codec:a copy ${output}
    `);

    return output;
  }

  // =========================
  // 🔥 FULL PIPELINE
  // =========================
  async createUltimateVideo() {
    const id = `ultimate_${Date.now()}`;

    console.log("🔥 Getting trend...");
    const topic = await this.getTrendingTopic();

    console.log("🧠 Generating scenes...");
    const { scenes } = await this.generateScript(topic);

    const fullText = scenes.join(' ');

    console.log("🎙️ Generating voice...");
    const audio = await this.generateVoice(fullText, id);

    console.log("🎥 Fetching clips...");
    const clips = [];
    for (let i = 0; i < scenes.length; i++) {
      const clip = await this.fetchClip(topic, i, id);
      clips.push(clip);
    }

    console.log("✂️ Creating fast cuts...");
    const cuts = await this.createSceneCuts(clips, id);

    console.log("📝 Adding captions...");
    const final = await this.addWordCaptions(cuts, fullText, id);

    console.log("🔗 Merging audio...");
    const finalOutput = `${this.outputDir}/${id}-complete.mp4`;

    execSync(`
      ffmpeg -i ${final} -i ${audio} -shortest -c:v copy -c:a aac ${finalOutput}
    `);

    return {
      id,
      topic,
      scenes,
      videoPath: finalOutput
    };
  }
}

module.exports = UltimateViralEngine;
