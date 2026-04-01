// 📦 PERSISTENT AI MEMORY STORE
// Hybrid storage system with JSON and vector embeddings

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MemoryStore {
  constructor() {
    this.memoryFile = 'memory.json';
    this.vectorStoreFile = 'vectorStore.json';
    this.maxEntries = 10000;
    this.deduplicationThreshold = 0.9;
    
    this.memory = this.loadMemory();
    this.vectorStore = this.loadVectorStore();
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        const data = fs.readFileSync(this.memoryFile, 'utf8');
        const parsed = JSON.parse(data);
        return {
          version: parsed.version || '1.0.0',
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          entries: parsed.entries || [],
          stats: parsed.stats || this.initializeStats()
        };
      }
    } catch (error) {
      console.error('Error loading memory:', error.message);
    }
    
    return this.initializeMemory();
  }

  loadVectorStore() {
    try {
      if (fs.existsSync(this.vectorStoreFile)) {
        const data = fs.readFileSync(this.vectorStoreFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading vector store:', error.message);
    }
    
    return {};
  }

  initializeMemory() {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      entries: [],
      stats: this.initializeStats()
    };
  }

  initializeStats() {
    return {
      totalEntries: 0,
      issueEntries: 0,
      fixEntries: 0,
      patternEntries: 0,
      averageSuccessRate: 0,
      lastWeekEntries: 0,
      topPatterns: [],
      memorySize: 0
    };
  }

  async storeMemory(entry) {
    try {
      // Generate unique ID if not provided
      if (!entry.id) {
        entry.id = this.generateId();
      }
      
      // Set timestamp
      entry.timestamp = new Date().toISOString();
      
      // Check for duplicates
      const duplicate = this.findDuplicate(entry);
      if (duplicate) {
        console.log(`🔄 Found duplicate entry: ${duplicate.id}`);
        return this.updateExistingEntry(duplicate.id, entry);
      }
      
      // Validate entry
      const validatedEntry = this.validateEntry(entry);
      if (!validatedEntry) {
        throw new Error('Invalid memory entry');
      }
      
      // Add to memory
      this.memory.entries.push(validatedEntry);
      
      // Update vector store
      if (validatedEntry.embedding) {
        this.vectorStore[validatedEntry.id] = validatedEntry.embedding;
      }
      
      // Update stats
      this.updateStats();
      
      // Cleanup old entries if needed
      this.cleanupOldEntries();
      
      // Save to disk
      this.saveMemory();
      this.saveVectorStore();
      
      console.log(`💾 Stored memory entry: ${validatedEntry.id} (${validatedEntry.type})`);
      
      return validatedEntry;
      
    } catch (error) {
      console.error('Error storing memory:', error.message);
      throw error;
    }
  }

  generateId() {
    return `mem_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  findDuplicate(entry) {
    if (!entry.embedding) return null;
    
    return this.memory.entries.find(existing => {
      if (existing.type !== entry.type) return false;
      
      const similarity = this.calculateCosineSimilarity(
        entry.embedding,
        existing.embedding || []
      );
      
      return similarity > this.deduplicationThreshold;
    });
  }

  updateExistingEntry(id, newEntry) {
    const index = this.memory.entries.findIndex(entry => entry.id === id);
    if (index === -1) return null;
    
    const existing = this.memory.entries[index];
    
    // Merge entries, keeping the best data
    const merged = {
      ...existing,
      ...newEntry,
      id: existing.id, // Keep original ID
      timestamp: new Date().toISOString(),
      usageCount: (existing.usageCount || 0) + 1
    };
    
    // Update success rate if provided
    if (newEntry.success !== undefined) {
      const totalUsage = merged.usageCount || 1;
      const successCount = (existing.successCount || 0) + (newEntry.success ? 1 : 0);
      merged.successRate = successCount / totalUsage;
      merged.successCount = successCount;
    }
    
    this.memory.entries[index] = merged;
    
    // Update vector store
    if (merged.embedding) {
      this.vectorStore[merged.id] = merged.embedding;
    }
    
    this.saveMemory();
    this.saveVectorStore();
    
    return merged;
  }

  validateEntry(entry) {
    const required = ['type', 'content'];
    for (const field of required) {
      if (!entry[field]) {
        console.error(`Missing required field: ${field}`);
        return null;
      }
    }
    
    const validTypes = ['issue', 'fix', 'pattern', 'outcome'];
    if (!validTypes.includes(entry.type)) {
      console.error(`Invalid type: ${entry.type}`);
      return null;
    }
    
    // Set defaults
    return {
      id: entry.id || this.generateId(),
      type: entry.type,
      content: entry.content,
      embedding: entry.embedding || [],
      successRate: entry.successRate || 0,
      successCount: entry.successCount || 0,
      usageCount: entry.usageCount || 0,
      timestamp: entry.timestamp || new Date().toISOString(),
      metadata: entry.metadata || {},
      repository: entry.repository || 'default',
      tags: entry.tags || []
    };
  }

  updateStats() {
    const stats = this.memory.stats;
    
    stats.totalEntries = this.memory.entries.length;
    stats.issueEntries = this.memory.entries.filter(e => e.type === 'issue').length;
    stats.fixEntries = this.memory.entries.filter(e => e.type === 'fix').length;
    stats.patternEntries = this.memory.entries.filter(e => e.type === 'pattern').length;
    
    // Calculate average success rate
    const entriesWithSuccess = this.memory.entries.filter(e => e.successRate > 0);
    if (entriesWithSuccess.length > 0) {
      stats.averageSuccessRate = entriesWithSuccess.reduce((sum, e) => sum + e.successRate, 0) / entriesWithSuccess.length;
    }
    
    // Count entries from last week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    stats.lastWeekEntries = this.memory.entries.filter(e => new Date(e.timestamp) > oneWeekAgo).length;
    
    // Get top patterns
    stats.topPatterns = this.getTopPatterns();
    
    // Calculate memory size
    stats.memorySize = JSON.stringify(this.memory).length;
    
    this.memory.lastUpdated = new Date().toISOString();
  }

  getTopPatterns() {
    const patterns = this.memory.entries.filter(e => e.type === 'pattern');
    
    return patterns
      .sort((a, b) => (b.successRate || 0) - (a.successRate || 0))
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        content: p.content.substring(0, 100),
        successRate: p.successRate,
        usageCount: p.usageCount
      }));
  }

  cleanupOldEntries() {
    if (this.memory.entries.length <= this.maxEntries) return;
    
    // Sort by success rate and recency
    const sorted = this.memory.entries.sort((a, b) => {
      const scoreA = (a.successRate || 0) * 0.7 + this.getRecencyScore(a) * 0.3;
      const scoreB = (b.successRate || 0) * 0.7 + this.getRecencyScore(b) * 0.3;
      return scoreB - scoreA;
    });
    
    // Keep the best entries
    this.memory.entries = sorted.slice(0, this.maxEntries);
    
    // Update vector store
    const validIds = new Set(this.memory.entries.map(e => e.id));
    Object.keys(this.vectorStore).forEach(id => {
      if (!validIds.has(id)) {
        delete this.vectorStore[id];
      }
    });
    
    console.log(`🧹 Cleaned up old entries, kept ${this.memory.entries.length}`);
  }

  getRecencyScore(entry) {
    const daysSince = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - daysSince / 365); // Decay over a year
  }

  getMemory(id) {
    return this.memory.entries.find(entry => entry.id === id);
  }

  getAllMemories() {
    return this.memory.entries;
  }

  getMemoriesByType(type) {
    return this.memory.entries.filter(entry => entry.type === type);
  }

  getMemoriesByTag(tag) {
    return this.memory.entries.filter(entry => entry.tags && entry.tags.includes(tag));
  }

  getMemoriesByRepository(repository) {
    return this.memory.entries.filter(entry => entry.repository === repository);
  }

  updateMemorySuccess(id, success) {
    const entry = this.getMemory(id);
    if (!entry) return null;
    
    entry.usageCount = (entry.usageCount || 0) + 1;
    entry.successCount = (entry.successCount || 0) + (success ? 1 : 0);
    entry.successRate = entry.successCount / entry.usageCount;
    entry.lastUsed = new Date().toISOString();
    
    this.updateStats();
    this.saveMemory();
    
    return entry;
  }

  deleteMemory(id) {
    const index = this.memory.entries.findIndex(entry => entry.id === id);
    if (index === -1) return false;
    
    this.memory.entries.splice(index, 1);
    delete this.vectorStore[id];
    
    this.updateStats();
    this.saveMemory();
    this.saveVectorStore();
    
    return true;
  }

  searchMemories(query, options = {}) {
    const {
      type = null,
      repository = null,
      tags = null,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = options;
    
    let results = this.memory.entries;
    
    // Filter by type
    if (type) {
      results = results.filter(entry => entry.type === type);
    }
    
    // Filter by repository
    if (repository) {
      results = results.filter(entry => entry.repository === repository);
    }
    
    // Filter by tags
    if (tags && tags.length > 0) {
      results = results.filter(entry => 
        entry.tags && tags.some(tag => entry.tags.includes(tag))
      );
    }
    
    // Text search (simple keyword matching)
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(entry => 
        entry.content.toLowerCase().includes(queryLower) ||
        (entry.metadata && JSON.stringify(entry.metadata).toLowerCase().includes(queryLower))
      );
    }
    
    // Sort
    results.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'successRate':
          aValue = a.successRate || 0;
          bValue = b.successRate || 0;
          break;
        case 'usageCount':
          aValue = a.usageCount || 0;
          bValue = b.usageCount || 0;
          break;
        case 'timestamp':
        default:
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    // Limit
    return results.slice(0, limit);
  }

  getStats() {
    return {
      ...this.memory.stats,
      version: this.memory.version,
      lastUpdated: this.memory.lastUpdated,
      vectorStoreSize: Object.keys(this.vectorStore).length
    };
  }

  calculateCosineSimilarity(vecA, vecB) {
    if (vecA.length === 0 || vecB.length === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (normA * normB);
  }

  saveMemory() {
    try {
      fs.writeFileSync(this.memoryFile, JSON.stringify(this.memory, null, 2));
    } catch (error) {
      console.error('Error saving memory:', error.message);
    }
  }

  saveVectorStore() {
    try {
      fs.writeFileSync(this.vectorStoreFile, JSON.stringify(this.vectorStore, null, 2));
    } catch (error) {
      console.error('Error saving vector store:', error.message);
    }
  }

  exportMemory() {
    return {
      memory: this.memory,
      vectorStore: this.vectorStore,
      exportTimestamp: new Date().toISOString()
    };
  }

  importMemory(data) {
    try {
      if (data.memory) {
        this.memory = data.memory;
        this.saveMemory();
      }
      
      if (data.vectorStore) {
        this.vectorStore = data.vectorStore;
        this.saveVectorStore();
      }
      
      console.log('📥 Memory imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing memory:', error.message);
      return false;
    }
  }

  clearMemory() {
    this.memory = this.initializeMemory();
    this.vectorStore = {};
    this.saveMemory();
    this.saveVectorStore();
    console.log('🗑️ Memory cleared');
  }
}

module.exports = MemoryStore;
