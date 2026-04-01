// 🛡️ SOCIAL BOT SAFETY RULES
// Critical safety measures to avoid platform bans

class SocialBotSafetyRules {
  constructor() {
    this.safetyConfig = {
      // Posting limits per account per day
      maxPostsPerDay: {
        instagram: 3,
        tiktok: 5,
        facebook: 3,
        twitter: 5
      },
      
      // Minimum delays between posts (in minutes)
      minDelayBetweenPosts: {
        instagram: 240,  // 4 hours
        tiktok: 180,     // 3 hours
        facebook: 240,   // 4 hours
        twitter: 120     // 2 hours
      },
      
      // Browser settings
      browser: {
        headless: false,  // Always use real browser
        userAgent: 'random',  // Rotate user agents
        viewport: 'random',   // Random viewport sizes
        language: 'en-US'
      },
      
      // Session management
      session: {
        cookieStorage: true,  // Store cookies
        loginReuse: true,     // Reuse login sessions
        maxSessionDuration: 3600000,  // 1 hour max session
        randomDelayRange: [30000, 120000]  // 30s-2min random delays
      },
      
      // Proxy configuration for scaling
      proxy: {
        enabled: false,  // Enable only when scaling
        residential: true,  // Use residential proxies
        rotation: 'per-account',  // Rotate proxy per account
        healthCheck: true
      },
      
      // Content safety
      content: {
        duplicateCheck: true,  // Check for duplicate content
        spamFilter: true,      // Basic spam filtering
        lengthLimits: {
          min: 10,
          max: 2200
        },
        forbiddenWords: [
          'spam', 'scam', 'fake', 'bot', 'automated',
          'clickbait', 'misleading', 'deceptive'
        ]
      },
      
      // Rate limiting
      rateLimit: {
        requestsPerMinute: 2,
        maxConcurrentSessions: 1,
        cooldownPeriod: 3600000  // 1 hour cooldown after limit hit
      }
    };
  }

  // Check if posting is safe
  isSafeToPost(platform, accountStats) {
    const now = new Date();
    const today = now.toDateString();
    
    // Check daily limit
    const todayPosts = accountStats.posts?.filter(post => 
      new Date(post.timestamp).toDateString() === today
    ).length || 0;
    
    if (todayPosts >= this.safetyConfig.maxPostsPerDay[platform]) {
      return {
        safe: false,
        reason: `Daily limit reached: ${todayPosts}/${this.safetyConfig.maxPostsPerDay[platform]}`
      };
    }
    
    // Check minimum delay
    const lastPost = accountStats.lastPostTime;
    if (lastPost) {
      const timeSinceLastPost = now - new Date(lastPost);
      const minDelay = this.safetyConfig.minDelayBetweenPosts[platform] * 60000;
      
      if (timeSinceLastPost < minDelay) {
        const waitTime = Math.ceil((minDelay - timeSinceLastPost) / 60000);
        return {
          safe: false,
          reason: `Must wait ${waitTime} minutes before next post`
        };
      }
    }
    
    return { safe: true };
  }

  // Get safe posting time
  getNextSafeTime(platform, accountStats) {
    const now = new Date();
    const minDelay = this.safetyConfig.minDelayBetweenPosts[platform] * 60000;
    
    // Check last post time
    const lastPost = accountStats.lastPostTime;
    if (lastPost) {
      const timeSinceLastPost = now - new Date(lastPost);
      if (timeSinceLastPost < minDelay) {
        return new Date(Date.now() + (minDelay - timeSinceLastPost));
      }
    }
    
    // Check daily limit
    const today = now.toDateString();
    const todayPosts = accountStats.posts?.filter(post => 
      new Date(post.timestamp).toDateString() === today
    ).length || 0;
    
    if (todayPosts >= this.safetyConfig.maxPostsPerDay[platform]) {
      // Next safe time is tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);  // 9 AM next day
      return tomorrow;
    }
    
    return now;
  }

  // Validate content safety
  validateContent(content, platform) {
    const issues = [];
    
    // Check length
    if (content.length < this.safetyConfig.content.lengthLimits.min) {
      issues.push('Content too short');
    }
    
    if (content.length > this.safetyConfig.content.lengthLimits.max) {
      issues.push('Content too long');
    }
    
    // Check forbidden words
    const lowerContent = content.toLowerCase();
    this.safetyConfig.content.forbiddenWords.forEach(word => {
      if (lowerContent.includes(word)) {
        issues.push(`Contains forbidden word: ${word}`);
      }
    });
    
    // Platform-specific checks
    if (platform === 'instagram') {
      if (!content.includes('#')) {
        issues.push('Instagram posts should include hashtags');
      }
    }
    
    if (platform === 'tiktok') {
      if (content.length > 150) {
        issues.push('TikTok posts should be under 150 characters');
      }
    }
    
    return {
      safe: issues.length === 0,
      issues: issues
    };
  }

  // Get random delay
  getRandomDelay() {
    const [min, max] = this.safetyConfig.session.randomDelayRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Get browser configuration
  getBrowserConfig() {
    return {
      headless: this.safetyConfig.browser.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };
  }

  // Get user agent rotation
  getUserAgents() {
    return [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
    ];
  }

  // Get viewport sizes
  getViewportSizes() {
    return [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 1280, height: 720 }
    ];
  }

  // Check for duplicate content
  checkDuplicate(content, existingPosts) {
    const normalizedContent = content.toLowerCase().trim();
    
    return existingPosts.some(post => {
      const existingNormalized = post.content.toLowerCase().trim();
      const similarity = this.calculateSimilarity(normalizedContent, existingNormalized);
      return similarity > 0.8;  // 80% similarity threshold
    });
  }

  // Calculate text similarity
  calculateSimilarity(text1, text2) {
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Levenshtein distance algorithm
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Get safety report
  getSafetyReport(accountStats) {
    const today = new Date().toDateString();
    const todayPosts = accountStats.posts?.filter(post => 
      new Date(post.timestamp).toDateString() === today
    ).length || 0;
    
    const report = {
      date: today,
      postsToday: todayPosts,
      dailyLimits: this.safetyConfig.maxPostsPerDay,
      nextSafeTimes: {},
      warnings: []
    };
    
    // Calculate next safe times for each platform
    Object.keys(this.safetyConfig.maxPostsPerDay).forEach(platform => {
      const nextSafeTime = this.getNextSafeTime(platform, accountStats);
      report.nextSafeTimes[platform] = nextSafeTime.toLocaleString();
      
      if (todayPosts >= this.safetyConfig.maxPostsPerDay[platform]) {
        report.warnings.push(`${platform}: Daily limit reached`);
      }
    });
    
    return report;
  }

  // Apply safety measures to bot configuration
  applySafetyMeasures(bot) {
    // Override bot methods with safety checks
    const originalEnqueue = bot.enqueue;
    bot.enqueue = function(post, platform, scheduleTime) {
      const safetyCheck = this.safety.isSafeToPost(platform, bot.accountStats);
      
      if (!safetyCheck.safe) {
        console.warn(`⚠️ Safety check failed: ${safetyCheck.reason}`);
        return false;
      }
      
      const contentCheck = this.safety.validateContent(post.content, platform);
      if (!contentCheck.safe) {
        console.warn(`⚠️ Content validation failed: ${contentCheck.issues.join(', ')}`);
        return false;
      }
      
      return originalEnqueue.call(this, post, platform, scheduleTime);
    }.bind({ safety: this });
    
    // Add safety tracking
    bot.accountStats = {
      posts: [],
      lastPostTime: null,
      dailyCount: {}
    };
    
    return bot;
  }
}

module.exports = SocialBotSafetyRules;
