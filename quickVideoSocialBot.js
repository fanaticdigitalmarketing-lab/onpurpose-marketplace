const AIVideoEngine = require('./aiVideoEngine');
const SocialBot = require('./socialPostingBot');
const AIClient = require('./your-ai-client');

const ai = new AIClient(process.env.OPENAI_KEY);

const videoEngine = new AIVideoEngine(ai);
const bot = new SocialBot(ai);

(async () => {
  const topic = "How to make money with AI";

  // 🎬 Create video
  const video = await videoEngine.createVideo(topic);

  // 📣 Create post object
  const post = {
    id: video.id,
    content: video.script,
    videoPath: video.video
  };

  // 📅 Schedule posting
  bot.enqueue(post, 'tiktok', new Date(Date.now() + 60000));
  bot.enqueue(post, 'instagram', new Date(Date.now() + 120000));

  bot.startWorker();
})();
