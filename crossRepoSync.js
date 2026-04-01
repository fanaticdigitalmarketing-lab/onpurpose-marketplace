// 🌐 CROSS-REPOSITORY INTELLIGENCE SYNC
// Shares learning across multiple repositories

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CrossRepoSync {
  constructor() {
    this.centralStoreFile = 'centralMemory.json';
    this.localStoreFile = 'memory.json';
    this.syncConfigFile = 'syncConfig.json';
    this.conflictResolution = 'merge'; // 'merge', 'local', 'remote'
    
    this.syncConfig = this.loadSyncConfig();
  }

  loadSyncConfig() {
    try {
      if (fs.existsSync(this.syncConfigFile)) {
        return JSON.parse(fs.readFileSync(this.syncConfigFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading sync config:', error.message);
    }
    
    return this.initializeSyncConfig();
  }

  initializeSyncConfig() {
    const config = {
      repositoryId: this.generateRepositoryId(),
      lastSync: null,
      syncInterval: 3600000, // 1 hour in milliseconds
      autoSync: false,
      conflictResolution: 'merge',
      repositories: [],
      centralStore: {
        type: 'file', // 'file', 'git', 'api'
        location: this.centralStoreFile,
        backup: true
      }
    };
    
    this.saveSyncConfig(config);
    return config;
  }

  generateRepositoryId() {
    const hostname = require('os').hostname();
    const pid = process.pid;
    const random = crypto.randomBytes(8).toString('hex');
    
    return `repo_${hostname}_${pid}_${random}`;
  }

  saveSyncConfig(config = this.syncConfig) {
    try {
      fs.writeFileSync(this.syncConfigFile, JSON.stringify(config, null, 2));
      this.syncConfig = config;
    } catch (error) {
      console.error('Error saving sync config:', error.message);
    }
  }

  async syncWithCentralStore() {
    console.log('🌐 Starting sync with central store...');
    
    try {
      // Step 1: Load local memory
      const localMemory = this.loadLocalMemory();
      
      // Step 2: Load central store
      const centralMemory = await this.loadCentralStore();
      
      // Step 3: Merge memories
      const mergedMemory = await this.mergeMemories(localMemory, centralMemory);
      
      // Step 4: Update central store
      await this.updateCentralStore(mergedMemory);
      
      // Step 5: Update local memory
      this.updateLocalMemory(mergedMemory);
      
      // Step 6: Update sync config
      this.syncConfig.lastSync = new Date().toISOString();
      this.saveSyncConfig();
      
      console.log('✅ Sync completed successfully');
      
      return {
        success: true,
        localEntries: localMemory.entries.length,
        centralEntries: centralMemory.entries.length,
        mergedEntries: mergedMemory.entries.length,
        conflicts: this.getConflictCount(localMemory, centralMemory)
      };
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  loadLocalMemory() {
    try {
      if (fs.existsSync(this.localStoreFile)) {
        return JSON.parse(fs.readFileSync(this.localStoreFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading local memory:', error.message);
    }
    
    return { entries: [], lastUpdated: new Date().toISOString() };
  }

  async loadCentralStore() {
    const storeType = this.syncConfig.centralStore.type;
    
    switch (storeType) {
      case 'file':
        return this.loadFileStore();
      case 'git':
        return this.loadGitStore();
      case 'api':
        return this.loadApiStore();
      default:
        throw new Error(`Unknown store type: ${storeType}`);
    }
  }

  loadFileStore() {
    try {
      if (fs.existsSync(this.centralStoreFile)) {
        return JSON.parse(fs.readFileSync(this.centralStoreFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading file store:', error.message);
    }
    
    return { entries: [], lastUpdated: new Date().toISOString() };
  }

  async loadGitStore() {
    // Git-based store implementation
    console.log('📂 Loading from Git store...');
    
    try {
      const { execSync } = require('child_process');
      
      // Clone or pull the repository
      const repoPath = './central-memory-repo';
      const repoUrl = this.syncConfig.centralStore.location;
      
      if (!fs.existsSync(repoPath)) {
        console.log('📥 Cloning central repository...');
        execSync(`git clone ${repoUrl} ${repoPath}`, { stdio: 'inherit' });
      } else {
        console.log('📥 Pulling latest changes...');
        execSync('git pull', { cwd: repoPath, stdio: 'inherit' });
      }
      
      // Read the memory file
      const memoryFile = path.join(repoPath, 'memory.json');
      if (fs.existsSync(memoryFile)) {
        return JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
      }
      
    } catch (error) {
      console.error('Error loading Git store:', error.message);
    }
    
    return { entries: [], lastUpdated: new Date().toISOString() };
  }

  async loadApiStore() {
    // API-based store implementation
    console.log('🌐 Loading from API store...');
    
    try {
      const fetch = require('node-fetch');
      const apiUrl = this.syncConfig.centralStore.location;
      
      const response = await fetch(`${apiUrl}/memory`, {
        headers: {
          'Authorization': `Bearer ${process.env.CENTRAL_STORE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Error loading API store:', error.message);
    }
    
    return { entries: [], lastUpdated: new Date().toISOString() };
  }

  async mergeMemories(localMemory, centralMemory) {
    console.log('🔀 Merging memories...');
    
    const merged = {
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      repositories: [
        ...(centralMemory.repositories || []),
        this.syncConfig.repositoryId
      ],
      entries: [],
      stats: {
        totalEntries: 0,
        repositories: [],
        lastMerge: new Date().toISOString()
      }
    };
    
    // Create maps for efficient lookup
    const localMap = new Map();
    const centralMap = new Map();
    
    // Index local entries
    localMemory.entries?.forEach(entry => {
      const key = this.generateEntryKey(entry);
      localMap.set(key, { ...entry, source: 'local' });
    });
    
    // Index central entries
    centralMemory.entries?.forEach(entry => {
      const key = this.generateEntryKey(entry);
      centralMap.set(key, { ...entry, source: 'central' });
    });
    
    // Merge entries
    const allKeys = new Set([...localMap.keys(), ...centralMap.keys()]);
    
    for (const key of allKeys) {
      const localEntry = localMap.get(key);
      const centralEntry = centralMap.get(key);
      
      let mergedEntry;
      
      if (localEntry && centralEntry) {
        // Conflict resolution
        mergedEntry = this.resolveConflict(localEntry, centralEntry);
      } else if (localEntry) {
        mergedEntry = localEntry;
      } else {
        mergedEntry = centralEntry;
      }
      
      merged.entries.push(mergedEntry);
    }
    
    // Update stats
    merged.stats.totalEntries = merged.entries.length;
    merged.stats.repositories = [...new Set(merged.entries.map(e => e.repository))];
    
    console.log(`🔀 Merged ${merged.entries.length} entries`);
    
    return merged;
  }

  generateEntryKey(entry) {
    // Generate a key for deduplication based on content and type
    const content = entry.content || '';
    const type = entry.type || '';
    const tags = (entry.tags || []).sort().join(',');
    
    return crypto.createHash('md5')
      .update(`${type}:${content.substring(0, 200)}:${tags}`)
      .digest('hex');
  }

  resolveConflict(localEntry, centralEntry) {
    const resolution = this.syncConfig.conflictResolution;
    
    switch (resolution) {
      case 'local':
        console.log(`🔀 Conflict resolved: keeping local entry`);
        return this.mergeEntryData(localEntry, centralEntry, 'local');
        
      case 'remote':
        console.log(`🔀 Conflict resolved: keeping central entry`);
        return this.mergeEntryData(centralEntry, localEntry, 'central');
        
      case 'merge':
      default:
        console.log(`🔀 Conflict resolved: merging entries`);
        return this.mergeEntries(localEntry, centralEntry);
    }
  }

  mergeEntryData(primaryEntry, secondaryEntry, source) {
    return {
      ...primaryEntry,
      usageCount: (primaryEntry.usageCount || 0) + (secondaryEntry.usageCount || 0),
      successCount: (primaryEntry.successCount || 0) + (secondaryEntry.successCount || 0),
      repositories: [
        ...new Set([
          ...(primaryEntry.repositories || [primaryEntry.repository]),
          ...(secondaryEntry.repositories || [secondaryEntry.repository])
        ])
      ],
      lastMerged: new Date().toISOString(),
      mergeSource: source
    };
  }

  mergeEntries(localEntry, centralEntry) {
    // Intelligent merge of two entries
    const merged = {
      id: localEntry.id || centralEntry.id,
      type: localEntry.type || centralEntry.type,
      content: this.selectBestContent(localEntry, centralEntry),
      embedding: this.selectBestEmbedding(localEntry, centralEntry),
      successRate: this.calculateMergedSuccessRate(localEntry, centralEntry),
      usageCount: (localEntry.usageCount || 0) + (centralEntry.usageCount || 0),
      successCount: (localEntry.successCount || 0) + (centralEntry.successCount || 0),
      timestamp: this.selectEarliestTimestamp(localEntry, centralEntry),
      lastUpdated: new Date().toISOString(),
      repositories: [
        ...new Set([
          ...(localEntry.repositories || [localEntry.repository]),
          ...(centralEntry.repositories || [centralEntry.repository])
        ])
      ],
      tags: this.mergeTags(localEntry.tags, centralEntry.tags),
      metadata: this.mergeMetadata(localEntry.metadata, centralEntry.metadata)
    };
    
    return merged;
  }

  selectBestContent(localEntry, centralEntry) {
    // Select the better content based on length and success rate
    const localScore = this.calculateContentScore(localEntry);
    const centralScore = this.calculateContentScore(centralEntry);
    
    return localScore >= centralScore ? localEntry.content : centralEntry.content;
  }

  calculateContentScore(entry) {
    const length = entry.content ? entry.content.length : 0;
    const successRate = entry.successRate || 0;
    const usageCount = entry.usageCount || 0;
    
    return (length * 0.3) + (successRate * 100 * 0.5) + (usageCount * 0.2);
  }

  selectBestEmbedding(localEntry, centralEntry) {
    // Prefer the embedding with higher success rate
    if (localEntry.successRate >= centralEntry.successRate) {
      return localEntry.embedding;
    }
    return centralEntry.embedding;
  }

  calculateMergedSuccessRate(localEntry, centralEntry) {
    const totalSuccess = (localEntry.successCount || 0) + (centralEntry.successCount || 0);
    const totalUsage = (localEntry.usageCount || 0) + (centralEntry.usageCount || 0);
    
    return totalUsage > 0 ? totalSuccess / totalUsage : 0;
  }

  selectEarliestTimestamp(localEntry, centralEntry) {
    const localTime = new Date(localEntry.timestamp || 0).getTime();
    const centralTime = new Date(centralEntry.timestamp || 0).getTime();
    
    return localTime < centralTime ? localEntry.timestamp : centralEntry.timestamp;
  }

  mergeTags(localTags, centralTags) {
    const allTags = [
      ...(localTags || []),
      ...(centralTags || [])
    ];
    return [...new Set(allTags)];
  }

  mergeMetadata(localMetadata, centralMetadata) {
    return {
      ...(centralMetadata || {}),
      ...(localMetadata || {}),
      mergedAt: new Date().toISOString()
    };
  }

  getConflictCount(localMemory, centralMemory) {
    const localKeys = new Set();
    const centralKeys = new Set();
    
    localMemory.entries?.forEach(entry => {
      localKeys.add(this.generateEntryKey(entry));
    });
    
    centralMemory.entries?.forEach(entry => {
      centralKeys.add(this.generateEntryKey(entry));
    });
    
    let conflicts = 0;
    for (const key of localKeys) {
      if (centralKeys.has(key)) {
        conflicts++;
      }
    }
    
    return conflicts;
  }

  async updateCentralStore(memory) {
    const storeType = this.syncConfig.centralStore.type;
    
    switch (storeType) {
      case 'file':
        return this.updateFileStore(memory);
      case 'git':
        return this.updateGitStore(memory);
      case 'api':
        return this.updateApiStore(memory);
      default:
        throw new Error(`Unknown store type: ${storeType}`);
    }
  }

  updateFileStore(memory) {
    try {
      // Create backup if enabled
      if (this.syncConfig.centralStore.backup) {
        this.createBackup(this.centralStoreFile);
      }
      
      fs.writeFileSync(this.centralStoreFile, JSON.stringify(memory, null, 2));
      console.log('💾 Updated file store');
    } catch (error) {
      console.error('Error updating file store:', error.message);
      throw error;
    }
  }

  async updateGitStore(memory) {
    console.log('📤 Updating Git store...');
    
    try {
      const { execSync } = require('child_process');
      const repoPath = './central-memory-repo';
      
      // Write memory file
      const memoryFile = path.join(repoPath, 'memory.json');
      fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
      
      // Commit and push
      execSync('git add memory.json', { cwd: repoPath, stdio: 'inherit' });
      execSync(`git commit -m "Update memory - ${new Date().toISOString()}"`, { cwd: repoPath, stdio: 'inherit' });
      execSync('git push', { cwd: repoPath, stdio: 'inherit' });
      
      console.log('✅ Updated Git store');
    } catch (error) {
      console.error('Error updating Git store:', error.message);
      throw error;
    }
  }

  async updateApiStore(memory) {
    console.log('🌐 Updating API store...');
    
    try {
      const fetch = require('node-fetch');
      const apiUrl = this.syncConfig.centralStore.location;
      
      const response = await fetch(`${apiUrl}/memory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CENTRAL_STORE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memory)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      console.log('✅ Updated API store');
    } catch (error) {
      console.error('Error updating API store:', error.message);
      throw error;
    }
  }

  updateLocalMemory(memory) {
    try {
      fs.writeFileSync(this.localStoreFile, JSON.stringify(memory, null, 2));
      console.log('💾 Updated local memory');
    } catch (error) {
      console.error('Error updating local memory:', error.message);
      throw error;
    }
  }

  createBackup(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${filePath}.backup.${timestamp}`;
        fs.copyFileSync(filePath, backupPath);
        console.log(`💾 Created backup: ${backupPath}`);
      }
    } catch (error) {
      console.error('Error creating backup:', error.message);
    }
  }

  async enableAutoSync() {
    this.syncConfig.autoSync = true;
    this.saveSyncConfig();
    
    // Start auto-sync interval
    this.startAutoSync();
    
    console.log('🔄 Auto-sync enabled');
  }

  disableAutoSync() {
    this.syncConfig.autoSync = false;
    this.saveSyncConfig();
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    console.log('⏹️ Auto-sync disabled');
  }

  startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncWithCentralStore();
      } catch (error) {
        console.error('Auto-sync failed:', error.message);
      }
    }, this.syncConfig.syncInterval);
    
    console.log(`🔄 Auto-sync started (interval: ${this.syncConfig.syncInterval}ms)`);
  }

  getSyncStatus() {
    return {
      repositoryId: this.syncConfig.repositoryId,
      lastSync: this.syncConfig.lastSync,
      autoSync: this.syncConfig.autoSync,
      syncInterval: this.syncConfig.syncInterval,
      conflictResolution: this.syncConfig.conflictResolution,
      centralStore: this.syncConfig.centralStore
    };
  }

  setConflictResolution(resolution) {
    const validResolutions = ['merge', 'local', 'remote'];
    if (!validResolutions.includes(resolution)) {
      throw new Error(`Invalid resolution: ${resolution}`);
    }
    
    this.syncConfig.conflictResolution = resolution;
    this.saveSyncConfig();
    
    console.log(`⚙️ Conflict resolution set to: ${resolution}`);
  }

  setSyncInterval(interval) {
    this.syncConfig.syncInterval = Math.max(60000, interval); // Minimum 1 minute
    this.saveSyncConfig();
    
    if (this.syncConfig.autoSync) {
      this.startAutoSync();
    }
    
    console.log(`⏰ Sync interval set to: ${this.syncConfig.syncInterval}ms`);
  }

  async getRepositoryStats() {
    const localMemory = this.loadLocalMemory();
    
    return {
      repositoryId: this.syncConfig.repositoryId,
      localEntries: localMemory.entries?.length || 0,
      lastSync: this.syncConfig.lastSync,
      syncStatus: this.getSyncStatus()
    };
  }
}

module.exports = CrossRepoSync;
