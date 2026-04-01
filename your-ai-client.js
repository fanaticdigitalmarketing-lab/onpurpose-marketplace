class AIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.model = 'gpt-4o-mini';
    this.temperature = 0.7;
  }

  async generate(prompt) {
    if (!this.apiKey) {
      // Mock response for demo
      return this.generateMockResponse(prompt);
    }

    try {
      const fetch = require('node-fetch');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional marketing expert. Generate compelling, high-converting marketing content.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.temperature,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error('AI API error:', error.message);
      return this.generateMockResponse(prompt);
    }
  }

  generateMockResponse(prompt) {
    // Generate intelligent mock responses based on prompt content
    if (prompt.includes('high-converting ads')) {
      return `
1. "Stop Wasting Time on Bad Ideas! Our AI Marketplace finds profitable services in seconds. Entrepreneurs are making $10K+ monthly. Start now!"

2. "Your Next Breakthrough is Here. Discover high-demand services customers actually pay for. Join thousands of successful entrepreneurs today."

3. "Tired of Guessing What Sells? Our AI analyzes market trends and delivers winning service ideas. Transform your business instantly."

4. "Why 90% of Service Businesses Fail? They pick the wrong niche. Our AI eliminates guesswork. Success is just one click away."

5. "From Zero to $50K in 90 Days. Real entrepreneurs using our AI Marketplace. Your profitable service idea awaits. Don't wait!"
      `.trim();
    }
    
    if (prompt.includes('SEO keywords')) {
      return `
SEO Keywords for online business:
1. "AI service marketplace"
2. "profitable online services"
3. "automated business ideas"
4. "AI-powered entrepreneurship"
5. "digital service trends"

Blog Post:
The Ultimate Guide to Finding Profitable Online Services in 2024

In today's digital economy, finding the right service to offer can make the difference between success and failure. Entrepreneurs who leverage AI-powered marketplaces are discovering profitable niches that were previously hidden.

The key is understanding market demand and competition levels. Our AI platform analyzes thousands of data points to identify services with high profit potential and low saturation.

Whether you're a freelancer, agency owner, or aspiring entrepreneur, the right service idea can transform your income potential. The future of online business is here, and it's powered by artificial intelligence.

Start your journey today and let AI guide you to profitability.
      `.trim();
    }
    
    if (prompt.includes('viral social media posts')) {
      return `
1. "POV: You finally found a service people actually want to buy 💰 Our AI marketplace changed everything for my business"

2. "Stop scrolling past this if you're tired of guessing what sells 🤖 This AI finds profitable services automatically"

3. "That moment when you realize you could've been making $10K/month this whole time 😱 Don't make my mistake"

4. "My accountant asked if I won the lottery 🎰 Nope, just used AI to find the right services to offer"

5. "Want to know the secret? It's not working harder - it's working smarter with AI-powered market research"
      `.trim();
    }
    
    return "AI-generated marketing content based on your requirements.";
  }
}

module.exports = AIClient;
