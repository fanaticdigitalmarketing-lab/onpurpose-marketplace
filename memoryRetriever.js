// 🔍 SEMANTIC MEMORY RETRIEVER
// Intelligently retrieves relevant memories using vector similarity

const MemoryStore = require('./memoryStore');
const EmbeddingEngine = require('./embeddingEngine');

class MemoryRetriever {
  constructor() {
    this.memoryStore = new MemoryStore();
    this.embeddingEngine = new EmbeddingEngine();
    this.similarityThreshold = 0.7;
    this.maxResults = 5;
    this.rerankResults = true;
  }

  async findRelevantMemories(query, options = {}) {
    const {
      type = null,
      repository = null,
      tags = null,
      limit = this.maxResults,
      threshold = this.similarityThreshold,
      includeMetadata = true
    } = options;
    
    console.log(`🔍 Searching memories for: "${query.substring(0, 100)}..."`);
    
    try {
      // Step 1: Generate embedding for query
      const queryEmbedding = await this.embeddingEngine.generateEmbedding(query);
      
      // Step 2: Get candidate memories
      const candidates = this.getCandidateMemories(type, repository, tags);
      
      if (candidates.length === 0) {
        console.log('📭 No candidate memories found');
        return [];
      }
      
      console.log(`📚 Found ${candidates.length} candidate memories`);
      
      // Step 3: Calculate similarities
      const similarities = this.calculateSimilarities(queryEmbedding, candidates);
      
      // Step 4: Filter by threshold
      const filtered = similarities.filter(item => item.similarity >= threshold);
      
      console.log(`🎯 ${filtered.length} memories passed similarity threshold (${threshold})`);
      
      // Step 5: Rerank if enabled
      let results = filtered;
      if (this.rerankResults && filtered.length > 1) {
        results = this.rerankResults(query, filtered);
      }
      
      // Step 6: Apply limit and format results
      const finalResults = results
        .slice(0, limit)
        .map(item => this.formatMemoryItem(item.memory, item.similarity, includeMetadata));
      
      console.log(`📋 Returning ${finalResults.length} relevant memories`);
      
      return finalResults;
      
    } catch (error) {
      console.error('Error finding relevant memories:', error.message);
      return [];
    }
  }

  getCandidateMemories(type, repository, tags) {
    let candidates = this.memoryStore.getAllMemories();
    
    // Filter by type
    if (type) {
      candidates = candidates.filter(memory => memory.type === type);
    }
    
    // Filter by repository
    if (repository) {
      candidates = candidates.filter(memory => memory.repository === repository);
    }
    
    // Filter by tags
    if (tags && tags.length > 0) {
      candidates = candidates.filter(memory => 
        memory.tags && tags.some(tag => memory.tags.includes(tag))
      );
    }
    
    // Only include memories with embeddings
    candidates = candidates.filter(memory => memory.embedding && memory.embedding.length > 0);
    
    return candidates;
  }

  calculateSimilarities(queryEmbedding, candidates) {
    const similarities = [];
    
    candidates.forEach(memory => {
      const similarity = this.embeddingEngine.calculateSimilarity(
        queryEmbedding,
        memory.embedding
      );
      
      similarities.push({
        memory,
        similarity,
        score: this.calculateCompositeScore(memory, similarity)
      });
    });
    
    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities;
  }

  calculateCompositeScore(memory, similarity) {
    let score = similarity;
    
    // Boost score based on success rate
    if (memory.successRate > 0) {
      score *= (1 + memory.successRate * 0.3);
    }
    
    // Boost score based on usage count
    if (memory.usageCount > 0) {
      const usageBoost = Math.min(memory.usageCount / 10, 0.2); // Cap at 20% boost
      score *= (1 + usageBoost);
    }
    
    // Boost score based on recency
    const recencyScore = this.getRecencyScore(memory);
    score *= (1 + recencyScore * 0.1);
    
    return score;
  }

  getRecencyScore(memory) {
    const daysSince = (Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - daysSince / 365); // Decay over a year
  }

  rerankResults(query, similarities) {
    // Enhanced reranking using multiple factors
    const reranked = similarities.map(item => {
      const memory = item.memory;
      
      // Text-based relevance score
      const textScore = this.calculateTextRelevance(query, memory.content);
      
      // Type-based relevance
      const typeScore = this.calculateTypeRelevance(query, memory.type);
      
      // Success rate boost
      const successBoost = memory.successRate || 0;
      
      // Usage count boost
      const usageBoost = Math.min((memory.usageCount || 0) / 20, 0.3);
      
      // Composite rerank score
      const rerankScore = (
        item.similarity * 0.4 +
        textScore * 0.3 +
        typeScore * 0.2 +
        successBoost * 0.05 +
        usageBoost * 0.05
      );
      
      return {
        ...item,
        rerankScore,
        textScore,
        typeScore
      };
    });
    
    // Sort by rerank score
    reranked.sort((a, b) => b.rerankScore - a.rerankScore);
    
    return reranked;
  }

  calculateTextRelevance(query, content) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let relevanceScore = 0;
    let matchedWords = 0;
    
    queryWords.forEach(word => {
      if (word.length > 2) { // Ignore very short words
        const wordCount = (contentLower.match(new RegExp(word, 'g')) || []).length;
        if (wordCount > 0) {
          matchedWords++;
          relevanceScore += Math.min(wordCount * 0.1, 0.5); // Cap at 0.5 per word
        }
      }
    });
    
    // Normalize by number of query words
    if (queryWords.length > 2) {
      relevanceScore = relevanceScore / queryWords.length;
    }
    
    return Math.min(relevanceScore, 1);
  }

  calculateTypeRelevance(query, type) {
    const queryLower = query.toLowerCase();
    
    const typeKeywords = {
      issue: ['issue', 'problem', 'bug', 'error', 'fail'],
      fix: ['fix', 'solution', 'resolve', 'repair', 'correct'],
      pattern: ['pattern', 'approach', 'method', 'strategy', 'technique'],
      outcome: ['result', 'outcome', 'success', 'failure', 'consequence']
    };
    
    const keywords = typeKeywords[type] || [];
    const matchCount = keywords.filter(keyword => queryLower.includes(keyword)).length;
    
    return matchCount > 0 ? matchCount / keywords.length : 0;
  }

  formatMemoryItem(memory, similarity, includeMetadata = true) {
    const item = {
      id: memory.id,
      type: memory.type,
      content: memory.content,
      similarity: similarity,
      successRate: memory.successRate,
      usageCount: memory.usageCount,
      timestamp: memory.timestamp,
      repository: memory.repository,
      tags: memory.tags
    };
    
    if (includeMetadata) {
      item.metadata = memory.metadata;
    }
    
    // Add relevance indicators
    if (similarity > 0.9) {
      item.relevance = 'very_high';
    } else if (similarity > 0.8) {
      item.relevance = 'high';
    } else if (similarity > 0.7) {
      item.relevance = 'medium';
    } else {
      item.relevance = 'low';
    }
    
    return item;
  }

  async findSimilarMemories(memoryId, options = {}) {
    const { limit = 5, threshold = 0.7 } = options;
    
    const targetMemory = this.memoryStore.getMemory(memoryId);
    if (!targetMemory || !targetMemory.embedding) {
      console.log(`❌ Memory not found or has no embedding: ${memoryId}`);
      return [];
    }
    
    console.log(`🔍 Finding memories similar to: ${memoryId}`);
    
    // Get candidates (exclude the target memory itself)
    const candidates = this.memoryStore.getAllMemories()
      .filter(memory => 
        memory.id !== memoryId && 
        memory.embedding && 
        memory.embedding.length > 0
      );
    
    if (candidates.length === 0) {
      console.log('📭 No candidate memories for similarity search');
      return [];
    }
    
    // Calculate similarities
    const similarities = this.calculateSimilarities(targetMemory.embedding, candidates);
    
    // Filter and sort
    const filtered = similarities
      .filter(item => item.similarity >= threshold)
      .slice(0, limit);
    
    const results = filtered.map(item => 
      this.formatMemoryItem(item.memory, item.similarity)
    );
    
    console.log(`📋 Found ${results.length} similar memories`);
    
    return results;
  }

  async findPatterns(query, options = {}) {
    return this.findRelevantMemories(query, { ...options, type: 'pattern' });
  }

  async findFixes(query, options = {}) {
    return this.findRelevantMemories(query, { ...options, type: 'fix' });
  }

  async findIssues(query, options = {}) {
    return this.findRelevantMemories(query, { ...options, type: 'issue' });
  }

  async getMemoryStats() {
    const allMemories = this.memoryStore.getAllMemories();
    const memoriesWithEmbeddings = allMemories.filter(m => m.embedding && m.embedding.length > 0);
    
    const stats = {
      totalMemories: allMemories.length,
      memoriesWithEmbeddings: memoriesWithEmbeddings.length,
      embeddingCoverage: allMemories.length > 0 ? memoriesWithEmbeddings.length / allMemories.length : 0,
      averageSimilarity: this.calculateAverageSimilarity(memoriesWithEmbeddings),
      typeDistribution: this.calculateTypeDistribution(allMemories),
      repositoryDistribution: this.calculateRepositoryDistribution(allMemories),
      successRateDistribution: this.calculateSuccessRateDistribution(allMemories)
    };
    
    return stats;
  }

  calculateAverageSimilarity(memories) {
    if (memories.length < 2) return 0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    // Sample comparisons (avoid O(n^2) for large datasets)
    const sampleSize = Math.min(memories.length, 100);
    const sample = memories.slice(0, sampleSize);
    
    for (let i = 0; i < sample.length; i++) {
      for (let j = i + 1; j < sample.length; j++) {
        const similarity = this.embeddingEngine.calculateSimilarity(
          sample[i].embedding,
          sample[j].embedding
        );
        totalSimilarity += similarity;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  calculateTypeDistribution(memories) {
    const distribution = {};
    
    memories.forEach(memory => {
      distribution[memory.type] = (distribution[memory.type] || 0) + 1;
    });
    
    return distribution;
  }

  calculateRepositoryDistribution(memories) {
    const distribution = {};
    
    memories.forEach(memory => {
      const repo = memory.repository || 'unknown';
      distribution[repo] = (distribution[repo] || 0) + 1;
    });
    
    return distribution;
  }

  calculateSuccessRateDistribution(memories) {
    const ranges = {
      '0.0-0.2': 0,
      '0.2-0.4': 0,
      '0.4-0.6': 0,
      '0.6-0.8': 0,
      '0.8-1.0': 0
    };
    
    memories.forEach(memory => {
      const rate = memory.successRate || 0;
      
      if (rate <= 0.2) ranges['0.0-0.2']++;
      else if (rate <= 0.4) ranges['0.2-0.4']++;
      else if (rate <= 0.6) ranges['0.4-0.6']++;
      else if (rate <= 0.8) ranges['0.6-0.8']++;
      else ranges['0.8-1.0']++;
    });
    
    return ranges;
  }

  async updateMemoryEmbedding(memoryId) {
    const memory = this.memoryStore.getMemory(memoryId);
    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`);
    }
    
    console.log(`🔄 Updating embedding for memory: ${memoryId}`);
    
    // Generate new embedding
    const newEmbedding = await this.embeddingEngine.generateEmbedding(memory.content);
    
    // Update memory
    memory.embedding = newEmbedding;
    memory.lastUpdated = new Date().toISOString();
    
    // Save changes
    this.memoryStore.updateMemorySuccess(memoryId, memory.success !== false);
    
    console.log(`✅ Updated embedding for memory: ${memoryId}`);
    
    return memory;
  }

  async rebuildAllEmbeddings() {
    console.log('🔄 Rebuilding all embeddings...');
    
    const memories = this.memoryStore.getAllMemories();
    let updated = 0;
    let failed = 0;
    
    for (const memory of memories) {
      try {
        await this.updateMemoryEmbedding(memory.id);
        updated++;
      } catch (error) {
        console.error(`Failed to update embedding for ${memory.id}:`, error.message);
        failed++;
      }
    }
    
    console.log(`✅ Rebuilt embeddings: ${updated} updated, ${failed} failed`);
    
    return { updated, failed };
  }

  setSimilarityThreshold(threshold) {
    this.similarityThreshold = Math.max(0, Math.min(1, threshold));
    console.log(`🎯 Similarity threshold set to: ${this.similarityThreshold}`);
  }

  setMaxResults(maxResults) {
    this.maxResults = Math.max(1, maxResults);
    console.log(`📊 Max results set to: ${this.maxResults}`);
  }

  enableReranking(enabled = true) {
    this.rerankResults = enabled;
    console.log(`🔄 Reranking ${enabled ? 'enabled' : 'disabled'}`);
  }

  getRetrieverConfig() {
    return {
      similarityThreshold: this.similarityThreshold,
      maxResults: this.maxResults,
      rerankResults: this.rerankResults,
      embeddingEngine: this.embeddingEngine.getEmbeddingInfo()
    };
  }
}

module.exports = MemoryRetriever;
