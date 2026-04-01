const SocialBot = require('./socialPostingBot');
const AIClient = require('./your-ai-client');

const ai = new AIClient(process.env.OPENAI_KEY);
const bot = new SocialBot(ai);

const product = {
  id: '1',
  name: 'AI Startup Engine',
  audience: 'entrepreneurs'
};

// Generate content
const post = await bot.generateContent(product);

// Schedule posts
bot.enqueue(post, 'instagram', new Date(Date.now() + 60000));
bot.enqueue(post, 'tiktok', new Date(Date.now() + 120000));

// Start worker
bot.startWorker();
