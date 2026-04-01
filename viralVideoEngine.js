const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');

class ViralVideoEngine {
  constructor(aiClient) {
    this.ai = aiClient;
    this.outputDir = './videos';

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir);
    }
  }

  // =========================
  // 🧠 SCRIPT (HOOK-OPTIMIZED)
  // =========================
  async generateScript(topic) {
    const prompt = `
    Create a HIGHLY viral TikTok script.

    Topic: ${topic}

    Requirements:
    - First line MUST hook attention
    - Fast paced
    - Short sentences
    - Pattern interrupts
    - Ends with CTA

    Format:
    Hook:
    Lines:
    CTA:
    `;

    return await this.ai.generate(prompt);
  }

  // =========================
  // 🎙️ REAL VOICE (ElevenLabs)
  // =========================
  async generateVoice(script, filename) {
    const filePath = `${this.outputDir}/${filename}.mp3`;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.VOICE_ID}`,
      {
        text: script,
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    fs.writeFileSync(filePath, response.data);
    return filePath;
  }

  // =========================
  // 🎥 FETCH REAL VIDEO CLIPS
  // =========================
  async fetchStockVideo(query, filename) {
    const res = await axios.get(`https://api.pexels.com/videos/search`, {
      headers: { Authorization: process.env.PEXELS_KEY },
      params: { query, per_page: 1 }
    });

    const videoUrl = res.data.videos[0].video_files[0].link;

    const filePath = `${this.outputDir}/${filename}.mp4`;

    const video = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, video.data);

    return filePath;
  }

  // =========================
  // ✂️ CUT + SYNC VIDEO TO AUDIO
  // =========================
  async mergeAudioVideo(videoPath, audioPath, filename) {
    const output = `${this.outputDir}/${filename}-merged.mp4`;

    execSync(`
      ffmpeg -i ${videoPath} -i ${audioPath} \
      -c:v copy -c:a aac -shortest ${output}
    `);

    return output;
  }

  // =========================
  // 📝 VIRAL CAPTIONS (BIG + CENTER)
  // =========================
  async addViralCaptions(videoPath, script, filename) {
    const output = `${this.outputDir}/${filename}-final.mp4`;

    const cleanText = script
      .replace(/\n/g, ' ')
      .replace(/:/g, '\\:');

    execSync(`
      ffmpeg -i ${videoPath} \
      -vf "drawtext=text='${cleanText}':fontcolor=white:fontsize=60:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-300" \
      -codec:a copy ${output}
    `);

    return output;
  }

  // =========================
  // 🔥 FULL VIRAL PIPELINE
  // =========================
  async createViralVideo(topic) {
    const id = `viral_${Date.now()}`;

    console.log("🧠 Generating script...");
    const script = await this.generateScript(topic);

    console.log("🎙️ Generating voice...");
    const audio = await this.generateVoice(script, id);

    console.log("🎥 Fetching footage...");
    const video = await this.fetchStockVideo(topic, id);

    console.log("🔗 Syncing audio/video...");
    const merged = await this.mergeAudioVideo(video, audio, id);

    console.log("📝 Adding captions...");
    const final = await this.addViralCaptions(merged, script, id);

    return {
      id,
      script,
      videoPath: final
    };
  }
}

module.exports = ViralVideoEngine;
