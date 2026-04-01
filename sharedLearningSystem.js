// 🧬 MULTI-REPO SHARED LEARNING SYSTEM
// Share intelligence across multiple projects

const fs = require('fs');
const path = require('path');

class SharedLearningSystem {
  constructor() {
    this.sharedLearningFile = 'shared-learning.json';
    this.sharedData = this.loadSharedLearning();
  }

  loadSharedLearning() {
    try {
      if (fs.existsSync(this.sharedLearningFile)) {
        const data = fs.readFileSync(this.sharedLearningFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading shared learning:', error.message);
    }
    
    // Return default structure if file doesn't exist
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      ruleClusters: [],
      globalStats: {
        totalRules: 0,
        totalUsage: 0,
        averageSuccessRate: 0,
        contributingProjects: []
      }
    };
  }

  saveSharedLearning() {
    try {
      this.sharedData.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.sharedLearningFile, JSON.stringify(this.sharedData, null, 2));
      console.log('💾 Shared learning saved');
    } catch (error) {
      console.error('Error saving shared learning:', error.message);
    }
  }

  updateSharedLearning(newRule) {
    // Find similar existing rule cluster
    const existingCluster = this.findSimilarCluster(newRule);
    
    if (existingCluster) {
      // Update existing cluster
      this.updateCluster(existingCluster, newRule);
      console.log(`🔄 Updated shared cluster: ${newRule.type}`);
    } else {
      // Create new cluster
      this.createNewCluster(newRule);
      console.log(`🆕 Created new shared cluster: ${newRule.type}`);
    }
    
    // Update global stats
    this.updateGlobalStats();
    
    // Save to file
    this.saveSharedLearning();
    
    return existingCluster || this.sharedData.ruleClusters[this.sharedData.ruleClusters.length - 1];
  }

  findSimilarCluster(newRule) {
    return this.sharedData.ruleClusters.find(cluster => {
      if (cluster.type !== newRule.type) return false;
      
      const patternSimilarity = this.calculatePatternSimilarity(cluster.patterns, newRule.pattern);
      const fixSimilarity = this.calculateFixSimilarity(cluster.fixes, newRule.action);
      
      return patternSimilarity > 0.7 && fixSimilarity > 0.8;
    });
  }

  calculatePatternSimilarity(patterns1, pattern2) {
    if (!patterns1 || !patterns2) return 0;
    
    const words1 = new Set(patterns1.toLowerCase().split(/\s+/));
    const words2 = new Set(pattern2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  calculateFixSimilarity(fixes1, fix2) {
    if (!fixes1 || !fix2) return 0;
    
    // Use the most similar fix from the cluster
    let maxSimilarity = 0;
    
    fixes1.forEach(fix1 => {
      const similarity = this.calculateTextSimilarity(fix1, fix2);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    });
    
    return maxSimilarity;
  }

  calculateTextSimilarity(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  updateCluster(cluster, newRule) {
    // Update patterns
    if (newRule.pattern && !cluster.patterns.includes(newRule.pattern)) {
      cluster.patterns.push(newRule.pattern);
    }
    
    // Update fixes
    if (newRule.action && !cluster.fixes.includes(newRule.action)) {
      cluster.fixes.push(newRule.action);
    }
    
    // Update usage count
    cluster.usageCount = (cluster.usageCount || 0) + 1;
    
    // Update success rate (weighted average)
    const oldWeight = cluster.usageCount - 1;
    const newWeight = 1;
    const oldSuccessRate = cluster.successRate || 0;
    const newSuccessRate = newRule.successRate || 0;
    
    cluster.successRate = (oldSuccessRate * oldWeight + newSuccessRate * newWeight) / cluster.usageCount;
    
    // Update last used
    cluster.lastUsed = new Date().toISOString();
    
    // Add to contributing projects if not present
    if (cluster.contributingProjects && !cluster.contributingProjects.includes(process.cwd())) {
      cluster.contributingProjects.push(process.cwd());
    }
  }

  createNewCluster(newRule) {
    const cluster = {
      id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: newRule.type,
      patterns: newRule.pattern ? [newRule.pattern] : [],
      fixes: newRule.action ? [newRule.action] : [],
      successRate: newRule.successRate || 0,
      usageCount: 1,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      contributingProjects: [process.cwd()],
      metadata: {
        firstSeenIn: path.basename(process.cwd()),
        evolution: 'new'
      }
    };
    
    this.sharedData.ruleClusters.push(cluster);
  }

  mergeWithLocalRules(localRules) {
    console.log(`🔄 Merging ${localRules.length} local rules with shared learning`);
    
    const mergedRules = [];
    const usedClusterIds = new Set();
    
    // First, merge local rules into shared learning
    localRules.forEach(localRule => {
      const updatedCluster = this.updateSharedLearning(localRule);
      usedClusterIds.add(updatedCluster.id);
      
      // Create merged rule for local use
      const mergedRule = this.createMergedRule(localRule, updatedCluster);
      mergedRules.push(mergedRule);
    });
    
    // Then, add any shared rules that don't have local equivalents
    this.sharedData.ruleClusters.forEach(sharedCluster => {
      if (!usedClusterIds.has(sharedCluster.id)) {
        const sharedRule = this.createRuleFromCluster(sharedCluster);
        mergedRules.push(sharedRule);
      }
    });
    
    console.log(`📊 Merged result: ${mergedRules.length} total rules`);
    
    return mergedRules;
  }

  createMergedRule(localRule, sharedCluster) {
    return {
      id: localRule.id || `merged_${Date.now()}`,
      type: localRule.type,
      pattern: localRule.pattern || sharedCluster.patterns[0],
      action: localRule.action || sharedCluster.fixes[0],
      successRate: sharedCluster.successRate, // Use global success rate
      usageCount: sharedCluster.usageCount,
      createdAt: localRule.createdAt || sharedCluster.createdAt,
      lastUsed: new Date().toISOString(),
      source: 'merged',
      sharedClusterId: sharedCluster.id,
      metadata: {
        localSuccessRate: localRule.successRate,
        globalSuccessRate: sharedCluster.successRate,
        improvement: sharedCluster.successRate > (localRule.successRate || 0)
      }
    };
  }

  createRuleFromCluster(cluster) {
    return {
      id: `shared_${cluster.id}`,
      type: cluster.type,
      pattern: cluster.patterns[0],
      action: cluster.fixes[0],
      successRate: cluster.successRate,
      usageCount: cluster.usageCount,
      createdAt: cluster.createdAt,
      lastUsed: cluster.lastUsed,
      source: 'shared',
      sharedClusterId: cluster.id,
      metadata: {
        contributingProjects: cluster.contributingProjects,
        evolution: cluster.metadata.evolution,
        firstSeenIn: cluster.metadata.firstSeenIn
      }
    };
  }

  updateGlobalStats() {
    const clusters = this.sharedData.ruleClusters;
    
    this.sharedData.globalStats = {
      totalRules: clusters.length,
      totalUsage: clusters.reduce((sum, cluster) => sum + (cluster.usageCount || 0), 0),
      averageSuccessRate: clusters.reduce((sum, cluster) => sum + (cluster.successRate || 0), 0) / clusters.length,
      contributingProjects: [...new Set(clusters.flatMap(cluster => cluster.contributingProjects || []))]
    };
  }

  getBestFixForIssue(issueType) {
    const clusters = this.sharedData.ruleClusters.filter(cluster => cluster.type === issueType);
    
    if (clusters.length === 0) return null;
    
    // Sort by success rate and usage count
    clusters.sort((a, b) => {
      const scoreA = (a.successRate || 0) * Math.log(a.usageCount || 1);
      const scoreB = (b.successRate || 0) * Math.log(b.usageCount || 1);
      return scoreB - scoreA;
    });
    
    return clusters[0];
  }

  getLearningInsights() {
    const insights = {
      topPerformingClusters: [],
      underperformingClusters: [],
      mostUsedTypes: {},
      recentActivity: []
    };
    
    // Sort clusters by performance
    const sortedClusters = [...this.sharedData.ruleClusters].sort((a, b) => (b.successRate || 0) - (a.successRate || 0));
    
    insights.topPerformingClusters = sortedClusters.slice(0, 5).map(cluster => ({
      type: cluster.type,
      successRate: cluster.successRate,
      usageCount: cluster.usageCount,
      contributingProjects: cluster.contributingProjects?.length || 0
    }));
    
    insights.underperformingClusters = sortedClusters.slice(-5).map(cluster => ({
      type: cluster.type,
      successRate: cluster.successRate,
      usageCount: cluster.usageCount,
      needsImprovement: true
    }));
    
    // Count usage by type
    this.sharedData.ruleClusters.forEach(cluster => {
      insights.mostUsedTypes[cluster.type] = (insights.mostUsedTypes[cluster.type] || 0) + (cluster.usageCount || 0);
    });
    
    // Sort by usage
    insights.mostUsedTypes = Object.entries(insights.mostUsedTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [type, count]) => ({ ...obj, [type]: count }), {});
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    insights.recentActivity = this.sharedData.ruleClusters
      .filter(cluster => new Date(cluster.lastUsed) > sevenDaysAgo)
      .map(cluster => ({
        type: cluster.type,
        lastUsed: cluster.lastUsed,
        usageCount: cluster.usageCount
      }));
    
    return insights;
  }

  exportSharedLearning() {
    return {
      ...this.sharedData,
      insights: this.getLearningInsights(),
      exportTimestamp: new Date().toISOString()
    };
  }

  importSharedLearning(data) {
    // Validate imported data
    if (!data.ruleClusters || !Array.isArray(data.ruleClusters)) {
      throw new Error('Invalid shared learning data format');
    }
    
    // Merge with existing data
    data.ruleClusters.forEach(importedCluster => {
      const existingCluster = this.sharedData.ruleClusters.find(cluster => cluster.id === importedCluster.id);
      
      if (existingCluster) {
        // Update existing cluster with imported data
        this.updateCluster(existingCluster, importedCluster);
      } else {
        // Add new cluster
        this.sharedData.ruleClusters.push(importedCluster);
      }
    });
    
    this.updateGlobalStats();
    this.saveSharedLearning();
    
    console.log(`📥 Imported ${data.ruleClusters.length} rule clusters`);
  }

  generateReport() {
    const stats = this.sharedData.globalStats;
    const insights = this.getLearningInsights();
    
    return {
      summary: {
        totalClusters: this.sharedData.ruleClusters.length,
        totalUsage: stats.totalUsage,
        averageSuccessRate: stats.averageSuccessRate,
        contributingProjects: stats.contributingProjects.length
      },
      insights,
      clusters: this.sharedData.ruleClusters.map(cluster => ({
        id: cluster.id,
        type: cluster.type,
        successRate: cluster.successRate,
        usageCount: cluster.usageCount,
        lastUsed: cluster.lastUsed,
        contributingProjects: cluster.contributingProjects?.length || 0
      }))
    };
  }
}

module.exports = SharedLearningSystem;
