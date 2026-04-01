// 🧬 EMBEDDING ENGINE
// Generates vector embeddings for semantic search and memory storage

const fs = require('fs');
const crypto = require('crypto');

class EmbeddingEngine {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.model = 'text-embedding-3-small';
    this.cacheFile = 'embeddingCache.json';
    this.maxCacheSize = 5000;
    
    this.cache = this.loadCache();
  }

  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading embedding cache:', error.message);
    }
    
    return {};
  }

  saveCache() {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Error saving embedding cache:', error.message);
    }
  }

  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text for embedding generation');
    }
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(text);
    
    // Check cache first
    if (this.cache[cacheKey]) {
      console.log('🎯 Cache hit for embedding');
      return this.cache[cacheKey].embedding;
    }
    
    try {
      let embedding;
      
      if (this.openaiApiKey) {
        embedding = await this.generateOpenAIEmbedding(text);
      } else {
        embedding = this.generateMockEmbedding(text);
      }
      
      // Cache the result
      this.cache[cacheKey] = {
        text: text.substring(0, 100), // Store first 100 chars for reference
        embedding: embedding,
        timestamp: new Date().toISOString()
      };
      
      // Cleanup cache if needed
      this.cleanupCache();
      
      // Save cache
      this.saveCache();
      
      console.log(`🧬 Generated embedding (${embedding.length} dimensions)`);
      
      return embedding;
      
    } catch (error) {
      console.error('Error generating embedding:', error.message);
      
      // Fallback to mock embedding
      return this.generateMockEmbedding(text);
    }
  }

  generateCacheKey(text) {
    // Create a hash of the text for cache key
    return crypto.createHash('md5').update(text).digest('hex');
  }

  async generateOpenAIEmbedding(text) {
    const fetch = require('node-fetch');
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
        encoding_format: 'float'
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    return data.data[0].embedding;
  }

  generateMockEmbedding(text) {
    // Generate a deterministic mock embedding based on text content
    const dimensions = 1536; // Same as OpenAI's text-embedding-3-small
    const embedding = new Array(dimensions);
    
    // Create a hash from the text
    const hash = crypto.createHash('sha256').update(text).digest();
    
    // Use the hash to generate consistent pseudo-random values
    for (let i = 0; i < dimensions; i++) {
      const byteIndex = i % hash.length;
      const nextByteIndex = (i + 1) % hash.length;
      
      // Combine bytes for more variation
      const combined = (hash[byteIndex] << 8) | hash[nextByteIndex];
      
      // Normalize to [-1, 1] range
      embedding[i] = (combined / 65535) * 2 - 1;
    }
    
    // Apply some text-specific modifications
    const textFeatures = this.extractTextFeatures(text);
    this.applyTextFeatures(embedding, textFeatures);
    
    // Normalize the embedding
    this.normalizeEmbedding(embedding);
    
    return embedding;
  }

  extractTextFeatures(text) {
    const features = {
      length: text.length,
      wordCount: text.split(/\s+/).length,
      hasCode: /```|function|class|const|let|var/.test(text),
      hasError: /error|Error|ERROR/.test(text),
      hasFix: /fix|Fix|FIX/.test(text),
      hasPattern: /pattern|Pattern|PATTERN/.test(text),
      hasIssue: /issue|Issue|ISSUE/.test(text),
      hasSuccess: /success|Success|SUCCESS/.test(text),
      hasFailure: /failure|Failure|FAILURE/.test(text),
      lineCount: text.split('\n').length,
      uniqueChars: new Set(text).size
    };
    
    return features;
  }

  applyTextFeatures(embedding, features) {
    const dimensions = embedding.length;
    
    // Apply feature-based modifications to specific dimensions
    const featureMappings = [
      { feature: 'hasCode', dimensions: [0, 1, 2], multiplier: 0.3 },
      { feature: 'hasError', dimensions: [3, 4, 5], multiplier: 0.4 },
      { feature: 'hasFix', dimensions: [6, 7, 8], multiplier: 0.3 },
      { feature: 'hasPattern', dimensions: [9, 10, 11], multiplier: 0.5 },
      { feature: 'hasIssue', dimensions: [12, 13, 14], multiplier: 0.4 },
      { feature: 'hasSuccess', dimensions: [15, 16, 17], multiplier: 0.3 },
      { feature: 'hasFailure', dimensions: [18, 19, 20], multiplier: 0.4 }
    ];
    
    featureMappings.forEach(({ feature, dimensions, multiplier }) => {
      if (features[feature]) {
        dimensions.forEach(dim => {
          if (dim < dimensions.length) {
            embedding[dim] *= (1 + multiplier);
          }
        });
      }
    });
    
    // Apply length-based scaling
    const lengthScale = Math.min(features.length / 1000, 2); // Cap at 2x
    for (let i = 21; i < Math.min(50, dimensions); i++) {
      embedding[i] *= lengthScale;
    }
    
    // Apply word count scaling
    const wordScale = Math.min(features.wordCount / 100, 1.5); // Cap at 1.5x
    for (let i = 50; i < Math.min(100, dimensions); i++) {
      embedding[i] *= wordScale;
    }
  }

  normalizeEmbedding(embedding) {
    // Calculate magnitude
    let magnitude = 0;
    for (let i = 0; i < embedding.length; i++) {
      magnitude += embedding[i] * embedding[i];
    }
    magnitude = Math.sqrt(magnitude);
    
    // Normalize to unit vector
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }
  }

  async generateBatchEmbeddings(texts) {
    const embeddings = [];
    
    for (const text of texts) {
      try {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      } catch (error) {
        console.error('Error generating batch embedding:', error.message);
        embeddings.push(null);
      }
    }
    
    return embeddings;
  }

  calculateSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (norm1 * norm2);
  }

  findMostSimilar(queryEmbedding, candidateEmbeddings, topK = 5) {
    const similarities = candidateEmbeddings.map((embedding, index) => ({
      index,
      similarity: this.calculateSimilarity(queryEmbedding, embedding)
    }));
    
    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // Return top K results
    return similarities.slice(0, topK);
  }

  cleanupCache() {
    const cacheKeys = Object.keys(this.cache);
    
    if (cacheKeys.length <= this.maxCacheSize) return;
    
    // Sort by timestamp (oldest first)
    const sortedEntries = cacheKeys
      .map(key => ({
        key,
        timestamp: this.cache[key].timestamp
      }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Remove oldest entries
    const toRemove = sortedEntries.slice(0, cacheKeys.length - this.maxCacheSize);
    
    toRemove.forEach(({ key }) => {
      delete this.cache[key];
    });
    
    console.log(`🧹 Cleaned up ${toRemove.length} old cache entries`);
  }

  getCacheStats() {
    const entries = Object.values(this.cache);
    const totalSize = JSON.stringify(this.cache).length;
    
    return {
      totalEntries: entries.length,
      totalSize: totalSize,
      averageEntrySize: totalSize / entries.length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => new Date(e.timestamp).getTime())) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => new Date(e.timestamp).getTime())) : null
    };
  }

  clearCache() {
    this.cache = {};
    this.saveCache();
    console.log('🗑️ Embedding cache cleared');
  }

  async preloadEmbeddings(texts) {
    console.log(`🚀 Preloading ${texts.length} embeddings...`);
    
    const startTime = Date.now();
    const embeddings = await this.generateBatchEmbeddings(texts);
    const duration = Date.now() - startTime;
    
    const successCount = embeddings.filter(e => e !== null).length;
    
    console.log(`✅ Preloaded ${successCount}/${texts.length} embeddings in ${duration}ms`);
    
    return embeddings;
  }

  getEmbeddingInfo() {
    return {
      model: this.model,
      dimensions: 1536,
      cacheStats: this.getCacheStats(),
      hasApiKey: !!this.openaiApiKey
    };
  }
}

module.exports = EmbeddingEngine;
